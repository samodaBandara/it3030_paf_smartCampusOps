import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  MdAdd, MdEdit, MdVisibility, MdClose, MdPerson,
  MdEmail, MdLock, MdAdminPanelSettings, MdDelete,
  MdSearch, MdFilterList, MdWarning
} from 'react-icons/md';
import { FaUserGraduate, FaUserTie, FaUserShield, FaUsers } from 'react-icons/fa';
import '../css/AdminUsers.css';

const ROLE_CONFIG = {
  ADMIN: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  STAFF: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  STUDENT: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const load = async () => {
    try { const res = await api.get('/auth/users'); setUsers(res.data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (editUser) {
        await api.put(`/auth/users/${editUser.id}`, { name: form.name, role: form.role });
        setSuccess('User updated successfully');
      } else {
        await api.post('/auth/register', form);
        setSuccess(`${form.role} account created`);
      }
      setForm({ name: '', email: '', password: '', role: 'STAFF' });
      setShowForm(false); setEditUser(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setEditUser(u); setShowForm(true); setViewUser(null);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/auth/users/${deleteUser.id}`);
      setDeleteUser(null);
      load();
    } catch { setError('Failed to delete user'); }
  };

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    return (!s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s))
      && (!filterRole || u.role === filterRole);
  });

  const stats = [
    { label: 'Total Users', value: users.length, color: '#4f46e5', icon: <FaUsers size={28} /> },
    { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: '#92400e', icon: <FaUserShield size={28} /> },
    { label: 'Staff', value: users.filter(u => u.role === 'STAFF').length, color: '#1e40af', icon: <FaUserTie size={28} /> },
    { label: 'Students', value: users.filter(u => u.role === 'STUDENT').length, color: '#166534', icon: <FaUserGraduate size={28} /> },
  ];

  return (
    <Layout>
      <div className="au-page">

        {/* header */}
        <div className="au-header">
          <div className="au-header-text">
            <h1>User Management</h1>
            <p>Manage campus accounts and access roles</p>
          </div>
          <button className="au-create-btn" onClick={() => {
            setShowForm(!showForm); setEditUser(null);
            setForm({ name: '', email: '', password: '', role: 'STAFF' });
          }}>
            <MdAdd size={18} /> Create Account
          </button>
        </div>

        {/* stats */}
        <div className="au-stats">
          {stats.map(s => (
            <div key={s.label} className="au-stat-card" style={{ '--stat-color': s.color }}>
              <div className="au-stat-value">{s.value}</div>
              <div className="au-stat-label">{s.label}</div>
              <div className="au-stat-icon">{s.icon}</div>
            </div>
          ))}
        </div>

        {/* form */}
        {showForm && (
          <div className="au-form-card">
            <div className="au-form-header">
              <h3>{editUser ? '✏️ Edit User' : '➕ Create New Account'}</h3>
              <button className="au-close-btn" onClick={() => { setShowForm(false); setEditUser(null); }}>
                <MdClose size={16} />
              </button>
            </div>
            {error && <div className="au-alert error">⚠️ {error}</div>}
            {success && <div className="au-alert success">✅ {success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="au-form-grid">
                <div className="au-field">
                  <label>Full Name</label>
                  <div className="au-input-wrap">
                    <MdPerson size={15} />
                    <input placeholder="John Doe" value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                </div>
                {!editUser && <>
                  <div className="au-field">
                    <label>Email</label>
                    <div className="au-input-wrap">
                      <MdEmail size={15} />
                      <input type="email" placeholder="user@university.edu" value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})} required />
                    </div>
                  </div>
                  <div className="au-field">
                    <label>Password</label>
                    <div className="au-input-wrap">
                      <MdLock size={15} />
                      <input type="password" placeholder="Min 6 characters" value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
                    </div>
                  </div>
                </>}
                <div className="au-field">
                  <label>Role</label>
                  <div className="au-input-wrap">
                    <MdAdminPanelSettings size={15} />
                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="au-form-actions">
                <button type="submit" className="au-submit-btn">
                  {editUser ? 'Update User' : 'Create Account'}
                </button>
                <button type="button" className="au-cancel-btn"
                  onClick={() => { setShowForm(false); setEditUser(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* filters */}
        <div className="au-filters">
          <div className="au-search-wrap">
            <MdSearch size={16} />
            <input placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="au-filter-wrap">
            <MdFilterList size={15} />
            <select className="au-filter-select" value={filterRole}
              onChange={e => setFilterRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>
        </div>

        {/* table */}
        <div className="au-table-wrap">
          <table className="au-table">
            <thead>
              <tr>
                {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const rc = ROLE_CONFIG[u.role] || {};
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="au-user-cell">
                        <div className="au-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                        <span className="au-user-name">{u.name}</span>
                      </div>
                    </td>
                    <td className="au-email">{u.email}</td>
                    <td>
                      <span className="au-role-badge" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="au-date">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="au-actions">
                        <button className="au-btn au-btn-view" onClick={() => setViewUser(u)}>
                          <MdVisibility size={13} /> View
                        </button>
                        <button className="au-btn au-btn-edit" onClick={() => handleEdit(u)}>
                          <MdEdit size={13} /> Edit
                        </button>
                        <button className="au-btn au-btn-delete" onClick={() => setDeleteUser(u)}>
                          <MdDelete size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="au-empty">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* view modal */}
      {viewUser && (
        <div className="au-modal-overlay" onClick={() => setViewUser(null)}>
          <div className="au-modal" onClick={e => e.stopPropagation()}>
            <div className="au-modal-header">
              <h3>User Details</h3>
              <button className="au-close-btn" onClick={() => setViewUser(null)}><MdClose size={16} /></button>
            </div>
            <div className="au-modal-avatar-wrap">
              <div className="au-modal-avatar">{viewUser.name?.charAt(0).toUpperCase()}</div>
              <p className="au-modal-name">{viewUser.name}</p>
              <p className="au-modal-email">{viewUser.email}</p>
              <span className="au-role-badge" style={{ background: ROLE_CONFIG[viewUser.role]?.bg, color: ROLE_CONFIG[viewUser.role]?.color, border: `1px solid ${ROLE_CONFIG[viewUser.role]?.border}` }}>
                {viewUser.role}
              </span>
            </div>
            <div className="au-modal-info">
              <div className="au-modal-info-row">
                <span>User ID</span><span>#{viewUser.id}</span>
              </div>
              <div className="au-modal-info-row">
                <span>Joined</span><span>{new Date(viewUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="au-modal-info-row">
                <span>Role</span><span>{viewUser.role}</span>
              </div>
            </div>
            <button className="au-modal-edit-btn" onClick={() => handleEdit(viewUser)}>
              <MdEdit size={16} /> Edit User
            </button>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {deleteUser && (
        <div className="au-delete-overlay">
          <div className="au-delete-modal">
            <div className="au-delete-icon">
              <MdWarning size={28} color="#ef4444" />
            </div>
            <h3>Delete User?</h3>
            <p>Are you sure you want to delete <strong>{deleteUser.name}</strong>? This action cannot be undone.</p>
            <div className="au-delete-actions">
              <button className="au-delete-cancel" onClick={() => setDeleteUser(null)}>Cancel</button>
              <button className="au-delete-confirm" onClick={handleDelete}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}