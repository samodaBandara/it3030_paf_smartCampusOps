import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import authBg from '../assets/auth-bg.mp4';
import '../css/Login.css';

const FEATURES = [
  { icon: '🏛️', title: 'Facilities Catalogue', desc: 'Halls, labs, rooms & equipment' },
  { icon: '📅', title: 'Smart Booking System', desc: 'Conflict-free resource scheduling' },
  { icon: '🔧', title: 'Incident Ticketing', desc: 'Report and track maintenance' },
  { icon: '🔔', title: 'Live Notifications', desc: 'Real-time status updates' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
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
          <h1>Smart Campus<br /><span>Operations</span> Hub</h1>
          <p>A unified platform for managing university facilities, bookings, and maintenance — built for students, staff, and administrators.</p>
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
            <h2>Welcome back 👋</h2>
            <p>Sign in to your campus account to continue</p>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
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
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} required />
                <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider"><span>don't have an account?</span></div>
          <p className="auth-link"><Link to="/register">Create a student account →</Link></p>
        </div>
      </div>
    </div>
  );
}