import React from 'react';

const CategorySelector = ({ selectedCategory, categories, onSelect, isOpen, onToggle }) => {
  return (
    <div className="relative">
      <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
        <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3"></div>
        GHG Category
      </label>
      
      <div 
        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-pointer flex items-center justify-between hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
        onClick={onToggle}
      >
        <span className={`${selectedCategory ? 'text-gray-900 font-medium' : 'text-gray-600'} group-hover:text-green-700 transition-colors`}>
          {selectedCategory ? categories.find(cat => cat.value === selectedCategory)?.label : 'Select GHG Category'}
        </span>
        <svg className={`w-5 h-5 text-gray-600 group-hover:text-green-600 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border-2 border-green-100 rounded-xl shadow-2xl overflow-hidden">
          {categories.map((category, index) => (
            <div
              key={category.value}
              className="px-6 py-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer border-b border-green-50 last:border-b-0 text-gray-800 hover:text-green-800 transition-all duration-200"
              onClick={() => onSelect(category.value)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-3 text-white font-bold text-sm">
                  {index + 1}
                </div>
                {category.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;