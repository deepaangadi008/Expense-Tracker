import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ChartSection from '../components/ChartSection';
import InsightsPanel from '../components/InsightsPanel';
import { transactionAPI, budgetAPI, profileAPI } from '../services/api';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const safeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [budgetInfo, setBudgetInfo] = useState({
    monthKey: '',
    amount: 0,
    spent: 0,
    remaining: 0,
    exceeded: false,
    alertLevel: 'none',
  });
  const [budgetInput, setBudgetInput] = useState('');
  const [recurringSyncing, setRecurringSyncing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, budgetRes, profileRes] = await Promise.all([
        transactionAPI.getAll(),
        budgetAPI.getCurrent(),
        profileAPI.get(),
      ]);

      setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
      setBudgetInfo({
        monthKey: budgetRes.data?.monthKey || '',
        amount: toNumber(budgetRes.data?.amount),
        spent: toNumber(budgetRes.data?.spent),
        remaining: toNumber(budgetRes.data?.remaining),
        exceeded: !!budgetRes.data?.exceeded,
        alertLevel: budgetRes.data?.alertLevel || 'none',
      });
      setBudgetInput(String(toNumber(budgetRes.data?.amount) || ''));
      setProfileForm({
        name: profileRes.data?.name || '',
        email: profileRes.data?.email || '',
        password: '',
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const name = profileForm.name.trim();
    const email = profileForm.email.trim();

    if (!name || !email) {
      setError('Profile name and email are required');
      return;
    }

    try {
      setProfileSaving(true);
      const payload = {
        name,
        email,
      };
      if (profileForm.password.trim()) {
        payload.password = profileForm.password.trim();
      }

      const res = await profileAPI.update(payload);
      setProfileForm({
        name: res.data?.name || name,
        email: res.data?.email || email,
        password: '',
      });
      setError('');
      setActionMessage('Profile saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddTransaction = async (formData) => {
    try {
      setError('');
      setActionMessage('');

      const res = await transactionAPI.add(formData);
      const createdTransaction = res?.data;

      if (createdTransaction && createdTransaction._id) {
        setTransactions((prev) => [createdTransaction, ...prev]);
      }

      setActionMessage('Transaction added successfully.');

      try {
        const budgetRes = await budgetAPI.getCurrent();
        setBudgetInfo({
          monthKey: budgetRes.data?.monthKey || '',
          amount: toNumber(budgetRes.data?.amount),
          spent: toNumber(budgetRes.data?.spent),
          remaining: toNumber(budgetRes.data?.remaining),
          exceeded: !!budgetRes.data?.exceeded,
          alertLevel: budgetRes.data?.alertLevel || 'none',
        });
      } catch (budgetErr) {
        // Transaction add succeeded; keep UI usable even if budget refresh fails.
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add transaction';
      setError(message);
      throw err;
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Delete this transaction?')) {
      return;
    }

    try {
      await transactionAPI.delete(id);
      setActionMessage('Transaction deleted.');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleSetBudget = async () => {
    const amount = Number(budgetInput);
    if (Number.isNaN(amount) || amount < 0) {
      setError('Budget must be a non-negative number');
      return;
    }

    try {
      const res = await budgetAPI.setCurrent(amount);
      const nextAmount = toNumber(res.data?.amount);
      setBudgetInfo({
        monthKey: res.data?.monthKey || '',
        amount: nextAmount,
        spent: toNumber(res.data?.spent),
        remaining: toNumber(res.data?.remaining),
        exceeded: !!res.data?.exceeded,
        alertLevel: res.data?.alertLevel || 'none',
      });
      setActionMessage(`Monthly budget saved: $${nextAmount.toFixed(2)}`);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleRecurringSync = async () => {
    try {
      setRecurringSyncing(true);
      const res = await transactionAPI.generateRecurring();
      const count = toNumber(res.data?.generatedCount);
      const processed = toNumber(res.data?.processedTemplates);
      const skipped = toNumber(res.data?.skippedTemplates);

      setActionMessage(
        count > 0
          ? `Recurring sync complete. ${count} transaction(s) generated from ${processed} template(s).`
          : `Recurring sync complete. No due transactions. Templates checked: ${processed}${skipped ? `, skipped: ${skipped}` : ''}.`
      );
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to run recurring transactions');
    } finally {
      setRecurringSyncing(false);
    }
  };

  const categories = useMemo(() => {
    const unique = new Set(transactions.map((tx) => tx.category || 'General'));
    return ['all', ...Array.from(unique)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = filters.search.toLowerCase().trim();
    const startDate = filters.startDate ? new Date(`${filters.startDate}T00:00:00`) : null;
    const endDate = filters.endDate ? new Date(`${filters.endDate}T23:59:59.999`) : null;

    return transactions.filter((tx) => {
      const txDate = safeDate(tx.date);
      const txTitle = String(tx.title || '').toLowerCase();
      const txCategory = tx.category || 'General';

      const matchesSearch = !normalizedSearch || txTitle.includes(normalizedSearch);
      const matchesType = filters.type === 'all' || tx.type === filters.type;
      const matchesCategory = filters.category === 'all' || txCategory === filters.category;
      const matchesStartDate = !startDate || (txDate && txDate >= startDate);
      const matchesEndDate = !endDate || (txDate && txDate <= endDate);

      return matchesSearch && matchesType && matchesCategory && matchesStartDate && matchesEndDate;
    });
  }, [transactions, filters]);

  const filteredSummary = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + toNumber(t.amount), 0);
    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + toNumber(t.amount), 0);

    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const monthlyInsights = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonth = filteredTransactions.filter((t) => {
      const d = safeDate(t.date);
      return d && d >= monthStart;
    });

    const monthlyIncome = thisMonth
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + toNumber(t.amount), 0);
    const monthlyExpense = thisMonth
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + toNumber(t.amount), 0);

    const expenseCategoryTotals = {};
    thisMonth
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const category = t.category || 'General';
        expenseCategoryTotals[category] = (expenseCategoryTotals[category] || 0) + toNumber(t.amount);
      });

    let topExpenseCategory = null;
    let topAmount = 0;
    Object.entries(expenseCategoryTotals).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topAmount = amount;
        topExpenseCategory = category;
      }
    });

    return { monthlyIncome, monthlyExpense, topExpenseCategory };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const exportCSV = () => {
    if (filteredTransactions.length === 0) {
      setError('No matching transactions to export. Clear filters or add data first.');
      return;
    }

    try {
      const headers = ['Title', 'Category', 'Type', 'Amount', 'Date'];
      const rows = filteredTransactions.map((tx) => {
        const amount = toNumber(tx.amount).toFixed(2);
        const date = safeDate(tx.date);
        const formattedDate = date ? date.toLocaleString() : '';

        return [
          tx.title || '',
          tx.category || 'General',
          tx.type || '',
          amount,
          formattedDate,
        ];
      });

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

      const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setError('');
      setActionMessage(`CSV exported with ${filteredTransactions.length} record(s).`);
    } catch (err) {
      setError('Failed to export CSV. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar profileName={profileForm.name} profileEmail={profileForm.email} />

      <div className="max-w-6xl mx-auto p-6">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {actionMessage && <div className="mb-4 p-3 bg-emerald-100 text-emerald-700 rounded">{actionMessage}</div>}

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">User Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              type="email"
              placeholder="Email"
              value={profileForm.email}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              type="password"
              placeholder="New password (optional)"
              value={profileForm.password}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, password: e.target.value }))}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              disabled={profileSaving}
              onClick={handleSaveProfile}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded font-semibold"
            >
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        <SummaryCard income={filteredSummary.income} expense={filteredSummary.expense} balance={filteredSummary.balance} />

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Monthly Budget ({budgetInfo.monthKey || 'Current'})</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Spent: ${toNumber(budgetInfo.spent).toFixed(2)} | Budget: ${toNumber(budgetInfo.amount).toFixed(2)} | Remaining: ${toNumber(budgetInfo.remaining).toFixed(2)}
              </p>
              {budgetInfo.alertLevel === 'danger' && (
                <p className="mt-2 text-sm font-semibold text-red-700 dark:text-red-300">Alert: You exceeded your monthly budget.</p>
              )}
              {budgetInfo.alertLevel === 'warning' && (
                <p className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300">Warning: You used more than 80% of your monthly budget.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Set budget"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSetBudget}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold"
              >
                Save Budget
              </button>
              <button
                type="button"
                onClick={handleRecurringSync}
                disabled={recurringSyncing}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-4 py-2 rounded font-semibold"
              >
                {recurringSyncing ? 'Syncing...' : 'Run Recurring'}
              </button>
            </div>
          </div>
        </div>

        <InsightsPanel
          monthlyIncome={monthlyInsights.monthlyIncome}
          monthlyExpense={monthlyInsights.monthlyExpense}
          topExpenseCategory={monthlyInsights.topExpenseCategory}
          totalTransactions={filteredTransactions.length}
        />

        <ChartSection transactions={transactions} />

        <TransactionForm onSubmit={handleAddTransaction} />

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Search by title"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded font-semibold"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={exportCSV}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded font-semibold"
            >
              CSV
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Transaction History</h2>
        <TransactionList
          transactions={filteredTransactions}
          onDelete={handleDeleteTransaction}
        />
      </div>
    </div>
  );
}

export default Dashboard;

