import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../utils/api';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

const WasteTracking = () => {
  const [wasteLogs, setWasteLogs] = useState([]);
  const [menu, setMenu] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ item_id: '', quantity_prepared: '', quantity_sold: '', reason: 'Overproduction' });

  useEffect(() => {
    fetchLogs();
    api.get('/menu').then(res => {
      setMenu(res.data);
      if(res.data.length > 0) setFormData(prev => ({ ...prev, item_id: res.data[0].id }));
    });
  }, []);

  const fetchLogs = () => api.get('/waste').then(res => setWasteLogs(res.data));

  const handleSave = (e) => {
    e.preventDefault();
    const qtyPrep = parseInt(formData.quantity_prepared);
    const qtySold = parseInt(formData.quantity_sold);
    const qtyWasted = qtyPrep - qtySold;
    
    if (qtyWasted < 0) {
      alert("Sold cannot be greater than prepared");
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    
    api.post('/waste', { 
      ...formData, 
      quantity_wasted: qtyWasted,
      date: todayDate
    }).then(() => {
      fetchLogs();
      setShowModal(false);
      setFormData({ item_id: menu[0]?.id || '', quantity_prepared: '', quantity_sold: '', reason: 'Overproduction' });
    });
  };

  const aggregateReasons = wasteLogs.reduce((acc, curr) => {
    acc[curr.reason] = (acc[curr.reason] || 0) + curr.quantity_wasted;
    return acc;
  }, {});
  
  const pieData = Object.keys(aggregateReasons).map(key => ({ name: key, value: aggregateReasons[key] }));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Food Waste Tracking</h1>
          <p className="text-muted">Monitor and analyze cafeteria food waste to support sustainability.</p>
        </div>
        <button className="btn btn-danger" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Log Waste
        </button>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Reasons for Waste</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-{index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertTriangle className="text-warning" />
            <h3 style={{ fontWeight: '600' }}>AI Insights & Alerts</h3>
          </div>
          
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
            <li style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ fontWeight: '500', color: 'var(--danger)', marginBottom: '0.5rem' }}>Overproduction Alert: Breakfast Items</div>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Pancakes are experiencing a 25% waste rate this week. Consider reducing Monday/Tuesday batches by 15%.</p>
            </li>
            <li style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ fontWeight: '500', color: 'var(--warning)', marginBottom: '0.5rem' }}>Spoilage Alert: Salads</div>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Grilled Chicken Salads are expiring before sale. Implement discount promotions at 6 PM.</p>
            </li>
            <li style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ fontWeight: '500', color: 'var(--success)', marginBottom: '0.5rem' }}>Positive Trend</div>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Overall waste is down by 8% compared to last month due to better inventory management.</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Food Item</th>
              <th>Prep Qty</th>
              <th>Sold Qty</th>
              <th>Wasted Qty</th>
              <th>Waste %</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {wasteLogs.slice(0, 15).map(w => {
              const wastePercentage = Math.round((w.quantity_wasted / w.quantity_prepared) * 100) || 0;
              return (
                <tr key={w.id}>
                  <td>{w.date}</td>
                  <td style={{ fontWeight: '500' }}>{w.food_item}</td>
                  <td>{w.quantity_prepared}</td>
                  <td>{w.quantity_sold}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{w.quantity_wasted}</td>
                  <td>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem',
                      background: wastePercentage > 20 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: wastePercentage > 20 ? 'var(--danger)' : 'var(--warning)'
                    }}>
                      {wastePercentage}%
                    </span>
                  </td>
                  <td>{w.reason}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Log Food Waste</h2>
            <form onSubmit={handleSave}>
              <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Food Item</label>
                  <select value={formData.item_id} onChange={e => setFormData({...formData, item_id: e.target.value})}>
                    {menu.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Reason for Waste</label>
                  <select value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}>
                    <option value="Overproduction">Overproduction</option>
                    <option value="Spoiled/Expired">Spoiled/Expired</option>
                    <option value="Dropped/Accident">Dropped/Accident</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Quantity Prepared</label>
                  <input type="number" min="1" required value={formData.quantity_prepared} onChange={e => setFormData({...formData, quantity_prepared: e.target.value})} />
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Quantity Sold</label>
                  <input type="number" min="0" required value={formData.quantity_sold} onChange={e => setFormData({...formData, quantity_sold: e.target.value})} />
                </div>
              </div>
              
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--danger)' }}>
                <p>Calculated Waste: <strong>{Math.max(0, (parseInt(formData.quantity_prepared) || 0) - (parseInt(formData.quantity_sold) || 0))}</strong> items</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Submit Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteTracking;
