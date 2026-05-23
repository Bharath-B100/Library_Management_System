import { useState, useEffect } from 'react';
import { getDashboardStats, getCategoryStats } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c] = await Promise.all([getDashboardStats(), getCategoryStats()]);
        setStats(s.data);
        setCategories(c.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const statCards = [
    { label: 'Total Books', value: stats?.totalBooks ?? 0, icon: '📚', color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    { label: 'Registered Users', value: stats?.totalUsers ?? 0, icon: '👥', color: '#00d4a0', bg: 'rgba(0,212,160,0.15)' },
    { label: 'Active Borrows', value: stats?.activeBorrows ?? 0, icon: '📖', color: '#ffa726', bg: 'rgba(255,167,38,0.15)' },
    { label: 'Overdue Books', value: stats?.overdueCount ?? 0, icon: '⚠️', color: '#ff5370', bg: 'rgba(255,83,112,0.15)' },
    { label: 'Total Fines (₹)', value: `₹${stats?.totalFines ?? 0}`, icon: '💰', color: '#ffd700', bg: 'rgba(255,215,0,0.15)' },
  ];

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">📊 Admin Dashboard</h2>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <h3 style={{ color: s.color }}>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>📂 Books by Category</h3>
        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No books yet</h3>
            <p>Add books to see category breakdown</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {categories.map((cat) => {
              const total = categories.reduce((a, c) => a + c.count, 0);
              const pct = Math.round((cat.count / total) * 100);
              return (
                <div key={cat._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.88rem' }}>
                    <span>{cat._id}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.count} books ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-accent)', borderRadius: 4, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
