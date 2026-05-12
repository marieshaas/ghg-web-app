import React, { useState, useEffect } from 'react';

const AlertMissingCategory = ({ missingCategories, currentMonthName }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (missingCategories && missingCategories.length > 0) {
      setIsOpen(true);
    }
  }, [missingCategories]);

  if (!missingCategories || missingCategories.length === 0) return null;

  const categoryNames = {
    '1': 'Direct Emissions',
    '2': 'Indirect Emissions',
    '3': 'Other Indirect Emissions (Transportation)',
    '4': 'Other Indirect Emissions (Product/Material)'
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          {/* Modal */}
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-bounce-in">
            {/* Header */}
            <div className="bg-orange-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Missing Data Alert</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                The following categories have no data for this month <span className="font-bold text-orange-600">{currentMonthName}</span>:
              </p>
              <ul className="space-y-2 mb-6">
                {missingCategories.map(cat => (
                  <li key={cat} className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <svg className="w-5 h-5 text-orange-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Category {cat} - {categoryNames[cat]}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href="/emission-calculator"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition text-center">
                  Add Data Now
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertMissingCategory;