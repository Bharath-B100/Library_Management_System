import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAllBorrowRecords, returnBook } from '../../services/api';

export default function AdminBorrows() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllBorrowRecords({ status, page, limit: 15 });
      setRecords(data.records);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleReturn = async (id) => {
    try {
      const { data } = await returnBook(id);
      toast.success(data.message);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    }
  };

  const statusTabs = ['all', 'borrowed', 'overdue', 'returned'];

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">📋 Borrow Logs</h2>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{total} records</span>
      </div>

      <div className="filters-bar">
        {statusTabs.map(s => (
          <button key={s} className={`filter-chip ${status === s ? 'active' : ''}`} onClick={() => { setStatus(s); setPage(1); }}>
            {s === 'all' ? '📋 All' : s === 'borrowed' ? '📖 Borrowed' : s === 'overdue' ? '⚠️ Overdue' : '✅ Returned'}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No records found</h3>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>User</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Fine</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const isOverdue = r.status !== 'returned' && new Date() > new Date(r.dueDate);
                  const overdueDays = isOverdue
                    ? Math.ceil((new Date() - new Date(r.dueDate)) / (1000 * 60 * 60 * 24))
                    : 0;
                  return (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.book?.title || 'Deleted Book'}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{r.book?.author}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.88rem' }}>{r.user?.name || 'Unknown'}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{r.user?.email}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{new Date(r.borrowDate).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontSize: '0.82rem', color: isOverdue ? 'var(--danger)' : 'var(--text-primary)', fontWeight: isOverdue ? 600 : 400 }}>
                        {new Date(r.dueDate).toLocaleDateString('en-IN')}
                        {isOverdue && <div style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{overdueDays}d overdue</div>}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {r.returnDate ? new Date(r.returnDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        {r.fineAmount > 0
                          ? <span className="fine-tag">₹{r.fineAmount}</span>
                          : isOverdue
                            ? <span className="fine-tag">₹{overdueDays * 5}+</span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>
                        }
                      </td>
                      <td>
                        <span className={`book-badge badge-${r.status}`}>
                          {r.status === 'borrowed' ? '📖 Borrowed' : r.status === 'overdue' ? '⚠️ Overdue' : '✅ Returned'}
                        </span>
                      </td>
                      <td>
                        {r.status !== 'returned' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleReturn(r._id)}>↩️ Return</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {pages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
