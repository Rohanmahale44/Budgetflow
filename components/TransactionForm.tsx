import React, { useState, useEffect } from 'react';
import { TransactionType, Category, PaymentMethod } from '../types';
import { PlusCircle, Banknote, CreditCard, ChevronDown } from 'lucide-react';

interface TransactionFormProps {
  categories: Category[];
  onAdd: (amount: number, type: TransactionType, categoryId: string, date: string, note: string, paymentMethod: PaymentMethod) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ categories, onAdd }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  // Initialize with Local Date instead of UTC to prevent timezone shifting issues
  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');

  const filteredCategories = categories.filter(c => c.type === type);

  // Reset category when type changes
  useEffect(() => {
    if (filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    } else {
      setCategoryId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || !categoryId) return;

    onAdd(numAmount, type, categoryId, date, note, paymentMethod);
    
    // Reset form but keep date and payment method
    setAmount('');
    setNote('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Quick Add</h3>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Type Toggle */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Payment Method</label>
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`flex-1 flex items-center justify-center gap-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                paymentMethod === 'online' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <CreditCard size={14} />
              Online
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 flex items-center justify-center gap-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                paymentMethod === 'cash' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <Banknote size={14} />
              Cash
            </button>
          </div>
        </div>

        {/* Category */}
        <div className="md:col-span-6">
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="appearance-none block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm text-gray-600 bg-white focus:border-indigo-500 focus:ring-indigo-500 pr-8"
            >
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id} className="text-gray-900 py-1">
                  {c.name}
                </option>
              ))}
              {filteredCategories.length === 0 && (
                <option disabled>No categories available</option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-lg border-gray-300 border bg-white px-3 py-2 text-sm text-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Note */}
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Note (Optional)</label>
          <input
            type="text"
            placeholder="Description..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="block w-full rounded-lg border-gray-300 border bg-white px-3 py-2 text-sm text-gray-600 focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-400"
          />
        </div>

        {/* Amount */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full rounded-lg border-gray-300 border bg-white pl-7 pr-3 py-2 text-sm text-gray-600 focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="md:col-span-1">
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors shadow-sm"
            title="Add Transaction"
          >
            <PlusCircle className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
