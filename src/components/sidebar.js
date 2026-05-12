import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CalculatorIcon, 
  DocumentTextIcon, 
  DocumentDuplicateIcon, 
  InformationCircleIcon,
  MenuIcon,
  XIcon,
  PresentationChartLineIcon,
  TruckIcon
} from '@heroicons/react/outline';

const Sidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
    },
     {
      name: 'Emission Analysis',
      href: '/emission-analysis',
      icon: PresentationChartLineIcon,
    },
    {
      name: 'Supplier Analysis',
      href: '/supplier-analysis',
      icon:TruckIcon,
    },
    {
      name: 'Emission Calculator',
      href: '/emission-calculator',
      icon: CalculatorIcon,
    },
    {
      name: 'Monthly Report',
      href: '/monthly-report',
      icon: DocumentTextIcon,
    },
    {
      name: 'Our GHG Reports',
      href: '/ghg-report',
      icon: DocumentDuplicateIcon,
    },
    {
      name: 'References',
      href: '/references',
      icon: InformationCircleIcon,
    },
  ];

  const isActive = (href) => {
    return location.pathname === href;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 "
        >
          {isMobileMenuOpen ? (
            <div className='bg-green-600' />
          ) : (
            <MenuIcon className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 max-w-sm
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full bg-white shadow-xl border-r border-gray-200 flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex-shrink-0 items-center space-x-3">
              {/* <div className="w-10 h-10 bg-gradient-to-tr from-green-600 to-green-400 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">G</span>
              </div> */}
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:mt-10">GHG Tracker</h1>
                <p className="text-sm text-green-600">Carbon Monitor</p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-green-200 transition-colors "
            >
              <XIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium
                      transition-all duration-200 ease-in-out
                      ${active 
                        ? 'bg-green-100 text-green-900 border-r-4 border-green-500 shadow-sm' 
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-800 hover:translate-x-1'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <Icon className={`
                        w-5 h-5 mr-3 transition-colors duration-200
                        ${active ? 'text-green-600' : 'text-gray-500 group-hover:text-green-600'}
                      `} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    
                    {item.badge && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Divider */}
          <div className="px-4">
            <div className="border-t border-gray-200"></div>
          </div>

          {/* Additional Actions */}
          <div className="px-4 py-4">
            <Link
              to="/help"
              className="group flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <InformationCircleIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" />
              <span>Demo Ver.</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;