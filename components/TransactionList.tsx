import React from 'react';
import { Transaction } from '../types';
import { Trash2, ArrowUpRight, ArrowDownLeft, CreditCard, Banknote } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">No transactions found for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Transactions</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {transactions.map((t) => (
          <div key={t.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
            <div className="flex items-center space-x-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  {t.categoryName}
                  <span className={`text-xs font-normal px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                    t.paymentMethod === 'cash' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {t.paymentMethod === 'cash' ? <Banknote size={10} /> : <CreditCard size={10} />}
                    {t.paymentMethod === 'cash' ? 'Cash' : 'Online'}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {t.date} {t.note && `• ${t.note}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`font-semibold ${
                t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'
              }`}>
                {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
              </span>
              <button
                onClick={() => onDelete(t.id)}
                className="p-2 text-gray-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Delete transaction"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};