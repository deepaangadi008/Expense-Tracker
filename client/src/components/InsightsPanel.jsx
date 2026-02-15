import React from 'react';

function InsightsPanel({ monthlyIncome, monthlyExpense, topExpenseCategory, totalTransactions }) {
  const savingsRate = monthlyIncome > 0
    ? (((monthlyIncome - monthlyExpense) / monthlyIncome) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Smart Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/40 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">This Month Income</p>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">${monthlyIncome.toFixed(2)}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/40 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">This Month Expense</p>
          <p className="text-xl font-bold text-orange-700 dark:text-orange-300">${monthlyExpense.toFixed(2)}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/40 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Savings Rate</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{savingsRate}%</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Top Expense Category</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {topExpenseCategory || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{totalTransactions} shown records</p>
        </div>
      </div>
    </div>
  );
}

export default InsightsPanel;
