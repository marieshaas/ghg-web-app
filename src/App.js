import React from 'react';
import {BrowserRouter as Router, Routes,Route} from 'react-router-dom';
import Sidebar from './components/sidebar';
import Dashboard from './pages/dashboard';
import EmissionCalculator from './pages/emissionCalc';
import MonthlyReport from './pages/MonthlyReport';
import GhgReport from './pages/ghgReports';
import References from './pages/references';
import EmissionAnalysis from './pages/emissionAnalysis';
import SupplierAnalysis from './pages/supplierAnalysis';

function App(){
  return(
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar/>
        {/* Main */}
        <main className="flex-1 lg:ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/emission-analysis" element={<EmissionAnalysis />} />
            <Route path="/supplier-analysis" element={<SupplierAnalysis />} />
            <Route path='/emission-calculator' element={<EmissionCalculator />} />
            <Route path='/monthly-report' element={<MonthlyReport />} />
            <Route path='/ghg-report' element={<GhgReport />} />
            <Route path='/references' element={<References />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

