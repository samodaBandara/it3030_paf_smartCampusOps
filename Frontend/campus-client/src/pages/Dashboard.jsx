import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MdMeetingRoom, MdDateRange, MdConfirmationNumber, MdAdminPanelSettings, MdPeople } from 'react-icons/md';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const allCards = [
    { label: 'Resources', desc: 'Browse and manage campus facilities', icon: <MdMeetingRoom size={28} />, path: '/resources', color: '#4f46e5', bg: '#eef2ff', roles: ['ADMIN','STAFF','STUDENT'] },
    { label: 'My Bookings', desc: 'View and manage your reservations', icon: <MdDateRange size={28} />, path: '/bookings', color: '#0891b2', bg: '#ecfeff', roles: ['STUDENT'] },
    { label: 'Tickets', desc: 'Report and track maintenance issues', icon: <MdConfirmationNumber size={28} />, path: '/tickets', color: '#7c3aed', bg: '#f5f3ff', roles: ['ADMIN','STAFF','STUDENT'] },
    { label: 'Manage Bookings', desc: 'Approve or reject booking requests', icon: <MdAdminPanelSettings size={28} />, path: '/admin/bookings', color: '#b45309', bg: '#fffbeb', roles: ['ADMIN','STAFF'] },
    { label: 'User Management', desc: 'Manage campus accounts and roles', icon: <MdPeople size={28} />, path: '/admin/users', color: '#047857', bg: '#ecfdf5', roles: ['ADMIN'] },
  ];

  const cards = allCards.filter(c => c.roles.includes(user?.role));

  const roleColors = {
    ADMIN: { bg: '#fef3c7', color: '#92400e' },
    STAFF: { bg: '#dbeafe', color: '#1e40af' },
    STUDENT: { bg: '#dcfce7', color: '#166534' },
  };
  const rc = roleColors[user?.role] || {};

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Welcome back, {user?.name} 👋
            </h1>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '999px', background: rc.bg, color: rc.color }}>
              {user?.role}
            </span>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
            Here's what you can do today on the Smart Campus Operations Hub.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.1rem' }}>
          {cards.map(card => (
            <div key={card.label}
              onClick={() => navigate(card.path)}
              style={{
                background: 'white',
                border: '1px solid #f1f5f9',
                borderRadius: '14px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`;
                e.currentTarget.style.borderColor = card.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                e.currentTarget.style.borderColor = '#f1f5f9';
              }}
            >
              <div style={{ width: '48px', height: '48px', background: card.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, marginBottom: '1rem' }}>
                {card.icon}
              </div>
              <h3 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{card.label}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}