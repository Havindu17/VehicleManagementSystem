import { useState, useEffect, useCallback } from 'react';
import ExportBtn from '../components/Exportbtn';
import { vehicleService, customerService, authService } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import "../style.css";

const EMPTY = { plate: '', owner: '', ownerPhone: '', make: '', model: '', year: '', color: '', fuel: 'Petrol', mileage: '', lastService: '', nextService: '', insuranceExp: '', revenueExp: '', emissionExp: '', status: 'Active' };

const MODELS = {
  Toyota:     ['Corolla', 'Camry', 'Prius', 'Hilux', 'Land Cruiser', 'Aqua', 'Axio', 'Allion', 'Premio', 'Vitz', 'Rush', 'Fortuner'],
  Honda:      ['Civic', 'Fit', 'Vezel', 'CR-V', 'HR-V', 'Grace', 'Freed', 'Accord', 'City', 'Stream'],
  Nissan:     ['Sunny', 'X-Trail', 'Leaf', 'Dayz', 'Note', 'Serena', 'Tiida', 'Navara', 'Patrol'],
  Suzuki:     ['Alto', 'Swift', 'Vitara', 'Jimny', 'Wagon R', 'Baleno', 'Ertiga', 'Ciaz', 'S-Presso'],
  BMW:        ['320i', '520i', 'X3', 'X5', 'M3', 'M5', '118i', '218i', 'X1'],
  Mitsubishi: ['Lancer', 'Outlander', 'Pajero', 'L200', 'ASX', 'Eclipse Cross'],
  Mazda:      ['Axela', 'Atenza', 'CX-5', 'CX-3', 'Demio', 'BT-50'],
  Hyundai:    ['i10', 'i20', 'Tucson', 'Santa Fe', 'Elantra', 'Creta'],
  Kia:        ['Picanto', 'Sportage', 'Sorento', 'Rio', 'Stonic'],
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

// ─── Validation rules ──────────────────────────────────────────────────────────
const PLATE_REGEX = /^[A-Z]{2,3}-\d{4}$/i;   // e.g. CAB-1234  or  AB-1234
const PHONE_REGEX = /^(?:\+94|0)[0-9]{9}$/;  // Sri Lanka mobile / landline
const CURRENT_YEAR = new Date().getFullYear();

function validate(form, existingPlates = [], editId = null) {
  const errors = {};

  // 1. Plate number
  if (!form.plate.trim()) {
    errors.plate = 'Plate number is required.';
  } else if (!PLATE_REGEX.test(form.plate.trim())) {
    errors.plate = 'Invalid format. Use XX-1234 or XXX-1234 (e.g. CAB-1234).';
  } else {
    // Duplicate check — skip own record when editing
    const dup = existingPlates.find(
      p => p.plate.toLowerCase() === form.plate.trim().toLowerCase() && p.id !== editId
    );
    if (dup) errors.plate = 'This plate number is already registered.';
  }

  // 2. Owner
  if (!form.owner.trim()) errors.owner = 'Please select a customer / owner.';

  // 3. Owner phone (auto-filled but still validate if present)
  if (form.ownerPhone && !PHONE_REGEX.test(form.ownerPhone.replace(/\s/g, ''))) {
    errors.ownerPhone = 'Phone must be a valid Sri Lanka number (e.g. 0771234567).';
  }

  // 4. Make
  if (!form.make) errors.make = 'Please select a vehicle make.';

  // 5. Year
  if (form.year !== '') {
    const yr = Number(form.year);
    if (!Number.isInteger(yr) || yr < 1900 || yr > CURRENT_YEAR + 1) {
      errors.year = `Year must be between 1900 and ${CURRENT_YEAR + 1}.`;
    }
  }

  // 6. Mileage
  if (form.mileage !== '') {
    const mi = Number(form.mileage);
    if (isNaN(mi) || mi < 0 || mi > 2_000_000) {
      errors.mileage = 'Mileage must be a positive number (max 2,000,000 km).';
    }
  }

  // 7. Service dates: last service must not be in the future
  if (form.lastService) {
    const ls = new Date(form.lastService);
    if (ls > new Date()) errors.lastService = 'Last service date cannot be in the future.';
  }

  // 8. Next service must be after last service (if both provided)
  if (form.lastService && form.nextService) {
    if (new Date(form.nextService) <= new Date(form.lastService)) {
      errors.nextService = 'Next service must be after the last service date.';
    }
  }

  // 9. Document expiry dates must be valid calendar dates (browser date picker
  //    handles format, but we check they are not absurdly far in the past)
  const DOC_FIELDS = [
    { key: 'insuranceExp', label: 'Insurance expiry' },
    { key: 'revenueExp',   label: 'Revenue licence expiry' },
    { key: 'emissionExp',  label: 'Emission test expiry' },
  ];
  DOC_FIELDS.forEach(({ key, label }) => {
    if (form[key]) {
      const d = new Date(form[key]);
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      if (isNaN(d.getTime())) {
        errors[key] = `${label}: invalid date.`;
      } else if (d < fiveYearsAgo) {
        errors[key] = `${label} seems too far in the past. Please verify.`;
      }
    }
  });

  return errors;   // empty object = no errors
}
// ──────────────────────────────────────────────────────────────────────────────

// Small inline error component
const FieldError = ({ msg }) =>
  msg ? (
    <div style={{
      color: 'var(--red, #f87171)',
      fontSize: '.72rem',
      marginTop: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    }}>
      ⚠ {msg}
    </div>
  ) : null;

// Helper: add red border when field has an error
const inputStyle = (err) => err ? { border: '1.5px solid var(--red, #f87171)', outline: 'none' } : {};

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
  const [errors, setErrors]       = useState({});   // ← validation state
  const [confirmObj, setConfirmObj] = useState({ isOpen: false, id: null });

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const h = e => {
    const { name, value } = e.target;
    if (name === 'make') {
      setForm(f => ({ ...f, make: value, model: '' }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    // Clear the error for this field as the user types
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [v, c, users] = await Promise.all([
        vehicleService.getAll(), 
        customerService.getAll().catch(()=>[]),
        authService.getAllUsers().catch(()=>[])
      ]);
      
      const combined = [...c];
      const vehicleOwners = users.filter(u => u.role === 'Vehicle Owner');
      vehicleOwners.forEach(vo => {
        if (!combined.find(cust => cust.fullName === vo.fullName || cust.fullName === vo.username)) {
           combined.push({ fullName: vo.fullName || vo.username, phone: vo.phone || '' });
        }
      });
      
      setRows(v);
      setCustomers(combined);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleOwnerChange = e => {
    const name = e.target.value;
    const match = customers.find(c => c.fullName === name);
    setForm(f => ({ ...f, owner: name, ownerPhone: match?.phone || '' }));
    if (errors.owner) setErrors(prev => { const n = { ...prev }; delete n.owner; return n; });
  };

  const expiring = rows.filter(r =>
    daysUntil(r.insuranceExp) <= 7 || daysUntil(r.revenueExp) <= 7 || daysUntil(r.emissionExp) <= 7
  );

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return (r.plate || '').toLowerCase().includes(q) || (r.owner || '').toLowerCase().includes(q) || (r.make || '').toLowerCase().includes(q);
  });

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setErrors({}); setModal(true); };
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
    setErrors({});
    setModal(true);
  };

  const save = async () => {
    // Run all validations before submitting
    const errs = validate(form, rows, editId);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll the first error into view
      const firstKey = Object.keys(errs)[0];
      document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;4
    }

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

  const del = id => {
    setConfirmObj({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await vehicleService.delete(confirmObj.id);
      showToast('🗑 Removed');
      loadAll();
    } catch (err) { alert(err.message); }
    finally { setConfirmObj({ isOpen: false, id: null }); }
  };

  const exportData = filtered.map(r => ({
    ID: r.vehicleCode, 'Plate No': r.plate, Owner: r.owner, 'Owner Phone': r.ownerPhone,
    Make: r.make, Model: r.model, Year: r.year, Color: r.color, Fuel: r.fuel,
    Mileage: r.mileage, 'Insurance Exp': r.insuranceExp, Status: r.status,
  }));

  const hasErrors = Object.keys(errors).length > 0;

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

            {/* Global error summary banner */}
            {hasErrors && (
              <div style={{
                background: 'rgba(248,113,113,.12)',
                border: '1px solid var(--red, #f87171)',
                borderRadius: 'var(--r)',
                padding: '10px 14px',
                marginBottom: 12,
                fontSize: '.82rem',
                color: 'var(--red, #f87171)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                ⚠ Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before saving.
              </div>
            )}

            {/* Basic Info */}
            <div className="section-title">Basic Info</div>
            <div className="form-row">
              <div className="field">
                <label>Plate No. *</label>
                <input
                  name="plate"
                  value={form.plate}
                  onChange={h}
                  placeholder="CAB-1234"
                  style={inputStyle(errors.plate)}
                />
                <FieldError msg={errors.plate} />
              </div>
              <div className="field">
                <label>Owner Name *</label>
                <select
                  name="owner"
                  value={form.owner}
                  onChange={handleOwnerChange}
                  style={inputStyle(errors.owner)}
                >
                  <option value="">— Select customer —</option>
                  {customers.map(c => <option key={c.id} value={c.fullName}>{c.fullName}</option>)}
                </select>
                <FieldError msg={errors.owner} />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>Owner Phone</label>
                <input
                  name="ownerPhone"
                  value={form.ownerPhone}
                  onChange={h}
                  placeholder="Auto-filled"
                  style={inputStyle(errors.ownerPhone)}
                />
                <FieldError msg={errors.ownerPhone} />
              </div>
              <div className="field">
                <label>Make *</label>
                <select
                  name="make"
                  value={form.make}
                  onChange={h}
                  style={inputStyle(errors.make)}
                >
                  <option value="">— Select make —</option>
                  {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="Other">Other</option>
                </select>
                <FieldError msg={errors.make} />
              </div>
            </div>

            <div className="form-row-3">
              <div className="field">
                <label>Model</label>
                <select name="model" value={form.model} onChange={h}>
                  <option value="">— Select model —</option>
                  {(MODELS[form.make] || []).map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Year</label>
                <input
                  name="year"
                  type="number"
                  value={form.year}
                  onChange={h}
                  placeholder="2020"
                  min="1970"
                  max={CURRENT_YEAR + 1}
                  style={inputStyle(errors.year)}
                />
                <FieldError msg={errors.year} />
              </div>

              <div className="field">
                <label>Color</label>
                <select name="color" value={form.color} onChange={h}>
                  <option value="">— Select color —</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
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
                <input
                  name="mileage"
                  type="number"
                  value={form.mileage}
                  onChange={h}
                  placeholder="50000"
                  min="0"
                  style={inputStyle(errors.mileage)}
                />
                <FieldError msg={errors.mileage} />
              </div>
            </div>

            {/* Service Dates */}
            <div className="section-title" style={{ marginTop: 4 }}>Service Dates</div>
            <div className="form-row">
              <div className="field">
                <label>Last Service</label>
                <input
                  name="lastService"
                  type="date"
                  value={form.lastService}
                  onChange={h}
                  max={new Date().toISOString().slice(0, 10)}
                  style={inputStyle(errors.lastService)}
                />
                <FieldError msg={errors.lastService} />
              </div>
              <div className="field">
                <label>Next Service</label>
                <input
                  name="nextService"
                  type="date"
                  value={form.nextService}
                  onChange={h}
                  min={form.lastService || undefined}
                  style={inputStyle(errors.nextService)}
                />
                <FieldError msg={errors.nextService} />
              </div>
            </div>

            {/* Document Expiry */}
            <div className="section-title" style={{ marginTop: 4 }}>Document Expiry Dates</div>
            <div className="form-row-3">
              <div className="field">
                <label>Insurance Exp.</label>
                <input
                  name="insuranceExp"
                  type="date"
                  value={form.insuranceExp}
                  onChange={h}
                  style={inputStyle(errors.insuranceExp)}
                />
                <FieldError msg={errors.insuranceExp} />
              </div>
              <div className="field">
                <label>Revenue Licence</label>
                <input
                  name="revenueExp"
                  type="date"
                  value={form.revenueExp}
                  onChange={h}
                  style={inputStyle(errors.revenueExp)}
                />
                <FieldError msg={errors.revenueExp} />
              </div>
              <div className="field">
                <label>Emission Test</label>
                <input
                  name="emissionExp"
                  type="date"
                  value={form.emissionExp}
                  onChange={h}
                  style={inputStyle(errors.emissionExp)}
                />
                <FieldError msg={errors.emissionExp} />
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
      <ConfirmModal
        isOpen={confirmObj.isOpen}
        title="Remove Vehicle"
        message="Are you sure you want to remove this vehicle? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmObj({ isOpen: false, id: null })}
      />
    </div>
  );
}