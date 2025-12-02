import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types';

interface FinancialChartProps {
  transactions: Transaction[];
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  // Group by date (last 10 active days for simplicity in this view)
  const processData = () => {
    const map = new Map<string, { date: string; income: number; expense: number }>();
    
    transactions.forEach(t => {
        const day = t.date.substring(5); // MM-DD
        const current = map.get(day) || { date: day, income: 0, expense: 0 };
        if (t.type === 'income') {
            current.income += t.amount;
        } else {
            current.expense += t.amount;
        }
        map.set(day, current);
    });

    return Array.from(map.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-10);
  };

  const data = processData();

  if (data.length === 0) {
      return (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl">
              No data to visualize yet.
          </div>
      );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-96">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Income vs Expense Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} prefix="₹" />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            formatter={(value: number) => [`₹${value.toFixed(2)}`, '']}
          />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
          <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};