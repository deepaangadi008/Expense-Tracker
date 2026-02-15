const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const addInterval = (date, frequency) => {
  const next = new Date(date);
  if (frequency === 'weekly') next.setDate(next.getDate() + 7);
  if (frequency === 'monthly') next.setMonth(next.getMonth() + 1);
  if (frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
  return next;
};

// @desc    Add new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  const { title, amount, type, date, category, isRecurring, recurringFrequency } = req.body;
  if (!title || !amount || !type || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (isRecurring && !recurringFrequency) {
    return res.status(400).json({ message: 'Recurring frequency is required' });
  }

  try {
    const txDate = new Date(date);
    const frequency = isRecurring ? recurringFrequency : null;
    const tx = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category: category || 'General',
      date: txDate,
      isRecurringTemplate: !!isRecurring,
      recurringFrequency: frequency,
      nextRecurringDate: frequency ? addInterval(txDate, frequency) : null,
    });
    res.status(201).json(tx);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add transaction' });
  }
};

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    await Transaction.deleteOne({ _id: tx._id });
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

// @desc    Summary (income/expense/balance)
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthlyExpense = transactions
      .filter((t) => t.type === 'expense' && new Date(t.date) >= monthStart && new Date(t.date) < monthEnd)
      .reduce((sum, t) => sum + t.amount, 0);

    const budget = await Budget.findOne({ user: req.user._id, monthKey: getMonthKey(now) });
    const budgetAmount = budget?.amount || 0;

    res.json({
      income,
      expense,
      balance: income - expense,
      budgetAmount,
      monthlyExpense,
      budgetExceeded: budgetAmount > 0 && monthlyExpense > budgetAmount,
      budgetRemaining: budgetAmount > 0 ? budgetAmount - monthlyExpense : 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute summary' });
  }
};

// @desc    Generate due recurring transactions
// @route   POST /api/transactions/generate-recurring
// @access  Private
const generateRecurringTransactions = async (req, res) => {
  try {
    const now = new Date();
    const templates = await Transaction.find({
      user: req.user._id,
      isRecurringTemplate: true,
    });

    let generatedCount = 0;
    let processedTemplates = 0;
    let skippedTemplates = 0;

    for (const template of templates) {
      if (!template.recurringFrequency) {
        skippedTemplates += 1;
        continue;
      }

      let runDate = template.nextRecurringDate
        ? new Date(template.nextRecurringDate)
        : addInterval(new Date(template.date), template.recurringFrequency);

      if (Number.isNaN(runDate.getTime())) {
        skippedTemplates += 1;
        continue;
      }

      processedTemplates += 1;
      while (runDate <= now) {
        await Transaction.create({
          user: req.user._id,
          title: template.title,
          amount: template.amount,
          type: template.type,
          category: template.category || 'General',
          date: runDate,
          isRecurringTemplate: false,
          recurringFrequency: null,
          nextRecurringDate: null,
          sourceRecurringId: template._id,
        });
        generatedCount += 1;
        runDate = addInterval(runDate, template.recurringFrequency);
      }

      template.nextRecurringDate = runDate;
      await template.save();
    }

    res.json({ generatedCount, processedTemplates, skippedTemplates });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate recurring transactions' });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  getSummary,
  generateRecurringTransactions,
};
