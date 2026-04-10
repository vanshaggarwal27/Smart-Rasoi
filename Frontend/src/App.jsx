import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import Consumption from './pages/Consumption';
import WasteTracking from './pages/WasteTracking';
import StaffManagement from './pages/StaffManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const Layout = ({ children }) => (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar onLogout={() => setIsAuthenticated(false)} />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? <Layout>{element}</Layout> : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
      <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/menu" element={<ProtectedRoute element={<MenuManagement />} />} />
      <Route path="/consumption" element={<ProtectedRoute element={<Consumption />} />} />
      <Route path="/waste" element={<ProtectedRoute element={<WasteTracking />} />} />
      <Route path="/staff" element={<ProtectedRoute element={<StaffManagement />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
