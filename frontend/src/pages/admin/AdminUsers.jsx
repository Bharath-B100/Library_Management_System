import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAllUsers, updateUserStatus } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllUsers({ search, page, limit: 15 });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (user) => {
    try {
      await updateUserStatus(user._id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">👥 User Management</h2>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{total} registered users</span>
      </div>

      <div className="search-bar" style={{ marginBottom: '1.5rem' }}>
        <span>🔍</span>
        <input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No users registered yet</h3>
              <p>Users will appear here after they register</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Active Borrows</th>
                  <th>Total Borrows</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4a0,#29b6f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                          {user.name[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user.email}</td>
                    <td>
                      <span style={{ color: user.activeBorrows > 0 ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}>
                        {user.activeBorrows}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.totalBorrows}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <span className={`book-badge ${user.isActive ? 'badge-available' : 'badge-unavailable'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggle(user)}>
                        {user.isActive ? '🔒 Block' : '✅ Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
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
