import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyHistory } from '../../services/api';

export default function UserDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyHistory().then(r => { setRecords(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const active = records.filter(r => r.status !== 'returned');
  const overdue = records.filter(r => r.status === 'overdue');
  const returned = records.filter(r => r.status === 'returned');
  const totalFines = records.reduce((a, r) => a + (r.fineAmount || 0), 0);

  const upcomingDue = active
    .filter(r => {
      const diff = (new Date(r.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 3;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">👋 Hello, {user?.name?.split(' ')[0]}!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Welcome to your LibraVault dashboard</p>
        </div>
      </div>

      {/* Due date reminders */}
      {upcomingDue.length > 0 && (
        <div className="due-alert" style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⏰</span>
          <div>
            <strong>Due Soon!</strong>{' '}
            {upcomingDue.map(r => (
              <span key={r._id} style={{ marginRight: '1rem', fontSize: '0.9rem' }}>
                "{r.book?.title}" — due {new Date(r.dueDate).toLocaleDateString('en-IN')}
              </span>
            ))}
          </div>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          ⚠️ You have {overdue.length} overdue book{overdue.length > 1 ? 's' : ''}! Please return them to avoid further fines.
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Currently Borrowed', value: active.length, icon: '📖', color: '#6c63ff', bg: 'rgba(108,99,255,0.15)', link: '/user/my-books' },
          { label: 'Books Returned', value: returned.length, icon: '✅', color: '#00d4a0', bg: 'rgba(0,212,160,0.15)', link: '/user/history' },
          { label: 'Overdue Books', value: overdue.length, icon: '⚠️', color: '#ff5370', bg: 'rgba(255,83,112,0.15)', link: '/user/my-books' },
          { label: 'Total Fines (₹)', value: `₹${totalFines}`, icon: '💰', color: '#ffd700', bg: 'rgba(255,215,0,0.15)', link: '/user/history' },
        ].map(s => (
          <Link to={s.link} key={s.label} style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stat-info">
                <h3 style={{ color: s.color }}>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Active borrows preview */}
      <div className="card">
        <div className="section-header">
          <h3 className="section-title">📖 Currently Borrowed</h3>
          <Link to="/user/my-books" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : active.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-icon">📚</div>
            <h3>No active borrows</h3>
            <p style={{ marginBottom: '1rem' }}>Visit the library to borrow books!</p>
            <Link to="/user/library" className="btn btn-primary btn-sm">Browse Library</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {active.slice(0, 3).map(r => {
              const dueDate = new Date(r.dueDate);
              const daysLeft = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft <= 3;
              return (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: `1px solid ${isUrgent ? 'rgba(255,167,38,0.4)' : 'var(--border)'}` }}>
                  {r.book?.coverImage
                    ? <img src={r.book.coverImage} alt="" style={{ width: 40, height: 52, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    : <div style={{ width: 40, height: 52, background: 'var(--gradient-accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📖</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.book?.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.book?.author}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.82rem' }}>
                    <div style={{ color: isUrgent ? 'var(--warning)' : 'var(--text-secondary)' }}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{dueDate.toLocaleDateString('en-IN')}</div>
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
