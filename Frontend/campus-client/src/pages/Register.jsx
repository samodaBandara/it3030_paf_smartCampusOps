import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import authBg from '../assets/auth-bg.mp4';
import '../css/Login.css';

const FEATURES = [
  { icon: '📚', title: 'Book Study Rooms', desc: 'Reserve halls and labs instantly' },
  { icon: '💻', title: 'Lab Equipment', desc: 'Reserve PCs and lab resources' },
  { icon: '🔧', title: 'Report Issues', desc: 'Submit maintenance tickets' },
  { icon: '📊', title: 'Track Bookings', desc: 'Monitor your reservations' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/register', {
        name: form.name, email: form.email,
        password: form.password, role: 'STUDENT'
      });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <video autoPlay muted loop playsInline className="auth-video-bg">
          <source src={authBg} type="video/mp4" />
        </video>
        <div className="auth-left-overlay" />
        <div className="auth-left-grid" />

        <div className="auth-brand">
          <div className="auth-brand-logo">
            <div className="auth-brand-logo-icon">🏫</div>
            <div className="auth-brand-logo-text">Campus<span>Ops</span></div>
          </div>
          <h1>Join the Smart<br /><span>Campus</span> Network</h1>
          <p>Register as a student to access bookings, report incidents, and manage your campus experience in one place.</p>
        </div>

        <div className="auth-features">
          {FEATURES.map((f, i) => (
            <div className="auth-feature" key={i}>
              <div className="auth-feature-icon">{f.icon}</div>
              <div className="auth-feature-text">
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create account ✨</h2>
            <p>Register as a student to get started</p>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input type="email" placeholder="you@university.edu"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
            </div>
            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  minLength={6} required />
                <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
                <span className="eye-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? '🙈' : '👁️'}
                </span>
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div className="auth-divider"><span>already have an account?</span></div>
          <p className="auth-link"><Link to="/login">Sign in here →</Link></p>
          <p className="auth-note">🔒 Staff & Admin accounts are created by administrators only</p>
        </div>
      </div>
    </div>
  );
}