import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { supabase } from '../utils/supabase';

const MenuManagement = () => {
  const [menu, setMenu] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Breakfast', price: '', is_available: true, image_url: '', calories: '', protein: '', carbs: '', fats: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    // Always try Supabase first; only fall back on actual connection error
    try {
      const { data, error } = await supabase.from('food_items').select('*');
      if (error) throw error;
      setMenu(data || []);
      return;
    } catch (err) {
      console.warn("Supabase unavailable, falling back to local Node API:", err.message);
    }
    // Fallback to local SQLite API
    api.get('/menu').then(res => setMenu(res.data)).catch(console.error);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Build clean payload — never send 'food_id' to Supabase on insert
    const { food_id: _ignoreId, ...baseData } = formData;
    const dataToSave = {
      name: baseData.name,
      category: baseData.category,
      price: Number(baseData.price) || 0,
      calories: Number(baseData.calories) || 0,
      protein: Number(baseData.protein) || 0,
      carbs: Number(baseData.carbs) || 0,
      fats: Number(baseData.fats) || 0,
      is_available: baseData.is_available ?? true,
    };

    try {
      // 1. Sync to Supabase
      if (editingId) {
        const { error } = await supabase.from('food_items').update(dataToSave).eq('food_id', editingId);
        if (error) {
          alert(`Supabase update failed: ${error.message}`);
          console.error("Supabase update error:", error);
        }
      } else {
        const { error } = await supabase.from('food_items').insert([dataToSave]);
        if (error) {
          alert(`Supabase insert failed: ${error.message}`);
          console.error("Supabase insert error:", error);
        }
      }

      // 2. Also sync to local Node/SQLite API
      try {
        if (editingId) {
          await api.put(`/menu/${editingId}`, dataToSave);
        } else {
          await api.post('/menu', dataToSave);
        }
      } catch (localErr) {
        console.warn("Local API sync failed (non-critical):", localErr.message);
      }

      await fetchMenu();
      setShowModal(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert(`Save failed: ${err.message}`);
    }
  };

  const openEdit = (item) => {
    setFormData(item);
    setEditingId(item.food_id);
    setShowModal(true);
  };

  const openAdd = () => {
    setFormData({ name: '', category: 'Breakfast', price: '', is_available: true, image_url: '', calories: '', protein: '', carbs: '', fats: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this item?')) {
      // 1. Delete from Supabase
      try {
         await supabase.from('food_items').delete().eq('food_id', id);
      } catch (err) {
         console.warn("Could not delete from Supabase");
      }
      // 2. Also try local API (non-critical)
      api.delete(`/menu/${id}`).then(() => fetchMenu()).catch(() => fetchMenu());
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
              <th>Nutrition</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menu.map(item => (
              <tr key={item.food_id}>
                <td>
                  <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'; }} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                </td>
                <td style={{ fontWeight: '500' }}>{item.name}</td>
                <td><span style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-primary)', borderRadius: '12px', fontSize: '0.75rem' }}>{item.category}</span></td>
                <td>₹{(Number(item.price)).toFixed(2)}</td>
                <td>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-color)' }}>
                    <strong>{item.calories || 0}</strong> kcal<br/>
                    <span className="text-muted">P:{item.protein || 0}g C:{item.carbs || 0}g F:{item.fats || 0}g</span>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    color: item.is_available ? 'var(--success)' : 'var(--danger)',
                    background: item.is_available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600'
                  }}>
                    {item.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => openEdit(item)}><Edit2 size={16} /></button>
                    <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--danger)' }} onClick={() => handleDelete(item.food_id)}><Trash2 size={16} /></button>
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
                  <select value={formData.is_available ? 'true' : 'false'} onChange={e => setFormData({...formData, is_available: e.target.value === 'true'})}>
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Image URL (optional)</label>
                  <input type="text" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Calories</label>
                  <input type="number" required value={formData.calories} onChange={e => setFormData({...formData, calories: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Protein (g)</label>
                  <input type="number" required value={formData.protein} onChange={e => setFormData({...formData, protein: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Carbs (g)</label>
                  <input type="number" required value={formData.carbs} onChange={e => setFormData({...formData, carbs: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Fats (g)</label>
                  <input type="number" required value={formData.fats} onChange={e => setFormData({...formData, fats: Number(e.target.value)})} />
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
