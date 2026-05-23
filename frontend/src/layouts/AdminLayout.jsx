import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/books', label: 'Books', icon: '📚' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/borrows', label: 'Borrow Logs', icon: '📋' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">📖</div>
          <span className="logo-text">LibraVault</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-full btn-sm">🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content with-sidebar">
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-icon btn-secondary" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }} id="menu-btn">☰</button>
            <h1>Admin Panel</h1>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>🌙</span>
            <button className={`theme-toggle ${theme === 'light' ? 'on' : ''}`} onClick={toggleTheme} title="Toggle theme" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>☀️</span>
          </div>
        </header>
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />
      )}
    </div>
  );
}
