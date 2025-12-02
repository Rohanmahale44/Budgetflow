import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { AllocationItem } from '../types';
import { ShoppingBag, Plus, Trash2, Save, X } from 'lucide-react';

interface SpecialAllocationBoxProps {
  userId: string;
  month: string;
  onUpdate?: () => void;
}

export const SpecialAllocationBox: React.FC<SpecialAllocationBoxProps> = ({ userId, month, onUpdate }) => {
  const [items, setItems] = useState<AllocationItem[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const alloc = storageService.getMonthlyAllocation(userId, month);
    if (alloc && alloc.items) {
      setItems(alloc.items);
    } else {
      setItems([]);
    }
  }, [userId, month]);

  const saveItems = (updatedItems: AllocationItem[]) => {
    setItems(updatedItems);
    storageService.saveMonthlyAllocation({
      userId,
      month,
      items: updatedItems
    });
    if (onUpdate) onUpdate();
  };

  const handleAddItem = () => {
    if (!newLabel || !newAmount) return;
    const amountVal = parseFloat(newAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const newItem: AllocationItem = {
      id: storageService.generateId(),
      label: newLabel,
      amount: amountVal
    };

    const updated = [...items, newItem];
    saveItems(updated);
    setNewLabel('');
    setNewAmount('');
    setIsAdding(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    saveItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
                <h4 className="font-bold text-gray-800">Special Expenses</h4>
                <p className="text-xs text-gray-400">For {month}</p>
            </div>
        </div>
        <div className="text-right">
            <span className="block text-xl font-bold text-purple-600">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
        {items.length === 0 && !isAdding && (
            <p className="text-sm text-gray-400 italic text-center py-2">No special expenses added.</p>
        )}
        {items.map(item => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                <span className="text-gray-700 font-medium">{item.label}</span>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">₹{item.amount.toFixed(2)}</span>
                    <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-gray-400 hover:text-rose-500 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* Add Form */}
      {isAdding ? (
        <div className="bg-gray-50 p-3 rounded-lg border border-purple-100 animate-in fade-in zoom-in duration-200">
            <div className="grid grid-cols-2 gap-2 mb-2">
                <input 
                    type="text" 
                    placeholder="Item name"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="text-sm border-gray-300 rounded px-2 py-1 focus:ring-purple-500 focus:border-purple-500"
                    autoFocus
                />
                <input 
                    type="number" 
                    placeholder="Amount"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="text-sm border-gray-300 rounded px-2 py-1 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
            <div className="flex justify-end gap-2">
                <button 
                    onClick={() => setIsAdding(false)}
                    className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                >
                    <X size={16} />
                </button>
                <button 
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700"
                >
                    <Save size={14} /> Save
                </button>
            </div>
        </div>
      ) : (
        <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm font-medium hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
        >
            <Plus size={16} /> Add Special Expense
        </button>
      )}
    </div>
  );
};