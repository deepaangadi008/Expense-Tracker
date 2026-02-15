import React from 'react';

function TransactionList({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return <div className="text-center text-gray-500 py-8">No transactions yet.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-gray-700 dark:text-white font-semibold">Title</th>
            <th className="px-6 py-3 text-left text-gray-700 dark:text-white font-semibold">Category</th>
            <th className="px-6 py-3 text-left text-gray-700 dark:text-white font-semibold">Amount</th>
            <th className="px-6 py-3 text-left text-gray-700 dark:text-white font-semibold">Type</th>
            <th className="px-6 py-3 text-left text-gray-700 dark:text-white font-semibold">Date</th>
            <th className="px-6 py-3 text-center text-gray-700 dark:text-white font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-3 text-gray-800 dark:text-gray-200">{tx.title}</td>
              <td className="px-6 py-3 text-gray-800 dark:text-gray-200">{tx.category || 'General'}</td>
              <td className={`px-6 py-3 font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${tx.amount.toFixed(2)}
                {tx.sourceRecurringId && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    Recurring
                  </span>
                )}
              </td>
              <td className="px-6 py-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${tx.type === 'income' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400'}`}>
                  {tx.type}
                </span>
              </td>
              <td className="px-6 py-3 text-gray-800 dark:text-gray-200">
                {new Date(tx.date).toLocaleString([], {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-6 py-3 text-center">
                <button
                  onClick={() => onDelete(tx._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
