import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMyHistory, returnBook } from '../../services/api';

const getPdfUrl = (url) => {
  if (!url) return null;
  if (url.toLowerCase().endsWith('.pdf')) return url;
  return url + '.pdf';
};


export default function UserMyBooks() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await getMyHistory();
      setRecords(data.filter(r => r.status !== 'returned'));
    } catch {
      toast.error('Failed to load your books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleReturn = async (record) => {
    setReturning(record._id);
    try {
      const { data } = await returnBook(record._id);
      toast.success(data.message);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return failed');
    } finally {
      setReturning(null);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">📖 My Borrowed Books</h2>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{records.length} active</span>
      </div>

      {records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No active borrows</h3>
          <p>You don't have any books borrowed right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {records.map(r => {
            const dueDate = new Date(r.dueDate);
            const now = new Date();
            const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;
            const isUrgent = daysLeft >= 0 && daysLeft <= 3;
            const projectedFine = isOverdue ? Math.abs(daysLeft) * 5 : 0;

            return (
              <div key={r._id} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', border: isOverdue ? '1px solid rgba(255,83,112,0.4)' : isUrgent ? '1px solid rgba(255,167,38,0.4)' : undefined }}>
                {r.book?.coverImage
                  ? <img src={r.book.coverImage} alt="" style={{ width: 70, height: 95, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                  : <div style={{ width: 70, height: 95, background: 'var(--gradient-accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>📖</div>
                }
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{r.book?.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{r.book?.author} · <span className="book-badge badge-category">{r.book?.category}</span></div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span>📅 Borrowed: {new Date(r.borrowDate).toLocaleDateString('en-IN')}</span>
                    <span style={{ color: isOverdue ? 'var(--danger)' : isUrgent ? 'var(--warning)' : 'inherit', fontWeight: isOverdue || isUrgent ? 600 : 400 }}>
                      ⏰ Due: {dueDate.toLocaleDateString('en-IN')}
                      {isOverdue ? ` (${Math.abs(daysLeft)}d overdue)` : daysLeft === 0 ? ' (Due today!)' : ` (${daysLeft}d left)`}
                    </span>
                  </div>
                  {isOverdue && (
                    <div className="fine-tag" style={{ marginBottom: '0.75rem' }}>💸 Projected fine: ₹{projectedFine}</div>
                  )}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {r.book?.pdfFile && (
                      <a href={getPdfUrl(r.book.pdfFile)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">📄 Read PDF</a>
                    )}
                    <button className="btn btn-success btn-sm" disabled={returning === r._id} onClick={() => handleReturn(r)}>
                      {returning === r._id ? '⏳ Processing...' : '↩️ Return Book'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
