import { customerService } from '../utils/api';
import { useState, useEffect, useCallback } from 'react';
import ExportBtn from '../components/Exportbtn';
import "../style.css";

const ROLE_CLASS = { 'Vehicle Owner': 'bg-blue', 'Garage Owner': 'bg-purple', 'Admin': 'bg-gold' };
const STARS = n => '★'.repeat(n) + '☆'.repeat(5 - n);
const EMPTY = {
  fullName: '', email: '', phone: '', nic: '', address: '',
  drivingLicense: '', role: 'Vehicle Owner', status: 'Active',
  vehicles: 0, bookings: 0, joinDate: new Date().toISOString().slice(0, 10),
};

// ── Validation helpers ────────────────────────────────────
const validatePhone = phone => {
  const cleaned = phone.replace(/[-\s]/g, '');
  if (!cleaned) return '';
  if (!/^07[0-9]{8}$/.test(cleaned)) return 'Phone must be 10 digits starting with 07 (e.g. 0771234567)';
  return '';
};

const validateNIC = nic => {
  if (!nic) return 'NIC is required';
  const oldNIC = /^[0-9]{9}[VvXx]$/.test(nic);
  const newNIC = /^[0-9]{12}$/.test(nic);
  if (!oldNIC && !newNIC) return 'NIC must be 9 digits + V/X (old) or 12 digits (new)';
  return '';
};

const validateEmail = email => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
  return '';
};

// ── Field component defined OUTSIDE to prevent re-mount on every keystroke ──
const Field = ({ label, name, type = 'text', placeholder, required, value, onChange, error }) => (
  <div className="field">
    <label>{label}{required && ' *'}</label>
    <input
      name={name}
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      style={{ borderColor: error ? 'var(--red)' : '' }}
    />
    {error && (
      <span style={{ color: 'var(--red)', fontSize: '.75rem', marginTop: 2, display: 'block' }}>
        ⚠ {error}
      </span>
    )}
  </div>
);

export default function CustomerManagement() {
  const [tab,        setTab]        = useState('customers');
  const [customers,  setCustomers]  = useState([]);
  const [feedback,   setFeedback]   = useState([]);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [modal,      setModal]      = useState(false);
  const [viewModal,  setViewModal]  = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [editId,     setEditId]     = useState(null);
  const [toast,      setToast]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // ── Live change handler with inline validation ──
  const h = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));

    let err = '';
    if (name === 'phone')    err = validatePhone(value);
    if (name === 'nic')      err = validateNIC(value);
    if (name === 'email')    err = validateEmail(value);
    if (name === 'fullName' && !value.trim()) err = 'Full name is required';
    setFormErrors(fe => ({ ...fe, [name]: err }));
  };

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await customerService.getAll();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load customers. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  useEffect(() => {
    setFeedback([
      { id: 'F001', customer: 'Amal Perera',   garage: 'ABC Auto Garage', rating: 5, comment: 'Excellent service!',      date: '2025-03-10', status: 'Approved' },
      { id: 'F002', customer: 'Nimal Silva',    garage: 'ABC Auto Garage', rating: 4, comment: 'Good work, minor delay.', date: '2025-03-12', status: 'Approved' },
      { id: 'F003', customer: 'Priya Fernando', garage: 'ABC Auto Garage', rating: 3, comment: 'Average experience.',     date: '2025-03-13', status: 'Pending'  },
    ]);
  }, []);

  const filteredC = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      ((c.fullName || '').toLowerCase().includes(q) ||
       (c.email    || '').toLowerCase().includes(q) ||
       (c.phone    || '').includes(q)) &&
      (roleFilter === 'All' || c.role === roleFilter)
    );
  });

  const openAdd  = () => { setForm(EMPTY); setFormErrors({}); setEditId(null); setModal(true); };
  const openEdit = r  => {
    setForm({ ...r, joinDate: r.joinDate || new Date().toISOString().slice(0, 10) });
    setFormErrors({});
    setEditId(r.id);
    setModal(true);
  };

  const validateAll = () => {
    const e = {};
    if (!form.fullName || !form.fullName.trim()) e.fullName = 'Full name is required';
    const emailErr = validateEmail(form.email);
    if (emailErr) e.email = emailErr;
    if (form.phone) {
      const phoneErr = validatePhone(form.phone);
      if (phoneErr) e.phone = phoneErr;
    }
    const nicErr = validateNIC(form.nic);
    if (nicErr) e.nic = nicErr;
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validateAll()) return;
    try {
      if (editId) {
        await customerService.update(editId, form);
        showToast('✅ Customer updated');
      } else {
        await customerService.create(form);
        showToast('✅ Customer added');
      }
      setModal(false);
      loadCustomers();
    } catch (err) { alert(err.message); }
  };

  const del = async id => {
    if (!confirm('Delete this customer?')) return;
    try {
      await customerService.delete(id);
      showToast('🗑 Deleted');
      loadCustomers();
    } catch (err) { alert(err.message); }
  };

  const avgRating = feedback.length
    ? (feedback.reduce((a, f) => a + f.rating, 0) / feedback.length).toFixed(1)
    : '0.0';

  const exportData = filteredC.map(c => ({
    ID: c.customerCode, 'Full Name': c.fullName, Email: c.email, Phone: c.phone,
    NIC: c.nic, Role: c.role, Address: c.address, Status: c.status,
  }));

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Customer Management &amp; Feedback</div></div>
        <div className="page-actions">
          <ExportBtn data={exportData} filename="customers-export" title="Customer Management Report" />
          <button className="btn btn-accent" onClick={openAdd}>＋ Add Customer</button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="alert-box alert-warn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button onClick={loadCustomers} style={{
            background: 'var(--accent)', color: '#000', border: 'none',
            borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
            fontSize: '.8rem', fontWeight: 700, fontFamily: 'inherit'
          }}>Retry</button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="stats-row stats-4">
        {[
          { icon: '👥', label: 'Total Users',    val: customers.length,                                        color: 'sc-blue'   },
          { icon: '🚗', label: 'Vehicle Owners', val: customers.filter(c => c.role === 'Vehicle Owner').length, color: 'sc-cyan'   },
          { icon: '🏪', label: 'Garage Owners',  val: customers.filter(c => c.role === 'Garage Owner').length,  color: 'sc-purple' },
          { icon: '⭐', label: 'Avg. Rating',     val: avgRating,                                               color: 'sc-gold'   },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--surface2)', borderRadius: 'var(--r)', padding: 4, width: 'fit-content' }}>
        {['customers', 'feedback'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: tab === t ? 'var(--surface)' : 'none',
            color: tab === t ? 'var(--accent)' : 'var(--text2)',
            fontFamily: 'inherit', fontWeight: tab === t ? 700 : 500, fontSize: '.86rem',
            boxShadow: tab === t ? 'var(--shadow)' : 'none', transition: '.15s',
          }}>
            {t === 'customers' ? '👥 Customers' : '⭐ Feedback & Ratings'}
          </button>
        ))}
      </div>

      {/* ── Customers Table ── */}
      {tab === 'customers' && (
        <div className="tcard">
          <div className="tcard-bar">
            <div className="tcard-title">All Users</div>
            <div className="tbar-right">
              <div className="search-wrap">
                <input className="search-box" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="filt-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                {['All', 'Vehicle Owner', 'Garage Owner', 'Admin'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <div className="empty-text">Loading customers...</div>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-icon">⚠️</div>
              <div className="empty-text">Could not load customers</div>
              <button onClick={loadCustomers} className="btn btn-accent" style={{ marginTop: 12 }}>Retry</button>
            </div>
          ) : (
            <div className="tscroll">
              <table>
                <thead>
                  <tr>{['ID', 'Name', 'Email', 'Phone', 'NIC', 'Role', 'Vehicles', 'Bookings', 'Joined', 'Status', 'Actions'].map(col => <th key={col}>{col}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredC.map(c => (
                    <tr key={c.id}>
                      <td><span className="mono text-accent" style={{ fontSize: '.78rem' }}>{c.customerCode}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--indigo),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '.78rem', flexShrink: 0 }}>
                            {(c.fullName || '?')[0]}
                          </div>
                          <span className="text-bold">{c.fullName}</span>
                        </div>
                      </td>
                      <td className="text-muted" style={{ fontSize: '.82rem' }}>{c.email}</td>
                      <td>{c.phone}</td>
                      <td className="mono" style={{ fontSize: '.78rem' }}>{c.nic}</td>
                      <td><span className={`badge ${ROLE_CLASS[c.role] || 'bg-muted'}`}>{c.role}</span></td>
                      <td style={{ textAlign: 'center' }}><span className="badge bg-blue">{c.vehicles || 0}</span></td>
                      <td style={{ textAlign: 'center' }}><span className="badge bg-gold">{c.bookings || 0}</span></td>
                      <td className="text-muted" style={{ fontSize: '.81rem' }}>{c.joinDate}</td>
                      <td><span className={`badge ${c.status === 'Active' ? 'bg-green' : 'bg-red'}`}>{c.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="btn btn-blue btn-xs"    onClick={() => setViewModal(c)}>👁</button>
                          <button className="btn btn-outline btn-xs" onClick={() => openEdit(c)}>✏️</button>
                          <button className="btn btn-danger btn-xs"  onClick={() => del(c.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredC.length === 0 && (
                    <tr><td colSpan={11}>
                      <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <div className="empty-text">No customers found</div>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="tfoot"><span>{filteredC.length} of {customers.length} users</span></div>
        </div>
      )}

      {/* ── Feedback Table ── */}
      {tab === 'feedback' && (
        <div className="tcard">
          <div className="tcard-bar"><div className="tcard-title">⭐ Customer Feedback & Ratings</div></div>
          <div className="tscroll">
            <table>
              <thead><tr>{['ID', 'Customer', 'Garage', 'Rating', 'Comment', 'Date', 'Status'].map(col => <th key={col}>{col}</th>)}</tr></thead>
              <tbody>
                {feedback.map(f => (
                  <tr key={f.id}>
                    <td><span className="mono text-accent" style={{ fontSize: '.78rem' }}>{f.id}</span></td>
                    <td className="text-bold">{f.customer}</td>
                    <td className="text-muted">{f.garage}</td>
                    <td><span style={{ color: 'var(--accent)', fontWeight: 700 }}>{STARS(f.rating)}</span></td>
                    <td style={{ maxWidth: 220, fontSize: '.82rem', color: 'var(--text2)' }}>{f.comment}</td>
                    <td className="text-muted" style={{ fontSize: '.81rem' }}>{f.date}</td>
                    <td><span className={`badge ${f.status === 'Approved' ? 'bg-green' : 'bg-orange'}`}>{f.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tfoot"><span>{feedback.length} reviews · Average: {avgRating} ⭐</span></div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">{editId ? '✏️ Edit Customer' : '＋ Add Customer'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            {/* Full Name + Email */}
            <div className="form-row">
              <Field
                label="Full Name" name="fullName" placeholder="Full name" required
                value={form.fullName} onChange={h} error={formErrors.fullName}
              />
              <Field
                label="Email" name="email" type="email" placeholder="email@example.com" required
                value={form.email} onChange={h} error={formErrors.email}
              />
            </div>

            {/* Phone + NIC */}
            <div className="form-row">
              <div className="field">
                <label>Phone</label>
                <input
                  name="phone"
                  value={form.phone || ''}
                  onChange={h}
                  placeholder="0771234567"
                  maxLength={10}
                  style={{ borderColor: formErrors.phone ? 'var(--red)' : '' }}
                />
                {formErrors.phone ? (
                  <span style={{ color: 'var(--red)', fontSize: '.75rem', marginTop: 2, display: 'block' }}>⚠ {formErrors.phone}</span>
                ) : form.phone && form.phone.replace(/[-\s]/g, '').length === 10 ? (
                  <span style={{ color: 'var(--green)', fontSize: '.75rem', marginTop: 2, display: 'block' }}>✓ Valid phone number</span>
                ) : (
                  <span style={{ fontSize: '.73rem', color: 'var(--text3)', marginTop: 2, display: 'block' }}>Format: 07XXXXXXXX (10 digits)</span>
                )}
              </div>

              <div className="field">
                <label>NIC <span style={{ color: 'var(--red)' }}>*</span></label>
                <input
                  name="nic"
                  value={form.nic || ''}
                  onChange={h}
                  placeholder="123456789V or 123456789012"
                  maxLength={12}
                  style={{ borderColor: formErrors.nic ? 'var(--red)' : form.nic && !formErrors.nic ? 'var(--green)' : '' }}
                />
                {formErrors.nic ? (
                  <span style={{ color: 'var(--red)', fontSize: '.75rem', marginTop: 2, display: 'block' }}>⚠ {formErrors.nic}</span>
                ) : form.nic && !formErrors.nic ? (
                  <span style={{ color: 'var(--green)', fontSize: '.75rem', marginTop: 2, display: 'block' }}>✓ Valid NIC number</span>
                ) : (
                  <span style={{ fontSize: '.73rem', color: 'var(--text3)', marginTop: 2, display: 'block' }}>Old: 9 digits + V/X · New: 12 digits</span>
                )}
              </div>
            </div>

            {/* Role + Status */}
            <div className="form-row">
              <div className="field">
                <label>Role</label>
                <select name="role" value={form.role} onChange={h}>
                  <option>Vehicle Owner</option>
                  <option>Garage Owner</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={h}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            {/* Address + Driving License */}
            <div className="form-row">
              <Field
                label="Address" name="address" placeholder="City / District"
                value={form.address} onChange={h} error={formErrors.address}
              />
              <Field
                label="Driving License" name="drivingLicense" placeholder="DL-XXXXX"
                value={form.drivingLicense} onChange={h} error={formErrors.drivingLicense}
              />
            </div>

            {/* Join Date */}
            <div className="field">
              <label>Join Date</label>
              <input name="joinDate" type="date" value={form.joinDate || ''} onChange={h} />
            </div>

            {/* Error summary */}
            {Object.values(formErrors).some(e => e) && (
              <div className="alert-box alert-error" style={{ marginTop: 8 }}>
                ⚠ Please fix {Object.values(formErrors).filter(e => e).length} error(s) before saving.
              </div>
            )}

            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-accent"  onClick={save}>{editId ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setViewModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">👤 Customer Profile</div>
              <button className="modal-close" onClick={() => setViewModal(null)}>×</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--indigo),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>
                {(viewModal.fullName || '?')[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{viewModal.fullName}</div>
                <span className={`badge ${ROLE_CLASS[viewModal.role] || 'bg-muted'}`}>{viewModal.role}</span>
              </div>
            </div>
            <div className="info-grid">
              {[
                { k: 'Email',    v: viewModal.email },
                { k: 'Phone',    v: viewModal.phone },
                { k: 'NIC',      v: viewModal.nic },
                { k: 'Address',  v: viewModal.address },
                { k: 'DL No.',   v: viewModal.drivingLicense },
                { k: 'Joined',   v: viewModal.joinDate },
                { k: 'Vehicles', v: viewModal.vehicles },
                { k: 'Bookings', v: viewModal.bookings },
              ].map(i => (
                <div key={i.k} className="info-item">
                  <span className="info-key">{i.k}</span>
                  <span className="info-val">{i.v || '—'}</span>
                </div>
              ))}
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setViewModal(null)}>Close</button>
              <button className="btn btn-accent"  onClick={() => { openEdit(viewModal); setViewModal(null); }}>✏️ Edit</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-stack"><div className="toast toast-success">{toast}</div></div>}
    </div>
  );
}