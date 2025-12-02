import React from 'react';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryListProps {
  data: CategoryData[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ data }) => {
  if (data.length === 0) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Breakdown</h3>
            <p className="text-sm text-gray-400">No expenses recorded.</p>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Breakdown</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <div 
                className="h-3 w-3 rounded-full ring-2 ring-white shadow-sm" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700 font-medium">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              ₹{item.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};