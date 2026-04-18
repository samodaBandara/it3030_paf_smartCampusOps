import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [reason, setReason] = useState('');

  const load = async () => {
    const [b, r] = await Promise.all([api.get('/bookings'), api.get('/resources')]);
    setBookings(b.data);
    setResources(r.data);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await api.patch(`/bookings/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    const r = prompt('Reason for rejection:');
    if (!r) return;
    await api.patch(`/bookings/${id}/reject`, { reason: r });
    load();
  };

  const statusColor = { PENDING: '#f59e0b', APPROVED: '#16a34a', REJECTED: '#dc2626', CANCELLED: '#94a3b8' };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="page-content">
        <div className="page-header"><h1>All Bookings (Admin)</h1></div>
        <div className="bookings-table">
          <table>
            <thead>
              <tr><th>ID</th><th>User ID</th><th>Resource</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>{b.userId}</td>
                  <td>{resources.find(r => r.id === b.resourceId)?.name || b.resourceId}</td>
                  <td>{new Date(b.startTime).toLocaleString()}</td>
                  <td>{new Date(b.endTime).toLocaleString()}</td>
                  <td><span style={{ color: statusColor[b.status], fontWeight: 600 }}>{b.status}</span></td>
                  <td>
                    {b.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-sm" style={{ background: '#dcfce7', color: '#16a34a' }} onClick={() => approve(b.id)}>Approve</button>
                        <button className="btn-sm btn-danger" onClick={() => reject(b.id)}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}