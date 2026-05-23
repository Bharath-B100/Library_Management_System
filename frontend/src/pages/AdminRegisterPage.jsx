import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { registerAdmin } from '../services/api';

export default function AdminRegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminSecret: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await registerAdmin(form);
      login(data);
      toast.success('Admin account created! 🛡️');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-big">🛡️</div>
          <h2>Admin Registration</h2>
          <p>Requires a valid admin secret key</p>
        </div>
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          ⚠️ Admin registration requires a secret key. Contact your system administrator.
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" placeholder="Admin name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-input" placeholder="admin@library.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Admin Secret Key</label>
            <input type="password" name="adminSecret" className="form-input" placeholder="Enter admin secret key" value={form.adminSecret} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? '⏳ Registering...' : '🛡️ Register as Admin'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
