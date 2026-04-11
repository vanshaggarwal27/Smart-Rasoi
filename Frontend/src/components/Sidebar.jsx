import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Users, LineChart, MessageSquare, Settings, Trash2, ClipboardList } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sidebar" style={{ border: 'none' }}>
      <div style={{ marginBottom: '2.5rem', padding: '0.5rem 1rem' }}>
        <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: '800', color: 'var(--accent-primary)' }}>SmartRasoi.</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <ClipboardList size={20} />
          Order Tracking
        </NavLink>
        <NavLink to="/menu" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <UtensilsCrossed size={20} />
          Menu
        </NavLink>
        <NavLink to="/consumption" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LineChart size={20} />
          Analytics
        </NavLink>
        <NavLink to="/waste" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Trash2 size={20} />
          Food Waste
        </NavLink>
        <NavLink to="/staff" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          Customers & Staff
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          Setting
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
