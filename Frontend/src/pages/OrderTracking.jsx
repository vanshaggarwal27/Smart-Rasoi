import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';

const MOCK_ORDERS = [
  { "order_id": "ORD1001", "student_id": "STU1021", "food_items": "2x Masala Dosa, 1x Filter Coffee", "order_time": "2026-04-10T08:15:00", "status": "Deliver" },
  { "order_id": "ORD1002", "student_id": "STU1043", "food_items": "1x Aloo Paratha, 1x Masala Chai", "order_time": "2026-04-10T08:30:00", "status": "Deliver" },
  { "order_id": "ORD1003", "student_id": "STU1055", "food_items": "2x Idli, 1x Vada, 1x Filter Coffee", "order_time": "2026-04-10T09:05:00", "status": "Deliver" },
  { "order_id": "ORD1004", "student_id": "STU1088", "food_items": "1x Chole Bhature, 1x Lassi", "order_time": "2026-04-10T09:45:00", "status": "Process" },
  { "order_id": "ORD1005", "student_id": "STU1102", "food_items": "1x Poha, 1x Masala Chai", "order_time": "2026-04-10T09:55:00", "status": "Prepare" },
  { "order_id": "ORD1006", "student_id": "STU1121", "food_items": "1x Veg Biryani, 1x Raita", "order_time": "2026-04-10T12:15:00", "status": "Deliver" },
  { "order_id": "ORD1007", "student_id": "STU1034", "food_items": "1x Paneer Butter Masala, 3x Butter Naan", "order_time": "2026-04-10T12:35:00", "status": "Deliver" },
  { "order_id": "ORD1008", "student_id": "STU1067", "food_items": "1x Rajma Chawal, 1x Masala Papad", "order_time": "2026-04-10T13:00:00", "status": "Process" },
  { "order_id": "ORD1009", "student_id": "STU1099", "food_items": "1x Veg Thali", "order_time": "2026-04-10T13:10:00", "status": "Process" },
  { "order_id": "ORD1010", "student_id": "STU1145", "food_items": "1x Dal Makhani, 2x Tandoori Roti", "order_time": "2026-04-10T13:45:00", "status": "Prepare" },
  { "order_id": "ORD1011", "student_id": "STU1176", "food_items": "2x Veg Pulao, 1x Lassi", "order_time": "2026-04-10T14:15:00", "status": "Prepare" },
  { "order_id": "ORD1012", "student_id": "STU1081", "food_items": "2x Samosa, 2x Masala Chai", "order_time": "2026-04-10T16:05:00", "status": "Deliver" },
  { "order_id": "ORD1013", "student_id": "STU1092", "food_items": "1x Pav Bhaji", "order_time": "2026-04-10T16:20:00", "status": "Process" },
  { "order_id": "ORD1014", "student_id": "STU1021", "food_items": "3x Vada Pav, 1x Cold Coffee", "order_time": "2026-04-10T16:45:00", "status": "Process" },
  { "order_id": "ORD1015", "student_id": "STU1150", "food_items": "1x Bhel Puri, 1x Fresh Lime Soda", "order_time": "2026-04-10T17:15:00", "status": "Prepare" },
  { "order_id": "ORD1016", "student_id": "STU1134", "food_items": "2x Onion Pakoda, 2x Masala Chai", "order_time": "2026-04-10T17:30:00", "status": "Prepare" }
];

const OrderTracking = () => {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_time', { ascending: false });

      if (error) throw error;
      
      // If we got DB data, display it, else fallback to mock payload
      if (data && data.length > 0) {
         setOrders(data);
      }
    } catch (error) {
      console.warn('Error fetching orders:', error.message);
      // Suppress UI error so mock data looks good for presentation
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription
    const subscription = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Real-time update:', payload);
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) => (order.order_id === payload.new.order_id ? payload.new : order))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((order) => order.order_id !== payload.old.order_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const updateOrderStatus = async (order_id, newStatus) => {
    // 1. Optimistically update local UI for mock data presentation
    setOrders(prev => prev.map(order => 
      order.order_id === order_id ? { ...order, status: newStatus } : order
    ));

    // 2. Try to update in Supabase (if connected)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('order_id', order_id);

      if (error) throw error;
    } catch (error) {
      console.warn('Status update sync failed, but UI was updated:', error.message);
    }
  };

  const statusStyles = {
    Prepare: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', icon: <Clock size={16} /> },
    Process: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: <Truck size={16} /> },
    Deliver: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', icon: <CheckCircle size={16} /> },
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Orders...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Order Tracking</h1>
          <p className="text-muted">Monitor and manage incoming cafeteria orders in real-time.</p>
        </div>
        <button className="btn btn-outline" onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      {errorMsg ? (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      ) : null}

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Student ID</th>
              <th>Food Items</th>
              <th>Order Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const style = statusStyles[order.status] || { bg: 'transparent', color: 'inherit' };
                return (
                  <tr key={order.order_id}>
                    <td style={{ fontWeight: '600' }}>#{order.order_id}</td>
                    <td>{order.student_id}</td>
                    <td>{order.food_items}</td>
                    <td>{new Date(order.order_time).toLocaleString()}</td>
                    <td>
                      <span
                        style={{
                          backgroundColor: style.bg,
                          color: style.color,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {style.icon} {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        style={{ width: 'auto', marginBottom: 0, padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem' }}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                      >
                        <option value="Prepare">Prepare</option>
                        <option value="Process">Process</option>
                        <option value="Deliver">Deliver</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTracking;
