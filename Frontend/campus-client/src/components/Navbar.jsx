import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaBell } from 'react-icons/fa';
import { MdLogout, MdCircle } from 'react-icons/md';
import '../css/Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef();

  const load = async () => {
    try { const r = await api.get('/notifications/my'); setNotifications(r.data); } catch {}
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const unread = notifications.filter(n => !n.isRead).length;
  const markRead = async (id) => { await api.patch(`/notifications/${id}/read`); load(); };

  const roleStyle = {
    ADMIN: { background: '#fef3c7', color: '#92400e' },
    STAFF: { background: '#dbeafe', color: '#1e40af' },
    STUDENT: { background: '#dcfce7', color: '#166534' },
  };

  return (
    <header className="cs-topbar">
      <div className="cs-topbar-left">
        <span className="cs-topbar-title">Smart Campus Operations Hub</span>
      </div>
      <div className="cs-topbar-right">
        <span className="cs-role-chip" style={roleStyle[user?.role]}>
          {user?.role}
        </span>
        <span className="cs-user-chip">{user?.name}</span>

        <div className="cs-notif-wrapper" ref={notifRef}>
          <button className="cs-top-icon-btn" onClick={() => setShowNotif(!showNotif)}>
            <FaBell size={15} />
            {unread > 0 && <span className="cs-notif-dot">{unread}</span>}
          </button>
          {showNotif && (
            <div className="cs-notif-dropdown">
              <div className="cs-notif-header">
                <span>Notifications</span>
                {unread > 0 && <span className="cs-notif-badge">{unread} new</span>}
              </div>
              <div className="cs-notif-list">
                {notifications.length === 0 && <div className="cs-notif-empty">No notifications</div>}
                {notifications.map(n => (
                  <div key={n.id} className={`cs-notif-item ${!n.isRead ? 'unread' : ''}`}
                    onClick={() => markRead(n.id)}>
                    {!n.isRead && <MdCircle size={7} color="#4f46e5" style={{ flexShrink: 0, marginTop: 4 }} />}
                    <div>
                      <p>{n.message}</p>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="cs-top-icon-btn cs-logout-btn"
          onClick={() => { logout(); navigate('/login'); }}>
          <MdLogout size={16} />
        </button>
      </div>
    </header>
  );
}