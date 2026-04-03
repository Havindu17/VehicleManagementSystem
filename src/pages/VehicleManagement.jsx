import { useState, useEffect, useCallback } from 'react';
import ExportBtn from '../components/Exportbtn';
import { vehicleService, customerService } from '../utils/api';
import "../style.css";

const EMPTY = { plate: '', owner: '', ownerPhone: '', make: '', model: '', year: '', color: '', fuel: 'Petrol', mileage: '', lastService: '', nextService: '', insuranceExp: '', revenueExp: '', emissionExp: '', status: 'Active' };

const MODELS = {
  Toyota:  ['Corolla', 'Camry', 'Prius', 'Hilux', 'Land Cruiser', 'Aqua', 'Axio', 'Allion', 'Premio', 'Vitz', 'Rush', 'Fortuner'],
  Honda:   ['Civic', 'Fit', 'Vezel', 'CR-V', 'HR-V', 'Grace', 'Freed', 'Accord', 'City', 'Stream'],
  Nissan:  ['Sunny', 'X-Trail', 'Leaf', 'Dayz', 'Note', 'Serena', 'Tiida', 'Navara', 'Patrol'],
  Suzuki:  ['Alto', 'Swift', 'Vitara', 'Jimny', 'Wagon R', 'Baleno', 'Ertiga', 'Ciaz', 'S-Presso'],
  BMW:     ['320i', '520i', 'X3', 'X5', 'M3', 'M5', '118i', '218i', 'X1'],
  Mitsubishi: ['Lancer', 'Outlander', 'Pajero', 'L200', 'ASX', 'Eclipse Cross'],
  Mazda:   ['Axela', 'Atenza', 'CX-5', 'CX-3', 'Demio', 'BT-50'],
  Hyundai: ['i10', 'i20', 'Tucson', 'Santa Fe', 'Elantra', 'Creta'],
  Kia:     ['Picanto', 'Sportage', 'Sorento', 'Rio', 'Stonic'],
};

const COLORS = [
  'White', 'Pearl White', 'Silver', 'Black', 'Grey',
  'Red', 'Blue', 'Navy Blue', 'Green', 'Brown',
  'Yellow', 'Orange', 'Gold', 'Maroon', 'Beige',
];

const MAKES = Object.keys(MODELS);

const daysUntil = d => { try { return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)); } catch { return 999; } };
const expClass  = d => { const days = daysUntil(d); return days <= 7 ? 'bg-red' : days <= 30 ? 'bg-orange' : 'bg-green'; };
const FUEL_C    = { Petrol: 'bg-blue', Diesel: 'bg-orange', Electric: 'bg-green', Hybrid: 'bg-cyan' };
const ICONS     = { Toyota: '🚗', Honda: '🚙', Nissan: '🚘', Suzuki: '🚕', BMW: '🏎️', Mitsubishi: '🚐', Mazda: '🚗', Hyundai: '🚙', Kia: '🚘' };

export default function VehicleManagement() {
  const [rows, setRows]           = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(false);
  const [histModal, setHistModal] = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [editId, setEditId]       = useState(null);
  const [toast, setToast]         = useState('');
  const [loading, setLoading]     = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const h = e => {
    const { name, value } = e.target;
    if (name === 'make') {
      setForm(f => ({ ...f, make: value, model: '' }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [v, c] = await Promise.all([vehicleService.getAll(), customerService.getAll()]);
      setRows(v);
      setCustomers(c);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleOwnerChange = e => {
    const name = e.target.value;
    const match = customers.find(c => c.fullName === name);
    setForm(f => ({ ...f, owner: name, ownerPhone: match?.phone || '' }));
  };

  const expiring = rows.filter(r =>
    daysUntil(r.insuranceExp) <= 7 || daysUntil(r.revenueExp) <= 7 || daysUntil(r.emissionExp) <= 7
  );

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return (r.plate || '').toLowerCase().includes(q) || (r.owner || '').toLowerCase().includes(q) || (r.make || '').toLowerCase().includes(q);
  });

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = r => {
    setForm({
      ...r,
      lastService:  r.lastService  ? r.lastService.toString().slice(0, 10)  : '',
      nextService:  r.nextService  ? r.nextService.toString().slice(0, 10)  : '',
      insuranceExp: r.insuranceExp ? r.insuranceExp.toString().slice(0, 10) : '',
      revenueExp:   r.revenueExp   ? r.revenueExp.toString().slice(0, 10)   : '',
      emissionExp:  r.emissionExp  ? r.emissionExp.toString().slice(0, 10)  : '',
    });
    setEditId(r.id);
    setModal(true);
  };

  const save = async () => {
    if (!form.plate || !form.owner || !form.make) { alert('Plate, owner and make required.'); return; }
    try {
      if (editId) {
        await vehicleService.update(editId, form);
        showToast('✅ Vehicle updated');
      } else {
        await vehicleService.create(form);
        showToast('✅ Vehicle added');
      }
      setModal(false);
      loadAll();
    } catch (err) { alert(err.message); }
  };

  const del = async id => {
    if (!confirm('Remove vehicle?')) return;
    try {
      await vehicleService.delete(id);
      showToast('🗑 Removed');
      loadAll();
    } catch (err) { alert(err.message); }
  };

  const exportData = filtered.map(r => ({
    ID: r.vehicleCode, 'Plate No': r.plate, Owner: r.owner, 'Owner Phone': r.ownerPhone,
    Make: r.make, Model: r.model, Year: r.year, Color: r.color, Fuel: r.fuel,
    Mileage: r.mileage, 'Insurance Exp': r.insuranceExp, Status: r.status,
  }));

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Vehicle Management</div></div>
        <div className="page-actions">
          <ExportBtn data={exportData} filename="vehicles-export" title="Vehicle Management Report" />
          <button className="btn btn-accent" onClick={openAdd}>＋ Add Vehicle</button>
        </div>
      </div>

      {expiring.length > 0 && (
        <div className="alert-box alert-warn">
          ⚠️ <strong>{expiring.length} vehicle(s)</strong> have documents expiring within 7 days: {expiring.map(r => r.plate).join(', ')}
        </div>
      )}

      <div className="stats-row stats-4">
        {[
          { icon: '🚗', label: 'Total Vehicles', val: rows.length,                                          color: 'sc-blue'   },
          { icon: '✅', label: 'Active',          val: rows.filter(r => r.status === 'Active').length,       color: 'sc-green'  },
          { icon: '🔧', label: 'Service Due',     val: rows.filter(r => r.status === 'Service Due').length,  color: 'sc-orange' },
          { icon: '⚠️', label: 'Docs Expiring',   val: expiring.length,                                     color: 'sc-red'    },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="tcard">
        <div className="tcard-bar">
          <div className="tcard-title">🚗 Vehicle Registry</div>
          <div className="tbar-right">
            <div className="search-wrap">
              <input className="search-box" placeholder="Plate / Owner / Make..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">Loading vehicles...</div></div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr>{['Vehicle', 'Plate', 'Owner', 'Fuel', 'Mileage', 'Insurance Exp', 'Revenue Exp', 'Emission Exp', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.3rem' }}>{ICONS[r.make] || '🚗'}</span>
                        <div>
                          <div className="text-bold">{r.make} {r.model}</div>
                          <div style={{ fontSize: '.74rem', color: 'var(--text2)' }}>{r.year} · {r.color}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="mono text-accent" style={{ fontWeight: 700 }}>{r.plate}</span></td>
                    <td>
                      <div className="text-bold">{r.owner}</div>
                      <div style={{ fontSize: '.76rem', color: 'var(--text2)' }}>{r.ownerPhone}</div>
                    </td>
                    <td><span className={`badge ${FUEL_C[r.fuel] || 'bg-muted'}`}>{r.fuel}</span></td>
                    <td><span className="mono" style={{ fontSize: '.82rem' }}>{r.mileage} km</span></td>
                    <td>
                      <span className={`badge ${expClass(r.insuranceExp)}`}>{r.insuranceExp}</span>
                      {daysUntil(r.insuranceExp) <= 7 && <div style={{ fontSize: '.68rem', color: 'var(--red)', marginTop: 2 }}>⚠ {daysUntil(r.insuranceExp)}d left</div>}
                    </td>
                    <td>
                      <span className={`badge ${expClass(r.revenueExp)}`}>{r.revenueExp}</span>
                      {daysUntil(r.revenueExp) <= 7 && <div style={{ fontSize: '.68rem', color: 'var(--red)', marginTop: 2 }}>⚠ {daysUntil(r.revenueExp)}d left</div>}
                    </td>
                    <td><span className={`badge ${expClass(r.emissionExp)}`}>{r.emissionExp}</span></td>
                    <td><span className={`badge ${r.status === 'Active' ? 'bg-green' : r.status === 'Service Due' ? 'bg-orange' : 'bg-red'}`}>{r.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn btn-blue btn-xs" onClick={() => setHistModal(r)}>📋</button>
                        <button className="btn btn-outline btn-xs" onClick={() => openEdit(r)}>✏️</button>
                        <button className="btn btn-danger btn-xs" onClick={() => del(r.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10}><div className="empty-state"><div className="empty-icon">🚗</div><div className="empty-text">No vehicles found</div></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="tfoot"><span>{filtered.length} of {rows.length} vehicles</span></div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-head">
              <div className="modal-title">{editId ? '✏️ Edit Vehicle' : '＋ Add Vehicle'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            {/* Basic Info */}
            <div className="section-title">Basic Info</div>
            <div className="form-row">
              <div className="field">
                <label>Plate No. *</label>
                <input name="plate" value={form.plate} onChange={h} placeholder="CAB-1234" />
              </div>
              <div className="field">
                <label>Owner Name *</label>
                <select name="owner" value={form.owner} onChange={handleOwnerChange}>
                  <option value="">— Select customer —</option>
                  {customers.map(c => <option key={c.id} value={c.fullName}>{c.fullName}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>Owner Phone</label>
                <input name="ownerPhone" value={form.ownerPhone} onChange={h} placeholder="Auto-filled" />
              </div>
              <div className="field">
                <label>Make *</label>
                <select name="make" value={form.make} onChange={h}>
                  <option value="">— Select make —</option>
                  {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row-3">
              {/* ── Model Dropdown ── */}
              <div className="field">
                <label>Model</label>
                <select name="model" value={form.model} onChange={h}>
                  <option value="">— Select model —</option>
                  {(MODELS[form.make] || []).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Year</label>
                <input name="year" type="number" value={form.year} onChange={h} placeholder="2020" />
              </div>

              {/* ── Color Dropdown ── */}
              <div className="field">
                <label>Color</label>
                <select name="color" value={form.color} onChange={h}>
                  <option value="">— Select color —</option>
                  {COLORS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>Fuel Type</label>
                <select name="fuel" value={form.fuel} onChange={h}>
                  {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Mileage (km)</label>
                <input name="mileage" value={form.mileage} onChange={h} placeholder="50000" />
              </div>
            </div>

            {/* Service Dates */}
            <div className="section-title" style={{ marginTop: 4 }}>Service Dates</div>
            <div className="form-row">
              <div className="field">
                <label>Last Service</label>
                <input name="lastService" type="date" value={form.lastService} onChange={h} />
              </div>
              <div className="field">
                <label>Next Service</label>
                <input name="nextService" type="date" value={form.nextService} onChange={h} />
              </div>
            </div>

            {/* Document Expiry */}
            <div className="section-title" style={{ marginTop: 4 }}>Document Expiry Dates</div>
            <div className="form-row-3">
              <div className="field">
                <label>Insurance Exp.</label>
                <input name="insuranceExp" type="date" value={form.insuranceExp} onChange={h} />
              </div>
              <div className="field">
                <label>Revenue Licence</label>
                <input name="revenueExp" type="date" value={form.revenueExp} onChange={h} />
              </div>
              <div className="field">
                <label>Emission Test</label>
                <input name="emissionExp" type="date" value={form.emissionExp} onChange={h} />
              </div>
            </div>

            <div className="field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={h}>
                {['Active', 'Service Due', 'In Repair'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={save}>{editId ? 'Update' : 'Save'} Vehicle</button>
            </div>
          </div>
        </div>
      )}

      {/* ── History Modal ── */}
      {histModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setHistModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">📋 Service History — {histModal.plate}</div>
              <button className="modal-close" onClick={() => setHistModal(null)}>×</button>
            </div>
            <div style={{ fontSize: '.85rem', marginBottom: 16, color: 'var(--text2)' }}>
              {histModal.make} {histModal.model} · Owner: {histModal.owner}
            </div>
            {histModal.history?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {histModal.history.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 'var(--r)', fontSize: '.85rem' }}>
                    <span style={{ width: 24, height: 24, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: '.75rem', flexShrink: 0 }}>{i + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🔧</div>
                <div className="empty-text">No service history</div>
              </div>
            )}
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setHistModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-stack">
          <div className="toast toast-success">{toast}</div>
        </div>
      )}
    </div>
  );
}