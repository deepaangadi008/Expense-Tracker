import React from 'react';

function SummaryCard({ income, expense, balance }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow">
        <p className="text-gray-700 dark:text-gray-300 font-semibold">Income</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">${income.toFixed(2)}</p>
      </div>
      <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow">
        <p className="text-gray-700 dark:text-gray-300 font-semibold">Expense</p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">${expense.toFixed(2)}</p>
      </div>
      <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg shadow">
        <p className="text-gray-700 dark:text-gray-300 font-semibold">Balance</p>
        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
          ${balance.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default SummaryCard;
