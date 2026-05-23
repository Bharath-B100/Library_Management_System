import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('user');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser({ ...form, role: activeTab });
      login(data);
      toast.success(`Welcome back, ${data.name}! 👋`);
      navigate(data.role === 'admin' ? '/admin' : '/user');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-big">📖</div>
          <h2>LibraVault</h2>
          <p>Your premium library management system</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${activeTab === 'user' ? 'active' : ''}`} onClick={() => setActiveTab('user')}>
            👨‍🎓 Student Login
          </button>
          <button className={`auth-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
            🛡️ Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? '⏳ Signing in...' : `Sign In as ${activeTab === 'admin' ? 'Admin' : 'Student'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          {activeTab === 'user' ? (
            <>New here?{' '}<Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Create an account</Link></>
          ) : (
            <>New admin?{' '}<Link to="/admin-register" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Register with secret key</Link></>
          )}
        </div>
      </div>
    </div>
  );
}
