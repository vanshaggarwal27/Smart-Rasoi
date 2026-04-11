import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [notification, setNotification] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_time', { ascending: false });

      if (error) throw error;
      
      // Always set the explicit data returned from Supabase, or empty
      setOrders(data || []);
    } catch (error) {
      console.warn('Error fetching orders:', error.message);
      setErrorMsg('Failed to load orders: ' + error.message);
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
            setNotification({ 
              message: `Order #${payload.new.order_id || payload.new.id || 'Unknown'} was placed.`,
              time: new Date().toLocaleTimeString()
            });
            setTimeout(() => setNotification(null), 5000);
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
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      {/* Real-time Order Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'var(--accent-primary)',
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
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
            {notification.message}
            <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.125rem', opacity: 0.7 }}>
              {notification.time}
            </span>
          </div>
        </div>
      )}

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
