import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import '../css/Bookings.css';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ resourceId: '', startTime: '', endTime: '', purpose: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const [b, r] = await Promise.all([api.get('/bookings/my'), api.get('/resources')]);
    setBookings(b.data);
    setResources(r.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/bookings', form);
      setShowForm(false);
      setForm({ resourceId: '', startTime: '', endTime: '', purpose: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this booking?')) {
      await api.patch(`/bookings/${id}/cancel`);
      load();
    }
  };

  const statusColor = { PENDING: '#f59e0b', APPROVED: '#16a34a', REJECTED: '#dc2626', CANCELLED: '#94a3b8' };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="page-content">
        <div className="page-header">
          <h1>My Bookings</h1>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ New Booking</button>
        </div>

        {showForm && (
          <div className="form-card">
            <h3>New Booking</h3>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <select value={form.resourceId} onChange={e => setForm({...form, resourceId: e.target.value})} required>
                <option value="">Select Resource</option>
                {resources.filter(r => r.status === 'ACTIVE').map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                ))}
              </select>
              <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
              <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required />
              <input placeholder="Purpose" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} required />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn-primary">Submit</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bookings-table">
          <table>
            <thead>
              <tr><th>Resource</th><th>Start</th><th>End</th><th>Purpose</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>{resources.find(r => r.id === b.resourceId)?.name || b.resourceId}</td>
                  <td>{new Date(b.startTime).toLocaleString()}</td>
                  <td>{new Date(b.endTime).toLocaleString()}</td>
                  <td>{b.purpose}</td>
                  <td><span style={{ color: statusColor[b.status], fontWeight: 600 }}>{b.status}</span></td>
                  <td>{b.status === 'PENDING' || b.status === 'APPROVED' ? (
                    <button className="btn-sm btn-danger" onClick={() => handleCancel(b.id)}>Cancel</button>
                  ) : '-'}</td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>No bookings yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}