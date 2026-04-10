import React, { useEffect, useState } from 'react';
import { UserPlus, Shield, Mail, Edit, Trash } from 'lucide-react';
import api from '../utils/api';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    api.get('/staff').then(res => setStaff(res.data));
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Staff Management</h1>
          <p className="text-muted">Manage administrators, managers, and staff access.</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={20} /> Add Staff
        </button>
      </div>

      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        {staff.map(user => (
          <div key={user.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {user.name.charAt(0)}
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{user.name}</h3>
            <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
              <Mail size={14} /> {user.email}
            </p>
            <span style={{ 
              padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
              background: user.role === 'Admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              color: user.role === 'Admin' ? 'var(--danger)' : 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', gap: '0.25rem'
            }}>
              <Shield size={12} /> {user.role}
            </span>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', width: '100%' }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }}><Edit size={16} /></button>
              <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', color: 'var(--danger)' }}><Trash size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffManagement;
