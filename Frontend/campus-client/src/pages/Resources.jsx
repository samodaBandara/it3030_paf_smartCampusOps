import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  MdAdd, MdEdit, MdDelete, MdExpandMore, MdExpandLess,
  MdLocationOn, MdPeople, MdBusiness, MdClose, MdWarning
} from 'react-icons/md';
import '../css/Resources.css';

const TYPE_ICONS = {
  LECTURE_HALL: '🏛️',
  LAB: '🔬',
  MEETING_ROOM: '🤝',
  EQUIPMENT: '🔧',
};

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Halls',
  LAB: 'Laboratories',
  MEETING_ROOM: 'Meeting Rooms',
  EQUIPMENT: 'Equipment',
};

const CONDITION_CONFIG = {
  GOOD: { bg: '#dcfce7', color: '#166534', label: 'Good' },
  UNDER_REPAIR: { bg: '#fef3c7', color: '#92400e', label: 'Under Repair' },
  DAMAGED: { bg: '#fee2e2', color: '#dc2626', label: 'Damaged' },
};

export default function Resources() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [assets, setAssets] = useState({});
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(null);
  const [editResource, setEditResource] = useState(null);
  const [editAsset, setEditAsset] = useState(null);
  const [deleteResourceId, setDeleteResourceId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [search, setSearch] = useState('');

  const [resourceForm, setResourceForm] = useState({
    name: '', type: 'LECTURE_HALL', capacity: '',
    building: '', floor: '', location: '', status: 'ACTIVE'
  });

  const [assetForm, setAssetForm] = useState({
    name: '', quantity: 1, condition: 'GOOD',
    assetCode: '', isTracked: false, error: ''
  });

  const loadResources = async () => {
    const res = await api.get('/resources');
    setResources(res.data);
  };

  const loadAssets = async (resourceId) => {
    const res = await api.get(`/resources/${resourceId}/assets`);
    setAssets(prev => ({ ...prev, [resourceId]: res.data }));
  };

  useEffect(() => { loadResources(); }, []);

  const toggleExpand = (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!assets[id]) loadAssets(id);
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    if (editResource) {
      await api.put(`/resources/${editResource.id}`, resourceForm);
    } else {
      await api.post('/resources', resourceForm);
    }
    setShowResourceForm(false); setEditResource(null);
    setResourceForm({ name: '', type: 'LECTURE_HALL', capacity: '', building: '', floor: '', location: '', status: 'ACTIVE' });
    loadResources();
  };

  const handleEditResource = (r) => {
    setResourceForm({
      name: r.name, type: r.type, capacity: r.capacity || '',
      building: r.building || '', floor: r.floor || '',
      location: r.location || '', status: r.status
    });
    setEditResource(r); setShowResourceForm(true);
  };

  const handleDeleteResource = async () => {
    await api.delete(`/resources/${deleteResourceId}`);
    setDeleteResourceId(null); loadResources();
  };

  const handleAssetSubmit = async (e, resourceId) => {
    e.preventDefault();
    try {
      const payload = {
        name: assetForm.name,
        quantity: assetForm.isTracked ? 1 : assetForm.quantity,
        condition: assetForm.condition,
        assetCode: assetForm.isTracked ? assetForm.assetCode : null,
        isTracked: assetForm.isTracked,
      };
      if (editAsset) {
        await api.put(`/resources/${resourceId}/assets/${editAsset.id}`, payload);
      } else {
        await api.post(`/resources/${resourceId}/assets`, payload);
      }
      setShowAssetForm(null); setEditAsset(null);
      setAssetForm({ name: '', quantity: 1, condition: 'GOOD', assetCode: '', isTracked: false, error: '' });
      loadAssets(resourceId);
    } catch (err) {
      setAssetForm(prev => ({...prev, error: err.response?.data?.error || 'Failed to save asset'}));
    }
  };

  const handleEditAsset = (asset, resourceId) => {
    setAssetForm({
      name: asset.name, quantity: asset.quantity,
      condition: asset.condition, assetCode: asset.assetCode || '',
      isTracked: asset.isTracked || false, error: ''
    });
    setEditAsset(asset); setShowAssetForm(resourceId);
  };

  const handleDeleteAsset = async (resourceId, assetId) => {
    await api.delete(`/resources/${resourceId}/assets/${assetId}`);
    loadAssets(resourceId);
  };

  const filtered = resources.filter(r => {
    const matchType = !filterType || r.type === filterType;
    const matchBuilding = !filterBuilding || r.building === filterBuilding;
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchBuilding && matchSearch;
  });

  const buildings = [...new Set(resources.map(r => r.building || 'Unassigned'))].sort();

  const grouped = {};
  filtered.forEach(r => {
    const b = r.building || 'Unassigned';
    const t = r.type || 'OTHER';
    if (!grouped[b]) grouped[b] = {};
    if (!grouped[b][t]) grouped[b][t] = [];
    grouped[b][t].push(r);
  });

  const totalActive = resources.filter(r => r.status === 'ACTIVE').length;

  return (
    <Layout>
      <div className="res-page">

        <div className="res-header">
          <div>
            <h1 className="res-title">Facilities & Resources</h1>
            <p className="res-subtitle">{resources.length} resources · {totalActive} active</p>
          </div>
          {isAdmin && (
            <button className="res-add-btn" onClick={() => {
              setShowResourceForm(!showResourceForm); setEditResource(null);
              setResourceForm({ name: '', type: 'LECTURE_HALL', capacity: '', building: '', floor: '', location: '', status: 'ACTIVE' });
            }}>
              <MdAdd size={18} /> Add Resource
            </button>
          )}
        </div>

        {showResourceForm && isAdmin && (
          <div className="res-form-card">
            <div className="res-form-header">
              <h3>{editResource ? 'Edit Resource' : 'Add New Resource'}</h3>
              <button className="res-close-btn" onClick={() => { setShowResourceForm(false); setEditResource(null); }}>
                <MdClose size={16} />
              </button>
            </div>
            <form onSubmit={handleResourceSubmit} className="res-form-grid">
              <div className="res-field">
                <label>Resource Name</label>
                <input placeholder="e.g. Hall A101" value={resourceForm.name}
                  onChange={e => setResourceForm({...resourceForm, name: e.target.value})} required />
              </div>
              <div className="res-field">
                <label>Type</label>
                <select value={resourceForm.type} onChange={e => setResourceForm({...resourceForm, type: e.target.value})}>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Laboratory</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
              </div>
              <div className="res-field">
                <label>Building</label>
                <input placeholder="e.g. Block A" value={resourceForm.building}
                  onChange={e => setResourceForm({...resourceForm, building: e.target.value})} />
              </div>
              <div className="res-field">
                <label>Floor</label>
                <input placeholder="e.g. Ground Floor" value={resourceForm.floor}
                  onChange={e => setResourceForm({...resourceForm, floor: e.target.value})} />
              </div>
              <div className="res-field">
                <label>Room / Location Detail</label>
                <input placeholder="e.g. Room 101" value={resourceForm.location}
                  onChange={e => setResourceForm({...resourceForm, location: e.target.value})} />
              </div>
              <div className="res-field">
                <label>Capacity</label>
                <input type="number" placeholder="e.g. 80" value={resourceForm.capacity}
                  onChange={e => setResourceForm({...resourceForm, capacity: e.target.value})} />
              </div>
              <div className="res-field">
                <label>Status</label>
                <select value={resourceForm.status} onChange={e => setResourceForm({...resourceForm, status: e.target.value})}>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="res-submit-btn">{editResource ? 'Update' : 'Create'} Resource</button>
                <button type="button" className="res-cancel-btn" onClick={() => { setShowResourceForm(false); setEditResource(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="res-filters">
          <div className="res-search-wrap">
            <input placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="res-filter-select" value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)}>
            <option value="">All Buildings</option>
            {buildings.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="res-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Halls</option>
            <option value="LAB">Labs</option>
            <option value="MEETING_ROOM">Meeting Rooms</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>

        {Object.keys(grouped).length === 0 && (
          <div className="res-empty">No resources found. {isAdmin && 'Add one above.'}</div>
        )}

        {Object.entries(grouped).map(([building, types]) => (
          <div key={building} className="res-building-section">
            <div className="res-building-header">
              <MdBusiness size={18} />
              <h2>{building}</h2>
              <span className="res-building-count">{Object.values(types).flat().length} resources</span>
            </div>

            {Object.entries(types).map(([type, rooms]) => (
              <div key={type} className="res-type-section">
                <div className="res-type-header">
                  <span className="res-type-icon">{TYPE_ICONS[type] || '🏢'}</span>
                  <h3>{TYPE_LABELS[type] || type}</h3>
                  <span className="res-type-count">{rooms.length}</span>
                </div>

                <div className="res-cards-grid">
                  {rooms.map(r => (
                    <div key={r.id} className={`res-card ${expandedId === r.id ? 'expanded' : ''}`}>

                      <div className="res-card-top" onClick={() => toggleExpand(r.id)}>
                        <div className="res-card-info">
                          <div className="res-card-name">{r.name}</div>
                          <div className="res-card-meta">
                            {r.floor && <span><MdBusiness size={12} /> {r.floor}</span>}
                            {r.location && <span><MdLocationOn size={12} /> {r.location}</span>}
                            {r.capacity && <span><MdPeople size={12} /> {r.capacity}</span>}
                          </div>
                        </div>
                        <div className="res-card-right">
                          <span className={`res-status ${r.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                            {r.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                          </span>
                          <span className="res-expand-icon">
                            {expandedId === r.id ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="res-card-actions">
                          <button className="res-btn res-btn-edit" onClick={() => handleEditResource(r)}>
                            <MdEdit size={13} /> Edit
                          </button>
                          <button className="res-btn res-btn-delete" onClick={() => setDeleteResourceId(r.id)}>
                            <MdDelete size={13} /> Delete
                          </button>
                        </div>
                      )}

                      {expandedId === r.id && (
                        <div className="res-assets-section">
                          <div className="res-assets-header">
                            <span>Assets & Equipment</span>
                            {isAdmin && (
                              <button className="res-add-asset-btn" onClick={() => {
                                setShowAssetForm(showAssetForm === r.id ? null : r.id);
                                setEditAsset(null);
                                setAssetForm({ name: '', quantity: 1, condition: 'GOOD', assetCode: '', isTracked: false, error: '' });
                              }}>
                                <MdAdd size={14} /> Add Asset
                              </button>
                            )}
                          </div>

                          {showAssetForm === r.id && isAdmin && (
                            <div className="res-asset-form-card">
                              <div className="res-asset-form-tabs">
                                <button type="button"
                                  className={`res-asset-tab ${assetForm.isTracked ? 'active' : ''}`}
                                  onClick={() => setAssetForm({...assetForm, isTracked: true, quantity: 1, error: ''})}>
                                  🏷️ Tracked Asset
                                </button>
                                <button type="button"
                                  className={`res-asset-tab ${!assetForm.isTracked ? 'active' : ''}`}
                                  onClick={() => setAssetForm({...assetForm, isTracked: false, assetCode: '', error: ''})}>
                                  📦 Bulk Asset
                                </button>
                              </div>

                              <form onSubmit={e => handleAssetSubmit(e, r.id)} className="res-asset-form">
                                <div className="res-asset-field">
                                  <label>Asset Name</label>
                                  <input
                                    placeholder={assetForm.isTracked ? 'e.g. Projector, PC, AC' : 'e.g. Chair, Table'}
                                    value={assetForm.name}
                                    onChange={e => setAssetForm({...assetForm, name: e.target.value})} required />
                                </div>

                                {assetForm.isTracked ? (
                                  <div className="res-asset-field">
                                    <label>Asset Code</label>
                                    <input placeholder="e.g. PROJ-A101-01"
                                      value={assetForm.assetCode}
                                      onChange={e => setAssetForm({...assetForm, assetCode: e.target.value})} required />
                                  </div>
                                ) : (
                                  <div className="res-asset-field">
                                    <label>Quantity</label>
                                    <input type="number" min="1" placeholder="e.g. 50"
                                      value={assetForm.quantity}
                                      onChange={e => setAssetForm({...assetForm, quantity: e.target.value})} required />
                                  </div>
                                )}

                                <div className="res-asset-field">
                                  <label>Condition</label>
                                  <select value={assetForm.condition}
                                    onChange={e => setAssetForm({...assetForm, condition: e.target.value})}>
                                    <option value="GOOD">Good</option>
                                    <option value="UNDER_REPAIR">Under Repair</option>
                                    <option value="DAMAGED">Damaged</option>
                                  </select>
                                </div>

                                {assetForm.error && (
                                  <div style={{ gridColumn: '1/-1', color: '#dc2626', fontSize: '0.8rem', background: '#fee2e2', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                                    ⚠️ {assetForm.error}
                                  </div>
                                )}

                                <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.5rem' }}>
                                  <button type="submit" className="res-asset-submit">
                                    {editAsset ? 'Update' : 'Add'} Asset
                                  </button>
                                  <button type="button" className="res-asset-cancel"
                                    onClick={() => { setShowAssetForm(null); setEditAsset(null); }}>
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}

                          <div className="res-asset-list">
                            {(assets[r.id] || []).length === 0 && (
                              <div className="res-no-assets">No assets recorded yet</div>
                            )}
                            {(assets[r.id] || []).map(a => {
                              const cc = CONDITION_CONFIG[a.condition] || CONDITION_CONFIG.GOOD;
                              return (
                                <div key={a.id} className="res-asset-item">
                                  <div className="res-asset-left">
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                        <span className="res-asset-name">{a.name}</span>
                                        {a.isTracked && a.assetCode && (
                                          <span className="res-asset-code">{a.assetCode}</span>
                                        )}
                                        {!a.isTracked && (
                                          <span className="res-asset-qty">×{a.quantity}</span>
                                        )}
                                      </div>
                                      <span className="res-asset-condition" style={{ background: cc.bg, color: cc.color }}>
                                        {cc.label}
                                      </span>
                                    </div>
                                  </div>
                                  {isAdmin && (
                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                      <button className="res-btn res-btn-edit" onClick={() => handleEditAsset(a, r.id)}>
                                        <MdEdit size={12} />
                                      </button>
                                      <button className="res-btn res-btn-delete" onClick={() => handleDeleteAsset(r.id, a.id)}>
                                        <MdDelete size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {deleteResourceId && (
        <div className="res-overlay" onClick={() => setDeleteResourceId(null)}>
          <div className="res-delete-modal" onClick={e => e.stopPropagation()}>
            <div className="res-delete-icon"><MdWarning size={28} color="#ef4444" /></div>
            <h3>Delete Resource?</h3>
            <p>This will also delete all assets inside. This cannot be undone.</p>
            <div className="res-delete-actions">
              <button className="res-delete-cancel" onClick={() => setDeleteResourceId(null)}>Cancel</button>
              <button className="res-delete-confirm" onClick={handleDeleteResource}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}