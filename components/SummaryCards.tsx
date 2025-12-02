import React, { useState } from 'react';
import { SummaryStats } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Edit2, Check, X } from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
  totalCash: number;
  onUpdateCash: (newAmount: number) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, totalCash, onUpdateCash }) => {
  const [isEditingCash, setIsEditingCash] = useState(false);
  const [editCashValue, setEditCashValue] = useState(totalCash.toString());

  const handleSaveCash = () => {
    const val = parseFloat(editCashValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateCash(val);
    }
    setIsEditingCash(false);
  };

  const startEdit = () => {
    setEditCashValue(totalCash.toFixed(2));
    setIsEditingCash(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Income */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly Income</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              +₹{stats.totalIncome.toFixed(2)}
            </h3>
          </div>
          <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Expense */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly Expense</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              -₹{stats.totalExpense.toFixed(2)}
            </h3>
          </div>
          <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-rose-600" />
          </div>
        </div>
      </div>

      {/* Monthly Balance */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly Balance</p>
            <h3 className={`text-2xl font-bold mt-1 ${stats.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              ₹{stats.balance.toFixed(2)}
            </h3>
          </div>
          <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Total Cash (Editable) */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-sm p-6 border border-gray-700 text-white relative group">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
              Current Cash
              {!isEditingCash && (
                <button onClick={startEdit} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white">
                  <Edit2 size={14} />
                </button>
              )}
            </p>
            
            {isEditingCash ? (
              <div className="flex items-center mt-1 gap-2">
                <span className="text-xl font-bold">₹</span>
                <input 
                  type="number" 
                  value={editCashValue}
                  onChange={(e) => setEditCashValue(e.target.value)}
                  className="bg-gray-700 text-white text-xl font-bold w-full rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button onClick={handleSaveCash} className="p-1 bg-emerald-600 rounded hover:bg-emerald-500">
                  <Check size={16} />
                </button>
                <button onClick={() => setIsEditingCash(false)} className="p-1 bg-rose-600 rounded hover:bg-rose-500">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <h3 className="text-2xl font-bold mt-1">
                ₹{totalCash.toFixed(2)}
              </h3>
            )}
          </div>
          {!isEditingCash && (
            <div className="h-12 w-12 bg-gray-700 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};