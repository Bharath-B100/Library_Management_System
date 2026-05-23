import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/user', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/user/library', label: 'Library', icon: '📚' },
  { to: '/user/my-books', label: 'My Books', icon: '📖' },
  { to: '/user/history', label: 'History', icon: '📜' },
];

export default function UserLayout() {
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
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4a0, #29b6f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Member</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-full btn-sm">🚪 Logout</button>
        </div>
      </aside>

      <div className="main-content with-sidebar">
        <header className="topbar">
          <div className="topbar-left">
            <h1>Library</h1>
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
