import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Moon, Bell } from 'lucide-react';

const Navbar = ({ onLogout }) => {
  const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
  };

  return (
    <div className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700' }}>Dashboard</h2>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        <div className="search-input">
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Search..." />
        </div>

        <button className="btn btn-outline" style={{ border: 'none', padding: '0.5rem', borderRadius: '50%' }} onClick={toggleTheme}>
          <Moon size={20} />
        </button>
        
        <button className="btn btn-outline" style={{ border: 'none', padding: '0.5rem', borderRadius: '50%', position: 'relative' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%', border: '2px solid var(--bg-secondary)' }}></span>
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={onLogout}>
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60" 
            alt="Admin User" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
