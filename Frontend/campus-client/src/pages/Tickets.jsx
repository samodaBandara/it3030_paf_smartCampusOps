import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../css/Tickets.css';

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get('/tickets');
    setTickets(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      fd.append('description', description);
      fd.append('priority', priority);
      files.forEach(f => fd.append('files', f));
      await api.post('/tickets', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setDescription(''); setPriority('MEDIUM'); setFiles([]);
      load();
    } catch (err) {
      setError('Failed to create ticket');
    }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/tickets/${id}/status`, { status });
    load();
  };

  const priorityColor = { LOW: '#16a34a', MEDIUM: '#f59e0b', HIGH: '#dc2626' };
  const statusColor = { OPEN: '#2563eb', IN_PROGRESS: '#f59e0b', RESOLVED: '#16a34a', CLOSED: '#94a3b8', REJECTED: '#dc2626' };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="page-content">
        <div className="page-header">
          <h1>Tickets</h1>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ New Ticket</button>
        </div>

        {showForm && (
          <div className="form-card">
            <h3>Report Incident</h3>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <textarea placeholder="Describe the issue..." value={description}
                onChange={e => setDescription(e.target.value)} required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '100px', fontSize: '0.95rem' }} />
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
              <input type="file" multiple accept="image/*"
                onChange={e => setFiles(Array.from(e.target.files).slice(0, 3))} />
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Max 3 images</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn-primary">Submit</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="tickets-list">
          {tickets.map(t => (
            <div key={t.id} className="ticket-card">
              <div className="ticket-header">
                <span style={{ color: priorityColor[t.priority], fontWeight: 600, fontSize: '0.85rem' }}>
                  {t.priority} PRIORITY
                </span>
                <span style={{ color: statusColor[t.status], fontWeight: 600, fontSize: '0.85rem' }}>
                  {t.status}
                </span>
              </div>
              <p className="ticket-desc">{t.description}</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                #{t.id} · {new Date(t.createdAt).toLocaleDateString()}
              </p>
              {user?.role === 'ADMIN' && t.status !== 'CLOSED' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {t.status === 'OPEN' && <button className="btn-sm" onClick={() => updateStatus(t.id, 'IN_PROGRESS')}>Start</button>}
                  {t.status === 'IN_PROGRESS' && <button className="btn-sm" style={{ background: '#dcfce7', color: '#16a34a' }} onClick={() => updateStatus(t.id, 'RESOLVED')}>Resolve</button>}
                  {t.status === 'RESOLVED' && <button className="btn-sm" onClick={() => updateStatus(t.id, 'CLOSED')}>Close</button>}
                  <button className="btn-sm btn-danger" onClick={() => updateStatus(t.id, 'REJECTED')}>Reject</button>
                </div>
              )}
            </div>
          ))}
          {tickets.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem' }}>No tickets yet</p>}
        </div>
      </div>
    </div>
  );
}