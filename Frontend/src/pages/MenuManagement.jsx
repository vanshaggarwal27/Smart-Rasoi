import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../utils/api';

const MenuManagement = () => {
  const [menu, setMenu] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Breakfast', price: '', status: 'available', image_url: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = () => api.get('/menu').then(res => setMenu(res.data));

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      api.put(`/menu/{editingId}`, formData).then(() => { fetchMenu(); setShowModal(false); });
    } else {
      const dataToSave = { 
        ...formData, 
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'
      };
      api.post('/menu', dataToSave).then(() => { fetchMenu(); setShowModal(false); });
    }
  };

  const openEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowModal(true);
  };

  const openAdd = () => {
    setFormData({ name: '', category: 'Breakfast', price: '', status: 'available', image_url: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if(window.confirm('Delete this item?')) {
      api.delete(`/menu/{id}`).then(() => fetchMenu());
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Food Menu Management</h1>
          <p className="text-muted">Manage items available in the cafeteria.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={20} /> Add Food Item
        </button>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Food Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menu.map(item => (
              <tr key={item.id}>
                <td>
                  <img src={item.image_url} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                </td>
                <td style={{ fontWeight: '500' }}>{item.name}</td>
                <td><span style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-primary)', borderRadius: '12px', fontSize: '0.75rem' }}>{item.category}</span></td>
                <td>₹{(Number(item.price)).toFixed(2)}</td>
                <td>
                  <span style={{ 
                    color: item.status === 'available' ? 'var(--success)' : 'var(--danger)',
                    background: item.status === 'available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600'
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => openEdit(item)}><Edit2 size={16} /></button>
                    <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--danger)' }} onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSave}>
              <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Food Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <div className="grid-cols-2" style={{ gap: '1rem' }}>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Beverage">Beverage</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Price (₹)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '1rem' }}>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Image URL (optional)</label>
                  <input type="text" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
