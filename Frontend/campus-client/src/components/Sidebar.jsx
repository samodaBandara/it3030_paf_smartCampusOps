import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdMeetingRoom, MdDateRange,
  MdConfirmationNumber, MdAdminPanelSettings,
  MdPeople, MdMenu
} from 'react-icons/md';
import '../css/Sidebar.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: MdDashboard, label: 'Dashboard', roles: ['ADMIN', 'STAFF', 'STUDENT'] },
  { path: '/resources', icon: MdMeetingRoom, label: 'Resources', roles: ['ADMIN', 'STAFF', 'STUDENT'] },
  { path: '/bookings', icon: MdDateRange, label: 'My Bookings', roles: ['STUDENT'] },
  { path: '/tickets', icon: MdConfirmationNumber, label: 'Tickets', roles: ['ADMIN', 'STAFF', 'STUDENT'] },
  { path: '/admin/bookings', icon: MdAdminPanelSettings, label: 'Manage Bookings', roles: ['ADMIN', 'STAFF'] },
  { path: '/admin/users', icon: MdPeople, label: 'User Management', roles: ['ADMIN'] },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useAuth();
  const filtered = NAV_ITEMS.filter(i => i.roles.includes(user?.role));

  return (
    <aside className={`cs-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="cs-sb-head">
       <button className="cs-icon-btn" onClick={() => setCollapsed && setCollapsed(v => !v)}>
          <MdMenu size={18} />
        </button>
        {!collapsed && <h3>CampusOps</h3>}
      </div>

      <nav className="cs-sb-menu">
        {filtered.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} className="cs-link">
            <Icon className="cs-link-ic" size={17} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}