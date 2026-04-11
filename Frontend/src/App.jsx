import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utils/supabase';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import Consumption from './pages/Consumption';
import WasteTracking from './pages/WasteTracking';
import StaffManagement from './pages/StaffManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';
import OrderTracking from './pages/OrderTracking';

// Moved outside to prevent re-creation and flickering during real-time updates
const Layout = ({ children, globalNotification, onLogout }) => (
  <div className="app-container" style={{ position: 'relative' }}>
    
    {/* Global Real-time Notification Toast */}
    {globalNotification && (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '50px',
        background: 'var(--accent-primary)',
        color: '#fff',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        animation: 'fade-in 0.3s ease-out'
      }}>
        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
          New Order Received!
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
          {globalNotification.message}
          <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.125rem', opacity: 0.7 }}>
            {globalNotification.time}
          </span>
        </div>
      </div>
    )}

    <Sidebar />
    <div className="main-content">
      <Navbar onLogout={onLogout} />
      <div className="content-area">
        {children}
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ element, isAuthenticated, globalNotification, onLogout }) => {
  return isAuthenticated ? (
    <Layout globalNotification={globalNotification} onLogout={onLogout}>
      {element}
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [globalNotification, setGlobalNotification] = useState(null);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase.channel('global_orders_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setGlobalNotification({
          message: `Order #${payload.new.order_id || 'Unknown'} was placed.`,
          time: new Date().toLocaleTimeString()
        });
        setTimeout(() => setGlobalNotification(null), 5000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
      <Route path="/" element={<ProtectedRoute element={<Dashboard />} isAuthenticated={isAuthenticated} globalNotification={globalNotification} onLogout={handleLogout} />} />
      <Route path="/orders" element={<ProtectedRoute element={<OrderTracking />} isAuthenticated={isAuthenticated} globalNotification={globalNotification} onLogout={handleLogout} />} />
      <Route path="/menu" element={<ProtectedRoute element={<MenuManagement />} isAuthenticated={isAuthenticated} globalNotification={globalNotification} onLogout={handleLogout} />} />
      <Route path="/consumption" element={<ProtectedRoute element={<Consumption />} isAuthenticated={isAuthenticated} globalNotification={globalNotification} onLogout={handleLogout} />} />
      <Route path="/waste" element={<ProtectedRoute element={<WasteTracking />} isAuthenticated={isAuthenticated} globalNotification={globalNotification} onLogout={handleLogout} />} />
      <Route path="/staff" element={<ProtectedRoute element={<StaffManagement />} isAuthenticated={isAuthenticated} globalNotification={globalNotification} onLogout={handleLogout} />} />
      <Route path="/settings" element={<ProtectedRoute element={<Settings />} isAuthenticated={isAuthenticated} globalNotification={globalNotification} onLogout={handleLogout} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
