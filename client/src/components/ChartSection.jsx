import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString([], { month: 'short', year: 'numeric' });
};

function ChartSection({ transactions }) {
  const validTransactions = useMemo(() => {
    return (transactions || []).filter((tx) => {
      const date = new Date(tx.date);
      return !Number.isNaN(date.getTime());
    });
  }, [transactions]);

  const totals = useMemo(() => {
    const income = validTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

    const expense = validTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

    return { income, expense };
  }, [validTransactions]);

  const pieData = useMemo(() => {
    const total = totals.income + totals.expense;
    if (total === 0) {
      return [];
    }
    return [
      { name: 'Income', value: totals.income },
      { name: 'Expense', value: totals.expense },
    ];
  }, [totals]);

  const monthlyCurveData = useMemo(() => {
    const map = {};

    validTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      const monthKey = toMonthKey(date);

      if (!map[monthKey]) {
        map[monthKey] = {
          monthKey,
          month: formatMonthLabel(monthKey),
          income: 0,
          expense: 0,
        };
      }

      const amount = toNumber(tx.amount);
      if (tx.type === 'income') {
        map[monthKey].income += amount;
      } else if (tx.type === 'expense') {
        map[monthKey].expense += amount;
      }
    });

    return Object.values(map)
      .sort((a, b) => (a.monthKey > b.monthKey ? 1 : -1))
      .map((item) => ({
        month: item.month,
        income: item.income,
        expense: item.expense,
        balance: item.income - item.expense,
      }));
  }, [validTransactions]);

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6 mb-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Income vs Expense</h3>
        {pieData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No data to display</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${toNumber(value).toFixed(2)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${toNumber(value).toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Whole Month Graphical Curve (Month-wise)</h3>
        {monthlyCurveData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No month-wise data to display.</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyCurveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${toNumber(value).toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default ChartSection;
