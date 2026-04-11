import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const MetricCard = ({ title, value, icon, colorHex = '#1C4D35', data = [] }) => {
  // Default dummy trend data to match UI if none provided
  const chartData = data.length ? data : [
    { v: 10 }, { v: 40 }, { v: 25 }, { v: 60 }, { v: 45 }, { v: 80 }
  ];

  return (
    <div className="metric-card" style={{ padding: '1.25rem 1.25rem 0 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', zIndex: 2 }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '50%', 
          background: `var(--accent-light)`, 
          color: `var(--accent-primary)`,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          {icon}
        </div>
        <div>
          <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{title}</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{value}</div>
        </div>
      </div>
      
      <div style={{ height: '60px', width: 'calc(100% + 2.5rem)', marginLeft: '-1.25rem', marginBottom: '-2px', zIndex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorHex} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={colorHex} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="linear" dataKey="v" stroke={colorHex} strokeWidth={2} fillOpacity={1} fill="url(#gradient)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricCard;
