import React, { useState, useEffect } from 'react';
import { Investment, InvestmentType } from '../types';
import { storageService } from '../services/storageService';
import { TrendingUp, Plus, Trash2, DollarSign, Briefcase } from 'lucide-react';

interface InvestmentPortfolioProps {
  userId: string;
  totalLiquidity: number; // This is (Initial Cash + Lifetime Income - Lifetime Expense - Special Expenses)
}

const INVESTMENT_TYPES: InvestmentType[] = ['FD', 'Mutual Fund', 'Stock', 'Gold', 'Real Estate', 'Crypto', 'Other'];

export const InvestmentPortfolio: React.FC<InvestmentPortfolioProps> = ({ userId, totalLiquidity }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<InvestmentType>('Mutual Fund');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadData = () => {
    setInvestments(storageService.getInvestments(userId));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    storageService.addInvestment({
        userId,
        name,
        type,
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0]
    });

    setName('');
    setAmount('');
    setIsAdding(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    storageService.deleteInvestment(id);
    loadData();
  };

  const totalPortfolioValue = investments.reduce((acc, curr) => acc + curr.amount, 0);
  
    // Accumulated Savings shows liquid assets only (cash + bank surplus).
    // Do NOT include investments here so adding an investment does NOT change this number.
    const accumulatedSavings = totalLiquidity;

  return (
    <div className="space-y-8">
        {/* Master Components Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accumulated Savings (Net Worth) */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-sm font-medium text-gray-500">Accumulated Savings</p>
                    <h3 className={`text-2xl font-bold mt-1 ${accumulatedSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        ₹{accumulatedSavings.toFixed(2)}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Total Net Worth (Cash + Investments)</p>
                </div>
                <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center relative z-10">
                    <DollarSign className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50"></div>
            </div>

            {/* Portfolio Value */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹{totalPortfolioValue.toFixed(2)}</h3>
                    <p className="text-xs text-gray-400 mt-1">Total Investments</p>
                </div>
                <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center relative z-10">
                    <Briefcase className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50"></div>
            </div>
        </div>

        {/* Investment Manager */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Your Investments</h3>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    Add Investment
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="p-6 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. SBI Bluechip"
                            className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                        <select 
                            value={type}
                            onChange={(e) => setType(e.target.value as InvestmentType)}
                            className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                        <input 
                            type="number" 
                            required
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                            Save
                        </button>
                    </div>
                </form>
            )}

            <div className="divide-y divide-gray-100">
                {investments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No investments added yet.
                    </div>
                ) : (
                    investments.map(inv => (
                        <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{inv.name}</p>
                                    <p className="text-xs text-gray-500">{inv.type} • {inv.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-bold text-gray-900">₹{inv.amount.toFixed(2)}</span>
                                <button 
                                    onClick={() => handleDelete(inv.id)}
                                    className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};