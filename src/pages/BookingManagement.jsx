import { useState, useEffect, useCallback } from 'react';
import ExportBtn from '../components/Exportbtn';
import { bookingService, customerService, vehicleService, servicesCatalogService, invoiceService } from '../utils/api';
import "../style.css";

const SLOTS  = ['Morning', 'Afternoon', 'Evening'];
const ALL_ST = ['Pending', 'Approved', 'In Progress', 'Completed', 'Cancelled'];
const STATUS_C = {
  Pending: 'bg-orange', Approved: 'bg-blue',
  'In Progress': 'bg-cyan', Completed: 'bg-green', Cancelled: 'bg-red',
};
const EMPTY = {
  customer: '', customerPhone: '', vehicle: '', plate: '',
  vehicleType: '', services: [], service: '',
  date: '', time: '', tech: '', slot: 'Morning',
  status: 'Pending', amount: '', notes: '',
};

const LOCAL_SERVICES = [
  { id: 1,  name: 'Full Service',           category: 'General',      price: 8500 },
  { id: 2,  name: 'Oil Change',             category: 'General',      price: 2500 },
  { id: 3,  name: 'Oil Filter Replacement', category: 'General',      price: 800  },
  { id: 4,  name: 'Air Filter Replacement', category: 'General',      price: 1200 },
  { id: 5,  name: 'Battery Replacement',    category: 'Electrical',   price: 4500 },
  { id: 6,  name: 'Tyre Rotation',          category: 'Tyres',        price: 1500 },
  { id: 7,  name: 'Wheel Alignment',        category: 'Tyres',        price: 2800 },
  { id: 8,  name: 'Wheel Balancing',        category: 'Tyres',        price: 1800 },
  { id: 9,  name: 'Brake Inspection',       category: 'Brakes',       price: 1500 },
  { id: 10, name: 'Brake Pad Replacement',  category: 'Brakes',       price: 4200 },
  { id: 11, name: 'AC Service',             category: 'AC',           price: 3500 },
  { id: 12, name: 'AC Repair',              category: 'AC',           price: 6500 },
  { id: 13, name: 'Engine Tune-Up',         category: 'Engine',       price: 5500 },
  { id: 14, name: 'Coolant Flush',          category: 'Engine',       price: 2200 },
  { id: 15, name: 'Transmission Service',   category: 'Transmission', price: 7500 },
  { id: 16, name: 'Suspension Check',       category: 'Suspension',   price: 2000 },
  { id: 17, name: 'Body Wash & Polish',     category: 'Cosmetic',     price: 3500 },
  { id: 18, name: 'Interior Cleaning',      category: 'Cosmetic',     price: 2500 },
  { id: 19, name: 'Electrical Diagnostics', category: 'Electrical',   price: 1500 },
  { id: 20, name: 'Spark Plug Replacement', category: 'Engine',       price: 2800 },
];

function detectType(v = '') {
  if (/bike|motorcycle|cbr|cbz|bajaj|hero|tvs|yamaha (fz|r15)|ktm/i.test(v)) return 'bike';
  if (/truck|lorry|tipper|leyland/i.test(v))  return 'truck';
  if (/van|hiace|delica|transit/i.test(v))     return 'van';
  if (/suv|prado|fortuner|crv|rav4|outlander|x-trail|rush|hilux|pajero/i.test(v)) return 'suv';
  if (/tuk|three.?wheel/i.test(v))             return 'tuk';
  return 'car';
}

// ── SearchableDropdown ────────────────────────────────────
function SearchableDropdown({ value, onChange, options = [], placeholder }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');

  // KEY FIX: filter out any null/undefined/non-string entries before rendering
  const safeOptions = options.filter(o => o != null && typeof o === 'string' && o.trim() !== '');
  const filtered = safeOptions.filter(o => o.toLowerCase().includes((query || '').toLowerCase()));

  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--surface2)', border: '1.5px solid var(--border)',
        borderRadius: 'var(--r)', padding: '7px 10px', cursor: 'pointer',
        minHeight: 38, fontSize: '.88rem',
        color: value ? 'var(--text)' : 'var(--text2)',
      }}>
        <span style={{ flex: 1 }}>{value || placeholder}</span>
        <span style={{ fontSize: '.7rem', opacity: .6 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          zIndex: 99999, background: '#131720',
          border: '1.5px solid var(--accent)', borderRadius: 'var(--r)',
          boxShadow: '0 12px 32px rgba(0,0,0,.65)', overflow: 'hidden',
        }}>
          <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
            <input
              autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search..." onClick={e => e.stopPropagation()}
              style={{
                width: '100%', background: '#0d1018', border: '1px solid var(--border)',
                borderRadius: 'var(--r)', padding: '5px 8px', fontSize: '.83rem',
                color: 'var(--text)', outline: 'none',
              }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filtered.length === 0
              ? <div style={{ padding: '10px 12px', fontSize: '.83rem', color: 'var(--text2)' }}>No results</div>
              : filtered.map((opt, i) => (
                <div key={i}
                  onClick={() => { onChange(opt); setQuery(''); setOpen(false); }}
                  style={{ padding: '8px 12px', fontSize: '.85rem', cursor: 'pointer', color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1f2e'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >{opt}</div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Multi-select Service Dropdown ─────────────────────────
function ServiceMultiDropdown({ value = [], onChange, services = [], vehicleTypeBadge, selectedPlate }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');

  // KEY FIX: guard against nulls in services array
  const safeServices = (Array.isArray(services) ? services : [])
    .filter(s => s != null && typeof s.name === 'string');

  const plateFiltered = safeServices.filter(s => {
    if (!selectedPlate) return true;
    const av = s.assignedVehicles;
    if (!av || av.length === 0) return true;
    return av.includes(selectedPlate);
  });

  const searched = plateFiltered.filter(s =>
    s.name.toLowerCase().includes((query || '').toLowerCase()) ||
    (s.category || '').toLowerCase().includes((query || '').toLowerCase())
  );

  const grouped = searched.reduce((acc, s) => {
    const cat = s.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const safeValue = Array.isArray(value) ? value : [];

  const toggle = svc => {
    const next = safeValue.includes(svc.name)
      ? safeValue.filter(n => n !== svc.name)
      : [...safeValue, svc.name];
    const total = next.reduce((sum, n) => {
      const found = safeServices.find(s => s.name === n);
      return sum + (found?.price || 0);
    }, 0);
    onChange(next, total);
  };

  const clearAll  = () => onChange([], 0);
  const selectAll = () => {
    const all   = plateFiltered.map(s => s.name);
    const total = plateFiltered.reduce((sum, s) => sum + (s.price || 0), 0);
    onChange(all, total);
  };

  const triggerLabel = safeValue.length === 0
    ? 'Select services...'
    : safeValue.length === 1 ? safeValue[0]
    : `${safeValue.length} services selected`;

  const selectedTotal = safeValue.reduce((sum, n) => {
    const s = safeServices.find(x => x.name === n);
    return sum + (s?.price || 0);
  }, 0);

  const isFiltered = selectedPlate && safeServices.some(s => s.assignedVehicles?.length > 0);

  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--surface2)',
        border: `1.5px solid ${safeValue.length ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--r)', padding: '7px 10px', cursor: 'pointer',
        minHeight: 38, fontSize: '.88rem',
        color: safeValue.length ? 'var(--text)' : 'var(--text2)',
      }}>
        <span style={{ flex: 1, fontWeight: safeValue.length ? 600 : 400 }}>{triggerLabel}</span>
        {vehicleTypeBadge && (
          <span style={{ fontSize: '.67rem', background: 'var(--accent-dim)', color: 'var(--accent)', padding: '1px 7px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>{vehicleTypeBadge}</span>
        )}
        {safeValue.length > 0 && (
          <span style={{ background: 'var(--accent)', color: '#000', borderRadius: 20, padding: '1px 7px', fontSize: '.72rem', fontWeight: 700, flexShrink: 0 }}>{safeValue.length}</span>
        )}
        <span style={{ fontSize: '.7rem', opacity: .6 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          zIndex: 99999, background: '#131720',
          border: '1.5px solid var(--accent)', borderRadius: 'var(--r)',
          boxShadow: '0 12px 36px rgba(0,0,0,.75)', overflow: 'hidden',
        }}>
          <div style={{ padding: '7px 9px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: '.8rem', opacity: .5 }}>🔍</span>
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search services..." onClick={e => e.stopPropagation()}
              style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '.84rem', color: 'var(--text)', outline: 'none' }} />
            {query && <button onClick={e => { e.stopPropagation(); setQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: '.9rem', padding: 0 }}>×</button>}
          </div>

          <div style={{ padding: '5px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
            {isFiltered && <span style={{ fontSize: '.72rem', color: 'var(--cyan)', background: 'rgba(34,211,238,.12)', padding: '1px 8px', borderRadius: 10 }}>🔗 filtered for {selectedPlate}</span>}
            <button onClick={selectAll} style={{ fontSize: '.74rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>☑ All</button>
            <button onClick={clearAll}  style={{ fontSize: '.74rem', color: 'var(--red)',    background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕ Clear</button>
            <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text2)' }}>{plateFiltered.length} services</span>
          </div>

          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {Object.keys(grouped).length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '.83rem', color: 'var(--text2)' }}>No services found</div>
            ) : Object.entries(grouped).map(([cat, svcs]) => (
              <div key={cat}>
                <div style={{ padding: '5px 12px 3px', fontSize: '.67rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, background: '#0d1018', borderBottom: '1px solid var(--border)' }}>{cat}</div>
                {svcs.map(svc => {
                  const sel = safeValue.includes(svc.name);
                  return (
                    <div key={svc.name} onClick={() => toggle(svc)}
                      style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: sel ? 'rgba(240,192,64,.08)' : 'transparent' }}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#1a1f2e'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = sel ? 'rgba(240,192,64,.08)' : 'transparent'; }}
                    >
                      <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, border: `2px solid ${sel ? 'var(--accent)' : 'var(--border2)'}`, background: sel ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sel && <span style={{ fontSize: '.6rem', color: '#000', fontWeight: 900 }}>✓</span>}
                      </div>
                      <span style={{ flex: 1, fontSize: '.85rem', color: sel ? 'var(--accent)' : 'var(--text)', fontWeight: sel ? 700 : 400 }}>{svc.name}</span>
                      {svc.price != null && (
                        <span style={{ fontSize: '.77rem', fontWeight: 700, color: 'var(--accent)', background: 'rgba(240,192,64,.13)', padding: '2px 9px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          LKR {Number(svc.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.82rem', color: 'var(--text2)' }}>
              Total: <strong style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>LKR {selectedTotal.toLocaleString()}</strong>
            </span>
            <button onClick={() => setOpen(false)} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 7, padding: '5px 18px', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Done ({safeValue.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
export default function BookingManagement() {
  const [rows,            setRows]            = useState([]);
  const [customers,       setCustomers]       = useState([]);
  const [vehicles,        setVehicles]        = useState([]);
  const [catalogServices, setCatalogServices] = useState([]);
  const [search,          setSearch]          = useState('');
  const [statusFilter,    setStatusFilter]    = useState('All');
  const [modal,           setModal]           = useState(false);
  const [viewModal,       setViewModal]       = useState(null);
  const [form,            setForm]            = useState(EMPTY);
  const [editId,          setEditId]          = useState(null);
  const [toast,           setToast]           = useState('');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bRes, cRes, vRes] = await Promise.allSettled([
        bookingService.getAll(),
        customerService.getAll(),
        vehicleService.getAll(),
      ]);

      if (bRes.status === 'fulfilled') setRows(Array.isArray(bRes.value) ? bRes.value : []);
      else console.error('Bookings load failed:', bRes.reason);

      if (cRes.status === 'fulfilled') setCustomers(Array.isArray(cRes.value) ? cRes.value : []);
      else console.error('Customers load failed:', cRes.reason);

      if (vRes.status === 'fulfilled') setVehicles(Array.isArray(vRes.value) ? vRes.value : []);
      else console.error('Vehicles load failed:', vRes.reason);

      if (bRes.status === 'rejected' && cRes.status === 'rejected' && vRes.status === 'rejected') {
        setError(bRes.reason?.message || 'Failed to connect to server.');
      }

      try {
        const s = await servicesCatalogService.getAll();
        if (Array.isArray(s) && s.length) setCatalogServices(s);
      } catch { /* use LOCAL_SERVICES */ }

    } catch (err) {
      setError(err.message || 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const allServices = catalogServices.length > 0 ? catalogServices : LOCAL_SERVICES;

  // KEY FIX: build customer names safely — no nulls
  const customerNames = customers
    .filter(c => c != null && c.fullName != null && String(c.fullName).trim() !== '')
    .map(c => String(c.fullName));

  const customerVehicles = vehicles.filter(v => v != null && v.owner === form.customer);

  // KEY FIX: build vehicle options safely — no nulls
  const vehicleOptions = customerVehicles
    .filter(v => v && v.make && v.model && v.plate)
    .map(v => `${v.make} ${v.model} — ${v.plate}`);

  const vehicleTypeBadge = form.vehicle ? detectType(form.vehicle) : '';

  const handleCustomerSelect = name => {
    const c     = customers.find(x => x.fullName === name);
    const vList = vehicles.filter(v => v && v.owner === name);
    const first = vList[0];
    const vName = first ? `${first.make || ''} ${first.model || ''}`.trim() : '';
    setForm(f => ({
      ...f,
      customer:      name,
      customerPhone: c?.phone || '',
      vehicle:       vName,
      plate:         first?.plate || '',
      vehicleType:   vName ? detectType(vName) : '',
      services:      [], service: '', amount: '',
    }));
  };

  const handleVehicleSelect = label => {
    const v = customerVehicles.find(x => `${x.make} ${x.model} — ${x.plate}` === label);
    if (!v) return;
    const vName = `${v.make || ''} ${v.model || ''}`.trim();
    const lastBooking = [...rows]
      .filter(r => r.plate === v.plate && r.service)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    setForm(f => ({ ...f, vehicle: vName, plate: v.plate || '', vehicleType: detectType(vName), services: [], service: '', amount: '' }));
    if (lastBooking?.service) showToast(`💡 Last service for ${v.plate}: "${lastBooking.service}"`);
  };

  const handleServicesChange = (names, total) => {
    setForm(f => ({
      ...f,
      services: names,
      service:  names.join(', '),
      amount:   total > 0 ? String(total) : f.amount,
    }));
  };

  const plateHistory = form.plate
    ? rows.filter(r => r.plate === form.plate && r.status === 'Completed').sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return (
      ((r.bookingCode || '').toLowerCase().includes(q) ||
       (r.customer    || '').toLowerCase().includes(q) ||
       (r.plate       || '').toLowerCase().includes(q)) &&
      (statusFilter === 'All' || r.status === statusFilter)
    );
  });

  const openAdd  = () => { setForm({ ...EMPTY }); setEditId(null); setModal(true); };
  const openEdit = r => {
    setForm({
      ...r,
      date:     r.date?.toString().slice(0, 10) || '',
      time:     r.time?.toString().slice(0, 5)  || '',
      services: Array.isArray(r.services) ? r.services : r.service ? r.service.split(',').map(s => s.trim()) : [],
    });
    setEditId(r.id);
    setModal(true);
  };

  const save = async () => {
    if (!form.customer || !form.vehicle || !form.service || !form.date) {
      alert('Please fill required fields: Customer, Vehicle, Service and Date.');
      return;
    }
    try {
      if (editId) { await bookingService.update(editId, form); showToast('✅ Booking updated'); }
      else        { await bookingService.create(form);         showToast('✅ Booking added');   }
      setModal(false); loadAll();
    } catch (err) { alert(err.message); }
  };

  const del = async id => {
    if (!confirm('Delete this booking?')) return;
    try { await bookingService.delete(id); showToast('🗑 Deleted'); loadAll(); }
    catch (err) { alert(err.message); }
  };

  const changeStatus = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      if (status === 'Completed') {
        const booking = rows.find(r => r.id === id);
        if (booking) {
          const due = new Date(); due.setDate(due.getDate() + 14);
          try {
            await invoiceService.create({
              bookingId: booking.id, bookingCode: booking.bookingCode || '',
              customer: booking.customer || '', customerPhone: booking.customerPhone || '',
              vehicle: booking.vehicle || '', plate: booking.plate || '',
              service: booking.service || '', date: new Date().toISOString().slice(0, 10),
              dueDate: due.toISOString().slice(0, 10), total: booking.amount || '0',
              paid: '0', status: 'Unpaid', notes: 'Auto-generated from completed booking',
            });
            showToast('🧾 Invoice auto-generated!');
          } catch { /* silent */ }
        }
      }
    } catch (err) { alert(err.message); }
  };

  const selectedServices = (Array.isArray(form.services) ? form.services : [])
    .map(n => allServices.find(s => s.name === n)).filter(Boolean);
  const selectedTotal = selectedServices.reduce((s, sv) => s + (sv.price || 0), 0);

  const exportData = filtered.map(r => ({
    'Booking ID': r.bookingCode, Customer: r.customer,
    Vehicle: r.vehicle, Plate: r.plate, Service: r.service,
    Date: r.date, Status: r.status, 'Amount (LKR)': r.amount,
  }));

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Booking Management</div></div>
        <div className="page-actions">
          <ExportBtn data={exportData} filename="bookings-export" title="Booking Management Report" />
          <button className="btn btn-accent" onClick={openAdd}>＋ New Booking</button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-warn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button onClick={loadAll} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700, fontFamily: 'inherit' }}>Retry</button>
        </div>
      )}

      <div className="stats-row stats-5">
        {[
          { icon: '📅', val: rows.length,                                         label: 'Total',       color: 'sc-gold'   },
          { icon: '⏳', val: rows.filter(r => r.status === 'Pending').length,     label: 'Pending',     color: 'sc-orange' },
          { icon: '✅', val: rows.filter(r => r.status === 'Approved').length,    label: 'Approved',    color: 'sc-blue'   },
          { icon: '🔧', val: rows.filter(r => r.status === 'In Progress').length, label: 'In Progress', color: 'sc-cyan'   },
          { icon: '🏁', val: rows.filter(r => r.status === 'Completed').length,   label: 'Completed',   color: 'sc-green'  },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label} Bookings</div>
          </div>
        ))}
      </div>

      <div className="tcard">
        <div className="tcard-bar">
          <div className="tcard-title">📅 All Bookings</div>
          <div className="tbar-right">
            <div className="search-wrap">
              <input className="search-box" placeholder="ID / Customer / Plate..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filt-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {['All', ...ALL_ST].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">Loading bookings...</div></div>
        ) : error && rows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <div className="empty-text">Could not load bookings</div>
            <button onClick={loadAll} className="btn btn-accent" style={{ marginTop: 12 }}>Retry</button>
          </div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr>{['ID','Customer','Vehicle','Service','Date','Time','Tech','Status','Amount','Actions'].map(col => <th key={col}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td><span className="mono text-accent" style={{ fontSize: '.78rem', fontWeight: 700 }}>{r.bookingCode}</span></td>
                    <td>
                      <div className="text-bold">{r.customer}</div>
                      <div style={{ fontSize: '.76rem', color: 'var(--text2)' }}>{r.customerPhone}</div>
                    </td>
                    <td>
                      <div className="text-bold">{r.vehicle}</div>
                      <span className="mono" style={{ fontSize: '.76rem', color: 'var(--accent)' }}>{r.plate}</span>
                    </td>
                    <td style={{ fontSize: '.83rem', maxWidth: 160 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.service}</div>
                    </td>
                    <td style={{ fontSize: '.82rem' }}>{r.date}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--text2)' }}>{r.time}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--text2)' }}>{r.tech}</td>
                    <td>
                      <select className="filt-select" style={{ fontSize: '.74rem', padding: '4px 8px' }}
                        value={r.status} onChange={e => changeStatus(r.id, e.target.value)}>
                        {ALL_ST.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><span className="mono text-accent" style={{ fontWeight: 700 }}>LKR {Number(r.amount || 0).toLocaleString()}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn btn-blue btn-xs"    onClick={() => setViewModal(r)}>👁</button>
                        <button className="btn btn-outline btn-xs" onClick={() => openEdit(r)}>✏️</button>
                        <button className="btn btn-danger btn-xs"  onClick={() => del(r.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10}>
                    <div className="empty-state"><div className="empty-icon">📅</div><div className="empty-text">No bookings found</div></div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="tfoot">
          <span>{filtered.length} of {rows.length} bookings</span>
          <span>Total: LKR {filtered.reduce((a, r) => a + Number(r.amount || 0), 0).toLocaleString()}</span>
        </div>
      </div>

      {/* ══ ADD / EDIT MODAL ══════════════════════════════════ */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-head">
              <div className="modal-title">{editId ? '✏️ Edit Booking' : '＋ New Booking'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            <div className="form-row">
              <div className="field">
                <label>Customer *</label>
                {customerNames.length > 0 ? (
                  <SearchableDropdown value={form.customer || ''} onChange={handleCustomerSelect} options={customerNames} placeholder="Select customer..." />
                ) : (
                  <input name="customer" value={form.customer || ''} onChange={h} placeholder="Type customer name" />
                )}
              </div>
              <div className="field">
                <label>Phone</label>
                <input name="customerPhone" value={form.customerPhone || ''} onChange={h} placeholder="07X-XXXXXXX" />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>
                  Vehicle *
                  {vehicleTypeBadge && (
                    <span style={{ marginLeft: 8, fontSize: '.65rem', background: 'var(--blue-dim)', color: 'var(--blue)', padding: '1px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{vehicleTypeBadge}</span>
                  )}
                </label>
                {vehicleOptions.length > 0 ? (
                  <SearchableDropdown
                    value={form.vehicle && form.plate ? `${form.vehicle} — ${form.plate}` : ''}
                    onChange={handleVehicleSelect}
                    options={vehicleOptions}
                    placeholder="Select vehicle..."
                  />
                ) : (
                  <input name="vehicle" value={form.vehicle || ''} onChange={h} placeholder="e.g. Toyota Camry" />
                )}
              </div>
              <div className="field">
                <label>Plate No.</label>
                <input name="plate" value={form.plate || ''} onChange={h} placeholder="CAB-1234" />
              </div>
            </div>

            {plateHistory.length > 0 && (
              <div className="alert-box alert-info" style={{ marginBottom: 10, fontSize: '.8rem' }}>
                🔧 <strong>{form.plate}</strong> — Last: <strong>{plateHistory[0]?.service}</strong> on {plateHistory[0]?.date}
              </div>
            )}

            <div className="field">
              <label>
                Services *
                {form.plate && <span style={{ marginLeft: 8, fontSize: '.65rem', background: 'rgba(34,211,238,.15)', color: 'var(--cyan)', padding: '1px 8px', borderRadius: 10 }}>🔗 filtered for {form.plate}</span>}
              </label>
              <ServiceMultiDropdown
                value={Array.isArray(form.services) ? form.services : []}
                onChange={handleServicesChange}
                services={allServices}
                vehicleTypeBadge={vehicleTypeBadge}
                selectedPlate={form.plate || ''}
              />
              {selectedServices.length > 0 && (
                <div style={{ marginTop: 8, background: 'var(--surface2)', borderRadius: 'var(--r)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  {selectedServices.map(s => (
                    <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid var(--border)', fontSize: '.78rem' }}>
                      <span style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => handleServicesChange(form.services.filter(n => n !== s.name), selectedTotal - (s.price || 0))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0, fontSize: '.82rem' }}>×</button>
                        {s.name}
                      </span>
                      <span style={{ color: 'var(--accent)', fontFamily: 'monospace', fontWeight: 600 }}>LKR {Number(s.price || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', background: 'rgba(240,192,64,.08)', fontSize: '.82rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text)' }}>Total ({selectedServices.length} services)</span>
                    <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>LKR {selectedTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="field"><label>Date *</label><input name="date" type="date" value={form.date || ''} onChange={h} /></div>
              <div className="field"><label>Time</label><input name="time" type="time" value={form.time || ''} onChange={h} /></div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>Slot</label>
                <select name="slot" value={form.slot || 'Morning'} onChange={h}>{SLOTS.map(s => <option key={s}>{s}</option>)}</select>
              </div>
              <div className="field"><label>Technician</label><input name="tech" value={form.tech || ''} onChange={h} placeholder="Assign technician" /></div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>
                  Amount (LKR)
                  {selectedServices.length > 0 && <span style={{ marginLeft: 8, fontSize: '.67rem', background: 'rgba(34,197,94,.15)', color: 'var(--green)', padding: '1px 8px', borderRadius: 10 }}>auto-calculated</span>}
                </label>
                <input name="amount" type="number" value={form.amount || ''} onChange={h} placeholder="0" />
              </div>
              <div className="field">
                <label>Status</label>
                <select name="status" value={form.status || 'Pending'} onChange={h}>{ALL_ST.map(s => <option key={s}>{s}</option>)}</select>
              </div>
            </div>

            <div className="field">
              <label>Notes</label>
              <textarea name="notes" value={form.notes || ''} onChange={h} rows={2} placeholder="Special instructions..." />
            </div>

            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={save}>{editId ? 'Update' : 'Save'} Booking</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setViewModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">📅 Booking — {viewModal.bookingCode}</div>
              <button className="modal-close" onClick={() => setViewModal(null)}>×</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <span className={`badge ${STATUS_C[viewModal.status] || 'bg-muted'}`}>{viewModal.status}</span>
            </div>
            <div className="info-grid">
              {[
                { k: 'Customer', v: viewModal.customer }, { k: 'Phone', v: viewModal.customerPhone },
                { k: 'Vehicle',  v: viewModal.vehicle  }, { k: 'Plate', v: viewModal.plate },
                { k: 'Date',     v: viewModal.date     }, { k: 'Time',  v: viewModal.time  },
                { k: 'Technician', v: viewModal.tech   }, { k: 'Slot',  v: viewModal.slot  },
                { k: 'Amount', v: 'LKR ' + Number(viewModal.amount || 0).toLocaleString() },
              ].map(i => (
                <div key={i.k} className="info-item">
                  <span className="info-key">{i.k}</span>
                  <span className="info-val">{i.v || '—'}</span>
                </div>
              ))}
            </div>
            {viewModal.service && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: '.7rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>Services</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {viewModal.service.split(',').map(s => <span key={s} className="badge bg-blue">{s.trim()}</span>)}
                </div>
              </div>
            )}
            {viewModal.notes && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 'var(--r)', fontSize: '.84rem' }}>
                <strong>Notes: </strong>{viewModal.notes}
              </div>
            )}
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setViewModal(null)}>Close</button>
              <button className="btn btn-accent" onClick={() => { openEdit(viewModal); setViewModal(null); }}>✏️ Edit</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-stack"><div className="toast toast-success">{toast}</div></div>}
    </div>
  );
}