const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const getCurrentBudget = async (req, res) => {
  try {
    const now = new Date();
    const monthKey = getMonthKey(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [budget, monthTransactions] = await Promise.all([
      Budget.findOne({ user: req.user._id, monthKey }),
      Transaction.find({
        user: req.user._id,
        type: 'expense',
        date: { $gte: monthStart, $lt: monthEnd },
      }),
    ]);

    const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const amount = budget?.amount || 0;

    res.json({
      monthKey,
      amount,
      spent,
      remaining: amount - spent,
      exceeded: amount > 0 && spent > amount,
      alertLevel: amount === 0 ? 'none' : spent >= amount ? 'danger' : spent >= amount * 0.8 ? 'warning' : 'safe',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch budget' });
  }
};

const upsertCurrentBudget = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: 'Budget amount must be a non-negative number' });
    }

    const now = new Date();
    const monthKey = getMonthKey(now);

    await Budget.findOneAndUpdate(
      { user: req.user._id, monthKey },
      { amount },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return getCurrentBudget(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save budget' });
  }
};

module.exports = { getCurrentBudget, upsertCurrentBudget };
