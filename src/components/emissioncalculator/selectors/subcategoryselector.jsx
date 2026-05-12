import React from 'react';

const SubcategorySelector = ({ 
  selectedCategory, 
  selectedSubcategory, 
  subcategories, 
  onSelect, 
  isOpen, 
  onToggle 
}) => {
  const isDisabled = !selectedCategory;
  
  return (
    <div className="relative">
      <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-3"></div>
        GHG Subcategory
      </label>
      
      <div 
        className={`w-full px-6 py-4 border-2 rounded-xl text-gray-700 cursor-pointer flex items-center justify-between transition-all duration-300 group ${
          isDisabled
            ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60' 
            : 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 hover:border-blue-400 hover:shadow-lg'
        }`}
        onClick={() => !isDisabled && onToggle()}
      >
        <span className={`${selectedSubcategory ? 'text-gray-900 font-medium' : 'text-gray-600'} ${!isDisabled ? 'group-hover:text-blue-700' : ''} transition-colors`}>
          {selectedSubcategory 
            ? subcategories[selectedCategory]?.find(sub => sub.value === selectedSubcategory)?.label 
            : 'Select GHG Subcategory'}
        </span>
        <svg className={`w-5 h-5 text-gray-600 ${!isDisabled ? 'group-hover:text-blue-600' : ''} transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && selectedCategory && subcategories[selectedCategory] && (
        <div className="absolute z-20 w-full mt-2 bg-white border-2 border-blue-100 rounded-xl shadow-2xl overflow-hidden">
          {subcategories[selectedCategory].map((subcategory) => (
            <div
              key={subcategory.value}
              className="px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-blue-50 last:border-b-0 text-gray-800 hover:text-blue-800 transition-all duration-200"
              onClick={() => onSelect(subcategory.value)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center mr-3 text-white font-bold text-xs">
                  {subcategory.value}
                </div>
                {subcategory.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubcategorySelector;