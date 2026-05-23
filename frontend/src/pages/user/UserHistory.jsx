import { useState, useEffect } from 'react';
import { getMyHistory } from '../../services/api';

export default function UserHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getMyHistory().then(r => { setRecords(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? records : records.filter(r => r.status === filter);
  const totalFines = records.reduce((a, r) => a + (r.fineAmount || 0), 0);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">📜 Borrow History</h2>
        {totalFines > 0 && <span className="fine-tag">Total Fines: ₹{totalFines}</span>}
      </div>

      <div className="filters-bar">
        {[['all','📋 All'], ['borrowed','📖 Active'], ['returned','✅ Returned'], ['overdue','⚠️ Overdue']].map(([val, label]) => (
          <button key={val} className={`filter-chip ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <h3>No history yet</h3>
          <p>Books you borrow will appear here</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrowed</th>
                  <th>Due Date</th>
                  <th>Returned</th>
                  <th>Fine</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const isOverdue = r.status !== 'returned' && new Date() > new Date(r.dueDate);
                  return (
                    <tr key={r._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {r.book?.coverImage
                            ? <img src={r.book.coverImage} alt="" style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                            : <div style={{ width: 36, height: 48, background: 'var(--gradient-accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📖</div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.book?.title || 'Deleted Book'}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{r.book?.author}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{new Date(r.borrowDate).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontSize: '0.82rem', color: isOverdue ? 'var(--danger)' : 'inherit' }}>
                        {new Date(r.dueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {r.returnDate ? new Date(r.returnDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        {r.fineAmount > 0
                          ? <span className="fine-tag">₹{r.fineAmount}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>
                        }
                      </td>
                      <td>
                        <span className={`book-badge badge-${r.status}`}>
                          {r.status === 'borrowed' ? '📖 Borrowed' : r.status === 'overdue' ? '⚠️ Overdue' : '✅ Returned'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
