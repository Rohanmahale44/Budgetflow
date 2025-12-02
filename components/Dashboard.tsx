import React, { useState, useEffect, useMemo } from 'react';
import { User, Transaction, Category, SummaryStats, TransactionType, PaymentMethod } from '../types';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { geminiService } from '../services/geminiService';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { SummaryCards } from './SummaryCards';
import { FinancialChart } from './FinancialChart';
import { CategoryChart } from './CategoryChart';
import { CategoryList } from './CategoryList';
import { SpecialAllocationBox } from './SpecialAllocationBox';
import { InvestmentPortfolio } from './InvestmentPortfolio';
import { Download, Sparkles, LogOut, LayoutDashboard, PieChart, List, Briefcase, Key } from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type View = 'overview' | 'reports' | 'transactions' | 'investments';

// Professional color palette for categories
const CATEGORY_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#84cc16', // Lime
];

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Use Local Time for default month initialization
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  // Change password UI state
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  
  // Cash and Savings States
  const [totalCash, setTotalCash] = useState(0);
  const [initialCash, setInitialCash] = useState(0);
  const [monthlySpecialExpenses, setMonthlySpecialExpenses] = useState(0);
  const [allTimeSpecialExpenses, setAllTimeSpecialExpenses] = useState(0);
  
  // Keep track of lifetime transactions
  const [allHistory, setAllHistory] = useState<Transaction[]>([]);

  // Initial Load
  useEffect(() => {
    const cats = storageService.getCategories(user.id);
    setCategories(cats);
    loadTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  // Reload transactions when filter changes
  useEffect(() => {
    loadTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth]);

  const loadTransactions = () => {
    // 1. Get all transactions (lifetime)
    const allTransactions = storageService.getTransactions(user.id);
    setAllHistory(allTransactions);
    
    // 2. Calculate Total Cash (Physical Wallet)
    const storedInitialCash = storageService.getInitialCash(user.id);
    setInitialCash(storedInitialCash);
    
    const cashDelta = allTransactions.reduce((acc, t) => {
      if (t.paymentMethod !== 'cash') return acc;
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
    
    setTotalCash(storedInitialCash + cashDelta);

    // 3. Special Expenses (Allocations)
    // Monthly for the dashboard balance
    const monthlyAlloc = storageService.getMonthlyAllocation(user.id, filterMonth);
    const monthlySpecial = monthlyAlloc && monthlyAlloc.items ? monthlyAlloc.items.reduce((sum, item) => sum + item.amount, 0) : 0;
    setMonthlySpecialExpenses(monthlySpecial);

    // All-time for Lifetime Savings calculation
    const allAllocations = storageService.getAllAllocations(user.id);
    const allTimeSpecial = allAllocations.reduce((acc, alloc) => {
      const mTotal = alloc.items ? alloc.items.reduce((sum, item) => sum + item.amount, 0) : 0;
      return acc + mTotal;
    }, 0);
    setAllTimeSpecialExpenses(allTimeSpecial);

    // 4. Get transactions filtered by the selected month for the current view
    const [year, month] = filterMonth.split('-');
    const startDate = `${year}-${month}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

    const filteredTx = allTransactions.filter(t => t.date >= startDate && t.date <= endDate);

    // Hydrate category names
    const hydratedTxs = filteredTx.map(t => ({
      ...t,
      categoryName: categories.find(c => c.id === t.categoryId)?.name || 'Unknown'
    }));

    setTransactions(hydratedTxs);
    setAiInsight(null);
  };

  const handleUpdateCash = (newAmount: number) => {
    const cashDelta = allHistory.reduce((acc, t) => {
      if (t.paymentMethod !== 'cash') return acc;
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);

    const newInitial = newAmount - cashDelta;
    storageService.setInitialCash(user.id, newInitial);
    loadTransactions();
  };

  const handleAddTransaction = (amount: number, type: TransactionType, categoryId: string, date: string, note: string, paymentMethod: PaymentMethod) => {
    storageService.addTransaction({
      userId: user.id,
      amount,
      type,
      categoryId,
      date,
      note,
      paymentMethod
    });
    loadTransactions();
  };

  const handleDeleteTransaction = (id: string) => {
    storageService.deleteTransaction(id);
    loadTransactions();
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Payment', 'Category', 'Amount', 'Note'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => 
        [t.date, t.type, t.paymentMethod, `"${t.categoryName}"`, t.amount, `"${t.note}"`].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `budget_export_${filterMonth}.csv`;
    link.click();
  };

  const handleGetInsights = async () => {
    setIsGeneratingInsight(true);
    const insight = await geminiService.analyzeFinances(transactions);
    setAiInsight(insight);
    setIsGeneratingInsight(false);
  };

  // Stats for the current month
  const stats: SummaryStats = useMemo(() => {
    const baseStats = transactions.reduce((acc, t) => {
      if (t.type === 'income') {
        acc.totalIncome += t.amount;
        acc.balance += t.amount;
      } else {
        acc.totalExpense += t.amount;
        acc.balance -= t.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0 });

    // Subtract Monthly Special Expenses from Monthly Balance
    baseStats.balance -= monthlySpecialExpenses;

    return baseStats;
  }, [transactions, monthlySpecialExpenses]);

  // Calculate Total Liquidity (Lifetime Net Worth excluding Investments)
  // = Initial Cash + (All Income - All Expense) - All Special Expenses
  // Note: Initial Cash is essentially an offset added to the lifetime calculation.
  // Since (Lifetime Income - Lifetime Expense) includes cash transactions, 
  // we need to be careful not to double count if "Initial Cash" implies "Cash on hand at start".
  // Here we treat 'Initial Cash' as the starting seed for the wallet.
  const totalLiquidity = useMemo(() => {
    const lifetimeSurplus = allHistory.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
    
    return initialCash + lifetimeSurplus - allTimeSpecialExpenses;
  }, [allHistory, initialCash, allTimeSpecialExpenses]);

  const categoryData = useMemo(() => {
    const expenseTxs = transactions.filter(t => t.type === 'expense');
    const agg = expenseTxs.reduce((acc, t) => {
      const name = t.categoryName || 'Other';
      acc[name] = (acc[name] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agg)
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => Number(b.value) - Number(a.value));
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">BudgetFlow</span>
              
              <nav className="ml-8 flex space-x-1 sm:space-x-4">
                <button
                  onClick={() => setCurrentView('overview')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                    currentView === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutDashboard size={18} className="mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setCurrentView('reports')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                    currentView === 'reports' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <PieChart size={18} className="mr-2" />
                  Reports & AI
                </button>
                <button
                  onClick={() => setCurrentView('transactions')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                    currentView === 'transactions' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List size={18} className="mr-2" />
                  Transactions
                </button>
                <button
                  onClick={() => setCurrentView('investments')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                    currentView === 'investments' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Briefcase size={18} className="mr-2" />
                  Investments
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <input 
                type="month" 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border-gray-300 border rounded-md text-sm px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
              <button
                onClick={() => {
                  setShowChangePwd(!showChangePwd);
                  setChangeError(null);
                  setChangeSuccess(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Change password"
              >
                <Key size={20} />
              </button>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Change Password Panel */}
        {showChangePwd && (
          <div className="mb-6 max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsChangingPwd(true);
                setChangeError(null);
                setChangeSuccess(null);
                (async () => {
                  try {
                    await firebaseService.changePassword(currentPwd, newPwd);
                    setChangeSuccess('Password updated successfully');
                    setCurrentPwd('');
                    setNewPwd('');
                    setShowChangePwd(false);
                  } catch (err: any) {
                    setChangeError(err?.message || 'Could not change password');
                  } finally {
                    setIsChangingPwd(false);
                  }
                })();
              }}
            >
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Current password</label>
                  <input
                    type="password"
                    required
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">New password</label>
                  <input
                    type="password"
                    required
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button type="submit" disabled={isChangingPwd} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">
                    {isChangingPwd ? 'Updating…' : 'Update password'}
                  </button>
                  <button type="button" onClick={() => setShowChangePwd(false)} className="px-3 py-1.5 bg-gray-100 rounded-md text-sm">
                    Cancel
                  </button>
                </div>
                {changeError && <div className="text-sm text-red-600">{changeError}</div>}
                {changeSuccess && <div className="text-sm text-green-600">{changeSuccess}</div>}
              </div>
            </form>
          </div>
        )}
        
        {/* VIEW: OVERVIEW */}
        {currentView === 'overview' && (
          <div className="space-y-8">
            <SummaryCards stats={stats} totalCash={totalCash} onUpdateCash={handleUpdateCash} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TransactionForm categories={categories} onAdd={handleAddTransaction} />
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <TransactionList transactions={transactions.slice(0, 5)} onDelete={handleDeleteTransaction} />
              </div>
              <div className="lg:col-span-1 space-y-6">
                 {/* Mini Categories for Quick Glance */}
                 <CategoryList data={categoryData.slice(0, 5)} />
                 {/* Special Allocation Box with update callback */}
                 <SpecialAllocationBox 
                   userId={user.id} 
                   month={filterMonth} 
                   onUpdate={() => loadTransactions()} 
                 />
              </div>
            </div>
          </div>
        )}

        {/* VIEW: REPORTS */}
        {currentView === 'reports' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>
              <button
                  onClick={handleGetInsights}
                  disabled={isGeneratingInsight || transactions.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-indigo-200 shadow-sm text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGeneratingInsight ? 'Analyzing...' : 'Generate AI Insights'}
              </button>
            </div>

            {/* AI Insights Section */}
            {aiInsight && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm mt-1">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-md font-semibold text-indigo-900">AI Analysis</h3>
                        <div className="mt-2 text-indigo-800 text-sm leading-relaxed whitespace-pre-wrap">
                            {aiInsight}
                        </div>
                    </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FinancialChart transactions={transactions} />
              <CategoryChart data={categoryData} />
            </div>
          </div>
        )}

        {/* VIEW: TRANSACTIONS */}
        {currentView === 'transactions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
              <button
                onClick={handleExportCSV}
                disabled={transactions.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </button>
            </div>
            <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
          </div>
        )}

        {/* VIEW: INVESTMENTS */}
        {currentView === 'investments' && (
            <InvestmentPortfolio userId={user.id} totalLiquidity={totalLiquidity} />
        )}

      </main>
    </div>
  );
};