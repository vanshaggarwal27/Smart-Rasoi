import React, { useEffect, useState } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, Users, FileText, BadgeDollarSign, Heart } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import api from '../utils/api';
import { supabase } from '../utils/supabase';

const COLORS = ['#e83e8c', '#8b5cf6', '#fdf2f8', '#10b981'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/overview'),
      api.get('/transactions')
    ]).then(([resData, resTxn]) => {
      setData(resData.data);
      setTransactions(resTxn.data);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching overview", err);
      setErrorMsg(err.message || 'Unknown error');
      setLoading(false);
    });

    // Set up real-time subscription for new orders
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('New order received:', payload);
          setNotification({ 
            message: `Order #${payload.new.order_id || payload.new.id || 'Unknown'} was placed.`,
            time: new Date().toLocaleTimeString()
          });
          
          setTimeout(() => {
             setNotification(null);
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>Failed to load data: {errorMsg}</div>;

  const popularPie = data.popularItems.slice(0, 3).map((item) => ({ name: item.name, value: item.sold }));
  
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

      <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
        <MetricCard title="Meals Sold" value={data.totalMealsToday || 0} icon={<ShoppingBag size={20} />} />
        <MetricCard title="Transactions" value={data.totalTransactions || 0} icon={<Users size={20} />} />
        <MetricCard title="Active Menu" value="12" icon={<FileText size={20} />} />
        <MetricCard title="Total Waste" value={((data.wasteToday || 0) * 680).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} icon={<BadgeDollarSign size={20} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Sales Figures</h3>
            <select style={{ width: 'auto', padding: '0.25rem 0.5rem', margin: 0, border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyConsumption} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={true} strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                <Area type="linear" dataKey="meals" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, fill: "var(--accent-primary)", stroke: "#fff", strokeWidth: 2 }} dot={{ r: 4, fill: "var(--accent-primary)", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Popular Food</h3>
            <select style={{ width: 'auto', padding: '0.25rem 0.5rem', margin: 0, border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem' }}>
              <option>This Week</option>
            </select>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={popularPie} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={0} dataKey="value" stroke="none">
                  {popularPie.map((entry, index) => (
                    <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>7</div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Days</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
             {popularPie.map((item, i) => (
               <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                 <div style={{ width: '10px', height: '10px', backgroundColor: COLORS[i % COLORS.length], borderRadius: '2px' }}></div>
                 {item.name}
               </div>
             ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 7fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', alignSelf: 'flex-start', marginBottom: '1rem' }}>Daily Target Income</h3>
          <div style={{ width: '100%', height: '200px', position: 'relative' }}>
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={[{value: 72}, {value: 28}]} cx="50%" cy="50%" innerRadius={70} outerRadius={90} cornerRadius={40} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                     <Cell fill="var(--accent-primary)" />
                     <Cell fill="var(--border-color)" />
                  </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.75rem', fontWeight: '700' }}>
               72%
             </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
             <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹62,926</div>
             <div className="text-muted" style={{ fontSize: '0.75rem' }}>From ₹80,000</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
             <h3 style={{ fontSize: '1.125rem' }}>Most Favourite Items</h3>
             <button className="btn btn-light" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>See All</button>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
             {data.popularItems.slice(0, 3).map((item, idx) => (
                <div key={idx} className="product-card">
                   <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Heart size={14} className="text-accent" />
                      </div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                      <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'; }} alt={item.name} style={{ width: '120px', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />
                   </div>
                   <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', minHeight: '40px' }}>{item.name}</h4>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.125rem' }}>₹{Number(item.price).toFixed(2)}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{item.sold} Sold</span>
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
         <div className="card" style={{ padding: '1.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
             <h3 style={{ fontSize: '1.125rem' }}>Recent Order Request</h3>
             <button className="btn btn-outline" style={{ border: 'none', fontSize: '0.75rem', padding: '0.25rem' }}>•••</button>
           </div>
           
           <table style={{ width: '100%' }}>
             <tbody>
               {transactions.slice(0, 4).map((t, idx) => (
                 <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                   <td style={{ padding: '0.75rem 0', width: '60px' }}>
                     <div style={{ width: '40px', height: '40px', background: 'var(--bg-hover)', borderRadius: '8px' }}></div>
                   </td>
                   <td style={{ padding: '0.75rem 0' }}>
                     <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{t.food_item}</div>
                     <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t.student_id}</div>
                   </td>
                   <td style={{ padding: '0.75rem 0', fontWeight: '500', fontSize: '0.875rem' }}>
                     ₹{Number(t.total_price).toFixed(2)}
                   </td>
                   <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                     <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                       Pending
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         
         <div className="card" style={{ padding: '1.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
             <h3 style={{ fontSize: '1.125rem' }}>Daily Trending Menus</h3>
             <button className="btn btn-outline" style={{ border: 'none', fontSize: '0.75rem', padding: '0.25rem' }}>•••</button>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {data.popularItems.slice(0, 4).map((item, idx) => (
               <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'; }} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>₹{Number(item.price).toFixed(2)} · {item.sold}x Orders</div>
                    </div>
                  </div>
                  <button className="btn btn-light" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)' }}>View</button>
               </div>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
