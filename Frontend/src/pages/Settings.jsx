import React from 'react';
import { Save, Bell, Shield, Database, Layout } from 'lucide-react';

const Settings = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>System Settings</h1>
        <p className="text-muted">Configure the Smart Rasoi Dashboard parameters and preferences.</p>
      </div>

      <div className="grid-cols-2" style={{ gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <Bell size={20} className="text-muted" /> Notification Preferences
            </h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ marginBottom: '0.25rem' }}>High Food Waste Alerts</h4>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Get notified when waste exceeds 15%</p>
            </div>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ marginBottom: '0.25rem' }}>Low Inventory Warnings</h4>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Emails sent to cafeteria managers</p>
            </div>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ marginBottom: '0.25rem' }}>Daily Analytics Report</h4>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Receive a summary every evening</p>
            </div>
            <input type="checkbox" style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <Layout size={20} className="text-muted" /> General Configuration
            </h2>
          </div>
          
          <div>
             <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Cafeteria Name</label>
             <input type="text" defaultValue="Main Campus Dining Hall" />
          </div>
          
          <div>
             <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Currency</label>
             <select defaultValue="INR">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
             </select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-primary">
              <Save size={20} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
