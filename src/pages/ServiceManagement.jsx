import { useState, useEffect, useCallback } from 'react';
import ExportBtn from '../components/Exportbtn';
import { servicesCatalogService, vehicleService } from '../utils/api';
import "../style.css";

const STAGES  = ['Vehicle Received','In Service','Quality Check','Ready for Pickup'];
const STAGE_C = { 'Vehicle Received':'bg-orange','In Service':'bg-blue','Quality Check':'bg-purple','Ready for Pickup':'bg-green' };
const CATS    = ['Routine Maintenance','Repairs','Emergency Services'];
const CAT_C   = { 'Routine Maintenance':'bg-blue','Repairs':'bg-orange','Emergency Services':'bg-red' };

const SERVICE_LIST = [
  { name:'Oil & Filter Change',      category:'Routine Maintenance', duration:'1 hr',    price:3500  },
  { name:'Full Service',             category:'Routine Maintenance', duration:'1 day',   price:15000 },
  { name:'Tyre Rotation & Balance',  category:'Routine Maintenance', duration:'1.5 hrs', price:4500  },
  { name:'Wheel Alignment',          category:'Routine Maintenance', duration:'1 hr',    price:3000  },
  { name:'Battery Check & Replace',  category:'Routine Maintenance', duration:'30 min',  price:8000  },
  { name:'Air Filter Replacement',   category:'Routine Maintenance', duration:'30 min',  price:2500  },
  { name:'Full Brake Service',       category:'Repairs',             duration:'3 hrs',   price:8200  },
  { name:'AC Repair & Regas',        category:'Repairs',             duration:'4 hrs',   price:12000 },
  { name:'Engine Diagnostic',        category:'Repairs',             duration:'2 hrs',   price:5000  },
  { name:'Suspension Repair',        category:'Repairs',             duration:'4 hrs',   price:18000 },
  { name:'Clutch Replacement',       category:'Repairs',             duration:'1 day',   price:25000 },
  { name:'Gearbox Service',          category:'Repairs',             duration:'1 day',   price:30000 },
  { name:'Radiator Flush',           category:'Repairs',             duration:'2 hrs',   price:6000  },
  { name:'Flat Tyre Repair',         category:'Emergency Services',  duration:'30 min',  price:1500  },
  { name:'Jump Start',               category:'Emergency Services',  duration:'15 min',  price:1000  },
  { name:'Towing Service',           category:'Emergency Services',  duration:'1 hr',    price:5000  },
  { name:'Emergency Brake Fix',      category:'Emergency Services',  duration:'2 hrs',   price:8000  },
];

const EMPTY = {
  names:[], name:'', category:'Routine Maintenance', description:'', price:'',
  vehicleType:'All', assignedVehicles:[], duration:'', status:'Available',
  warranty:'', count:0, assignedDate: new Date().toISOString().slice(0,10),
  techNotes:'', priority:'Normal',
};

// ── Multi-vehicle picker component ───────────────────────────────────────────
function VehiclePicker({ selected = [], onChange, vehicles }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');

  const filtered = vehicles.filter(v =>
    `${v.plate} ${v.make} ${v.model} ${v.owner}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = plate => {
    if (selected.includes(plate)) {
      onChange(selected.filter(p => p !== plate));
    } else {
      onChange([...selected, plate]);
    }
  };

  const label = selected.length === 0
    ? '— Select vehicles (optional) —'
    : `${selected.length} vehicle${selected.length > 1 ? 's' : ''} selected`;

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg)', border: '1px solid var(--border2)',
          borderRadius: 'var(--r)', padding: '10px 13px', cursor: 'pointer',
          minHeight: 42, fontSize: '.88rem',
          color: selected.length ? 'var(--text)' : 'var(--text2)',
        }}
      >
        <span style={{ flex: 1 }}>{label}</span>
        {selected.length > 0 && (
          <span style={{
            background: 'var(--accent-dim)', color: 'var(--accent)',
            borderRadius: 20, padding: '1px 8px', fontSize: '.72rem', fontWeight: 700,
          }}>{selected.length}</span>
        )}
        <span style={{ fontSize: '.7rem', opacity: .6 }}>{open ? '▲' : '▼'}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          zIndex: 9999, background: '#131720',
          border: '1.5px solid var(--accent)', borderRadius: 'var(--r)',
          boxShadow: '0 12px 32px rgba(0,0,0,.7)', overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
            <input
              autoFocus value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vehicles..."
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', background: '#0d1018',
                border: '1px solid var(--border)', borderRadius: 'var(--r)',
                padding: '5px 8px', fontSize: '.83rem',
                color: 'var(--text)', outline: 'none',
              }}
            />
          </div>

          {/* Select all / Clear */}
          <div style={{
            padding: '5px 12px', display: 'flex', gap: 8,
            borderBottom: '1px solid var(--border)',
          }}>
            <button onClick={() => onChange(vehicles.map(v => v.plate))}
              style={{ fontSize: '.74rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Select all
            </button>
            <span style={{ color: 'var(--border2)' }}>|</span>
            <button onClick={() => onChange([])}
              style={{ fontSize: '.74rem', color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Clear
            </button>
          </div>

          {/* Vehicle list */}
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '.83rem', color: 'var(--text2)', textAlign: 'center' }}>
                No vehicles found
              </div>
            ) : filtered.map(v => {
              const isChecked = selected.includes(v.plate);
              return (
                <div
                  key={v.plate}
                  onClick={() => toggle(v.plate)}
                  style={{
                    padding: '9px 12px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: isChecked ? 'rgba(240,192,64,.08)' : 'transparent',
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = '#1a1f2e'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isChecked ? 'rgba(240,192,64,.08)' : 'transparent'; }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${isChecked ? 'var(--accent)' : 'var(--border2)'}`,
                    background: isChecked ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: '.15s',
                  }}>
                    {isChecked && <span style={{ fontSize: '.6rem', color: '#000', fontWeight: 900 }}>✓</span>}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text)' }}>
                      <span className="mono" style={{ color: 'var(--accent)', marginRight: 6 }}>{v.plate}</span>
                      {v.make} {v.model}
                    </div>
                    <div style={{ fontSize: '.74rem', color: 'var(--text2)', marginTop: 1 }}>
                      Owner: {v.owner} &nbsp;·&nbsp; {v.year}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Done button */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'var(--accent)', color: '#000', border: 'none',
                borderRadius: 7, padding: '6px 18px', fontSize: '.83rem',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Done ({selected.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ServiceNamePicker — MULTI-SELECT checkbox dropdown ───────────────────────
// value: string[]  (array of selected service names)
// onChange: (names: string[]) => void
// onAutoFill: (firstSvc | null) => void  — auto-fills price/duration/category
function ServiceNamePicker({ value = [], onChange, onAutoFill }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const CAT_ICON = { 'Routine Maintenance':'🔧', 'Repairs':'🛠', 'Emergency Services':'🚨' };

  const filteredList = SERVICE_LIST.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );
  const grouped = filteredList.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  // Toggle one service in/out of selection
  const toggle = svc => {
    const next = value.includes(svc.name)
      ? value.filter(n => n !== svc.name)
      : [...value, svc.name];
    onChange(next);
    // Auto-fill from first selected service
    const first = SERVICE_LIST.find(s => s.name === next[0]);
    onAutoFill(first || null);
  };

  const selectAll = () => {
    onChange(SERVICE_LIST.map(s => s.name));
    onAutoFill(SERVICE_LIST[0]);
  };
  const clearAll = () => { onChange([]); onAutoFill(null); };

  // Trigger label
  const triggerLabel = value.length === 0
    ? '— Select services —'
    : value.length === 1
      ? value[0]
      : `${value.length} services selected`;

  return (
    <div style={{ position:'relative' }}>
      {/* Trigger */}
      <div onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', gap:8,
        background:'var(--bg)',
        border:`1px solid ${value.length ? 'var(--accent)' : 'var(--border2)'}`,
        borderRadius:'var(--r)', padding:'10px 13px', cursor:'pointer',
        minHeight:42, fontSize:'.88rem',
        color: value.length ? 'var(--text)' : 'var(--text2)',
        transition:'border-color .18s',
      }}>
        <span style={{flex:1, fontWeight: value.length ? 600 : 400}}>{triggerLabel}</span>
        {value.length > 0 && (
          <span style={{
            background:'var(--accent-dim)', color:'var(--accent)',
            borderRadius:20, padding:'1px 8px',
            fontSize:'.72rem', fontWeight:700, flexShrink:0,
          }}>{value.length}</span>
        )}
        <span style={{fontSize:'.7rem',opacity:.5}}>{open?'▲':'▼'}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
          zIndex:9999, background:'#131720',
          border:'1.5px solid var(--accent)', borderRadius:'var(--r)',
          boxShadow:'0 12px 36px rgba(0,0,0,.75)', overflow:'hidden',
        }}>
          {/* Search */}
          <div style={{padding:'7px 9px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:7}}>
            <span style={{fontSize:'.8rem', opacity:.5}}>🔍</span>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search services..." onClick={e => e.stopPropagation()}
              style={{flex:1, background:'transparent', border:'none', fontSize:'.84rem', color:'var(--text)', outline:'none'}}/>
            {search && <button onClick={e=>{e.stopPropagation(); setSearch('');}}
              style={{background:'none',border:'none',cursor:'pointer',color:'var(--text2)',fontSize:'.9rem',padding:0}}>×</button>}
          </div>

          {/* Select all / Clear */}
          <div style={{padding:'5px 12px', borderBottom:'1px solid var(--border)', display:'flex', gap:10, alignItems:'center'}}>
            <button onClick={selectAll}
              style={{fontSize:'.74rem',color:'var(--accent)',background:'none',border:'none',cursor:'pointer',padding:0}}>
              ☑ Select all
            </button>
            <span style={{color:'var(--border2)'}}>|</span>
            <button onClick={clearAll}
              style={{fontSize:'.74rem',color:'var(--red)',background:'none',border:'none',cursor:'pointer',padding:0}}>
              ✕ Clear all
            </button>
            {value.length > 0 && (
              <span style={{marginLeft:'auto', fontSize:'.72rem', color:'var(--text2)'}}>
                {value.length} selected
              </span>
            )}
          </div>

          {/* List */}
          <div style={{maxHeight:300, overflowY:'auto'}}>
            {Object.keys(grouped).length === 0
              ? <div style={{padding:'16px', textAlign:'center', fontSize:'.83rem', color:'var(--text2)'}}>No services found</div>
              : Object.entries(grouped).map(([cat, svcs]) => (
                <div key={cat}>
                  {/* Category header */}
                  <div style={{
                    padding:'6px 12px 4px', fontSize:'.68rem', fontWeight:700,
                    letterSpacing:1, color:'var(--accent)', textTransform:'uppercase',
                    background:'#0d1018', borderBottom:'1px solid var(--border)',
                    display:'flex', alignItems:'center', gap:6,
                  }}><span>{CAT_ICON[cat]||'🔧'}</span>{cat}</div>

                  {svcs.map(svc => {
                    const sel = value.includes(svc.name);
                    return (
                      <div key={svc.name} onClick={() => toggle(svc)} style={{
                        padding:'9px 14px', cursor:'pointer',
                        borderBottom:'1px solid var(--border)',
                        display:'flex', alignItems:'center', gap:10,
                        background: sel ? 'rgba(240,192,64,.08)' : 'transparent',
                        transition:'background .12s',
                      }}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.background='#1a1f2e'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = sel ? 'rgba(240,192,64,.08)' : 'transparent'; }}>

                        {/* Checkbox */}
                        <div style={{
                          width:18, height:18, borderRadius:4, flexShrink:0,
                          border:`2px solid ${sel ? 'var(--accent)' : 'var(--border2)'}`,
                          background: sel ? 'var(--accent)' : 'transparent',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          transition:'.15s',
                        }}>
                          {sel && <span style={{fontSize:'.65rem', color:'#000', fontWeight:900, lineHeight:1}}>✓</span>}
                        </div>

                        {/* Name */}
                        <span style={{
                          flex:1, fontSize:'.85rem',
                          color: sel ? 'var(--accent)' : 'var(--text)',
                          fontWeight: sel ? 700 : 400,
                        }}>
                          {svc.name}
                        </span>

                        {/* Price + duration */}
                        <div style={{textAlign:'right', flexShrink:0}}>
                          <div style={{
                            fontSize:'.77rem', fontWeight:700, color:'var(--accent)',
                            background:'rgba(240,192,64,.13)',
                            padding:'2px 9px', borderRadius:20,
                          }}>
                            LKR {Number(svc.price).toLocaleString()}
                          </div>
                          <div style={{fontSize:'.68rem', color:'var(--text2)', marginTop:2}}>⏱ {svc.duration}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            }
          </div>

          {/* Done button */}
          <div style={{padding:'8px 12px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end'}}>
            <button onClick={() => setOpen(false)} style={{
              background:'var(--accent)', color:'#000', border:'none',
              borderRadius:7, padding:'6px 20px', fontSize:'.83rem',
              fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}>
              Done ({value.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function Services() {
  const [tab,       setTab]      = useState('catalogue');
  const [services,  setServices] = useState([]);
  const [vehicles,  setVehicles] = useState([]);
  const [pipeline,  setPipeline] = useState([
    { id:'JOB001', bookingId:'B0248', vehicle:'Toyota Camry (CAB-1234)', service:'Oil Change',   tech:'Ravi Kumar',   stage:'In Service'       },
    { id:'JOB002', bookingId:'B0245', vehicle:'Suzuki Alto (SG-3456)',   service:'Full Service', tech:'Saman Dias',   stage:'Vehicle Received' },
    { id:'JOB003', bookingId:'B0243', vehicle:'Nissan Sunny (SP-9012)',  service:'Tyre Change',  tech:'Kasun Perera', stage:'Ready for Pickup' },
  ]);
  const [search,    setSearch]   = useState('');
  const [catFilter, setCatFilter]= useState('All');
  const [modal,     setModal]    = useState(false);
  const [viewModal, setViewModal]= useState(null);
  const [form,      setForm]     = useState(EMPTY);
  const [editId,    setEditId]   = useState(null);
  const [toast,     setToast]    = useState('');
  const [loading,   setLoading]  = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleServiceName = e => {
    const name = e.target.value;
    const svc  = SERVICE_LIST.find(s => s.name === name);
    setForm(f => ({
      ...f, name,
      category: svc?.category || f.category,
      duration: svc?.duration || f.duration,
      price:    svc ? String(svc.price) : f.price,
    }));
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, v] = await Promise.all([
        servicesCatalogService.getAll(),
        vehicleService.getAll(),
      ]);
      setServices(s);
      setVehicles(v);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const vehicleLabel = plate => {
    const v = vehicles.find(x => x.plate === plate);
    return v ? `${v.make} ${v.model} (${plate})` : plate;
  };

  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || (s.category||'').toLowerCase().includes(q))
      && (catFilter === 'All' || s.category === catFilter);
  });

  const openAdd  = () => { setForm({ ...EMPTY, assignedVehicles:[], names:[] }); setEditId(null); setModal(true); };
  const openEdit = r => {
    setForm({
      ...r,
      assignedDate:     r.assignedDate?.toString().slice(0,10) || '',
      assignedVehicles: Array.isArray(r.assignedVehicles) ? r.assignedVehicles : (r.vehicle ? [r.vehicle] : []),
      names: Array.isArray(r.names) ? r.names : (r.name ? [r.name] : []),
    });
    setEditId(r.id);
    setModal(true);
  };

  const save = async () => {
    if ((!form.names || form.names.length === 0) && !form.name) {
      alert('Select at least one service name.'); return;
    }
    if (!form.price) { alert('Price is required.'); return; }

    const namesToSave = form.names?.length > 0 ? form.names : [form.name];

    try {
      if (editId) {
        // Edit mode — update single record (use first selected name)
        const payload = {
          ...form,
          name:            namesToSave[0],
          names:           namesToSave,
          assignedVehicles: form.assignedVehicles || [],
          vehicle:         form.assignedVehicles?.[0] || '',
        };
        await servicesCatalogService.update(editId, payload);
        showToast('✅ Service updated');
      } else {
        // Create mode — create ONE record per selected service name
        const basePayload = {
          ...form,
          assignedVehicles: form.assignedVehicles || [],
          vehicle:         form.assignedVehicles?.[0] || '',
        };

        if (namesToSave.length === 1) {
          // Single service — create one record
          await servicesCatalogService.create({
            ...basePayload,
            name:  namesToSave[0],
            names: namesToSave,
          });
        } else {
          // Multiple services — create a separate record for each
          await Promise.all(namesToSave.map(n => {
            // Find price for this specific service from SERVICE_LIST
            const svcData = SERVICE_LIST.find(s => s.name === n);
            return servicesCatalogService.create({
              ...basePayload,
              name:     n,
              names:    [n],
              // Use individual price if auto-calculated; keep manual price for single
              price:    svcData ? String(svcData.price) : basePayload.price,
              duration: svcData?.duration || basePayload.duration,
              category: svcData?.category || basePayload.category,
            });
          }));
        }

        showToast(
          namesToSave.length > 1
            ? `✅ ${namesToSave.length} services added`
            : '✅ Service added'
        );
      }

      setModal(false);
      loadAll();
    } catch (err) { alert(err.message); }
  };

  const del = async id => {
    if (!confirm('Remove service?')) return;
    try { await servicesCatalogService.delete(id); showToast('🗑 Removed'); loadAll(); }
    catch (err) { alert(err.message); }
  };

  const advanceStage = jobId => {
    setPipeline(pipeline.map(j => {
      if (j.id !== jobId) return j;
      const idx = STAGES.indexOf(j.stage);
      if (idx < STAGES.length - 1) {
        showToast(`✅ ${j.vehicle} → ${STAGES[idx+1]}`);
        return { ...j, stage: STAGES[idx+1] };
      }
      return j;
    }));
  };

  const totalRevenue = services.reduce((a, s) => a + Number(s.price||0) * Number(s.count||0), 0);

  const exportData = filtered.map(s => ({
    ID: s.serviceCode, 'Service Name': s.name, Category: s.category,
    'Price (LKR)': s.price, Duration: s.duration, Status: s.status,
    'Assigned Vehicles': (s.assignedVehicles||[]).join(', '),
  }));

  // assigned vehicles count for table
  const assignedCount = s => {
    const arr = Array.isArray(s.assignedVehicles) ? s.assignedVehicles : (s.vehicle ? [s.vehicle] : []);
    return arr.length;
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Service Management</div></div>
        <div className="page-actions">
          <ExportBtn data={exportData} filename="services-export" title="Service Management Report" />
          <button className="btn btn-accent" onClick={openAdd}>＋ Add Service</button>
        </div>
      </div>

      <div className="stats-row stats-4">
        {[
          { icon:'🔧', label:'Total Services', val: services.length,                                    color:'sc-blue'   },
          { icon:'✅', label:'Available',       val: services.filter(s=>s.status==='Available').length,  color:'sc-green'  },
          { icon:'🏭', label:'Active Jobs',     val: pipeline.length,                                    color:'sc-orange' },
          { icon:'💰', label:'Est. Revenue',    val: 'LKR '+(totalRevenue/1000).toFixed(0)+'K',         color:'sc-gold'   },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-val" style={{ fontSize: typeof s.val==='string'?'1.4rem':'2rem' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'var(--surface2)', borderRadius:'var(--r)', padding:4, width:'fit-content' }}>
        {['catalogue','pipeline'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'8px 20px', borderRadius:7, border:'none', cursor:'pointer',
            background: tab===t ? 'var(--surface)' : 'none',
            color: tab===t ? 'var(--accent)' : 'var(--text2)',
            fontFamily:'inherit', fontWeight: tab===t ? 700 : 500, fontSize:'.86rem',
            boxShadow: tab===t ? 'var(--shadow)' : 'none', transition:'.15s',
          }}>
            {t==='catalogue' ? '📋 Service Catalogue' : '🏭 Job Pipeline'}
          </button>
        ))}
      </div>

      {tab === 'catalogue' && (
        <div className="tcard">
          <div className="tcard-bar">
            <div className="tcard-title">Service Catalogue</div>
            <div className="tbar-right">
              <div className="search-wrap">
                <input className="search-box" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="filt-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                {['All',...CATS].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {loading ? (
            <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">Loading services...</div></div>
          ) : (
            <div className="tscroll">
              <table>
                <thead>
                  <tr>{['ID','Service','Category','Vehicles','Price (LKR)','Duration','Done','Priority','Status','Actions'].map(col => <th key={col}>{col}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const assigned = Array.isArray(s.assignedVehicles) ? s.assignedVehicles : (s.vehicle ? [s.vehicle] : []);
                    return (
                      <tr key={s.id}>
                        <td><span className="mono text-accent" style={{ fontSize:'.78rem' }}>{s.serviceCode}</span></td>
                        <td>
                          <div className="text-bold">{s.name}</div>
                          <div style={{ fontSize:'.74rem', color:'var(--text2)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.description}</div>
                        </td>
                        <td><span className={`badge ${CAT_C[s.category]||'bg-muted'}`}>{s.category}</span></td>
                        <td>
                          {assigned.length === 0 ? (
                            <span style={{ color:'var(--text2)', fontSize:'.78rem' }}>—</span>
                          ) : assigned.length === 1 ? (
                            <span className="mono text-accent" style={{ fontSize:'.8rem' }}>{vehicleLabel(assigned[0])}</span>
                          ) : (
                            <div>
                              <span className="mono text-accent" style={{ fontSize:'.8rem' }}>{vehicleLabel(assigned[0])}</span>
                              <span style={{ fontSize:'.72rem', color:'var(--text2)', marginLeft:4 }}>+{assigned.length-1} more</span>
                            </div>
                          )}
                        </td>
                        <td><span className="mono text-accent" style={{ fontWeight:700 }}>{Number(s.price||0).toLocaleString()}</span></td>
                        <td className="text-muted">{s.duration}</td>
                        <td style={{ textAlign:'center' }}><span className="badge bg-gold">{s.count}</span></td>
                        <td><span className={`badge ${s.priority==='High'?'bg-red':s.priority==='Normal'?'bg-blue':'bg-muted'}`}>{s.priority||'Normal'}</span></td>
                        <td><span className={`badge ${s.status==='Available'?'bg-green':'bg-red'}`}>{s.status}</span></td>
                        <td>
                          <div style={{ display:'flex', gap:5 }}>
                            <button className="btn btn-blue btn-xs" onClick={() => setViewModal(s)}>ℹ️</button>
                            <button className="btn btn-outline btn-xs" onClick={() => openEdit(s)}>✏️</button>
                            <button className="btn btn-danger btn-xs" onClick={() => del(s.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length===0 && (
                    <tr><td colSpan={10}>
                      <div className="empty-state"><div className="empty-icon">🔧</div><div className="empty-text">No services found</div></div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="tfoot"><span>{filtered.length} of {services.length} services</span></div>
        </div>
      )}

      {tab === 'pipeline' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {STAGES.map(stage => (
            <div key={stage} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontWeight:700, fontSize:'.83rem' }}>{stage}</span>
                <span className={`badge ${STAGE_C[stage]}`}>{pipeline.filter(j=>j.stage===stage).length}</span>
              </div>
              <div style={{ padding:10, display:'flex', flexDirection:'column', gap:8, minHeight:120 }}>
                {pipeline.filter(j=>j.stage===stage).map(j => (
                  <div key={j.id} style={{ background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:8, padding:'10px 12px' }}>
                    <div style={{ fontSize:'.75rem', color:'var(--accent)', fontFamily:'monospace', marginBottom:3 }}>{j.bookingId}</div>
                    <div style={{ fontWeight:600, fontSize:'.83rem', marginBottom:2 }}>{j.vehicle}</div>
                    <div style={{ fontSize:'.77rem', color:'var(--text2)', marginBottom:6 }}>{j.service} · {j.tech}</div>
                    {stage !== 'Ready for Pickup'
                      ? <button className="btn btn-blue btn-xs" style={{ width:'100%', justifyContent:'center' }} onClick={() => advanceStage(j.id)}>→ Next Stage</button>
                      : <span className="badge bg-green" style={{ width:'100%', justifyContent:'center', display:'inline-flex' }}>✓ Complete</span>
                    }
                  </div>
                ))}
                {pipeline.filter(j=>j.stage===stage).length===0 && (
                  <div style={{ textAlign:'center', padding:'24px 8px', color:'var(--muted)', fontSize:'.78rem' }}>No jobs</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ──────────────────────────────────────────────── */}
      {modal && (
        <div className="overlay" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-head">
              <div className="modal-title">{editId ? '✏️ Edit Service' : '＋ New Service'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            <div className="section-title">Service Info</div>

            <div className="field">
              <label>
                Service Name *
                {form.names?.length > 0 && (
                  <span style={{marginLeft:8,fontSize:'.67rem',background:'var(--accent-dim)',color:'var(--accent)',padding:'1px 8px',borderRadius:10,fontWeight:700}}>
                    {form.names.length} selected
                  </span>
                )}
              </label>
              <ServiceNamePicker
                value={form.names || []}
                onChange={names => {
                  // Auto-calculate total price = sum of all selected services
                  const total = names.reduce((sum, n) => {
                    const svc = SERVICE_LIST.find(s => s.name === n);
                    return sum + (svc?.price || 0);
                  }, 0);
                  // Auto-fill category & duration from first service
                  const first = SERVICE_LIST.find(s => s.name === names[0]);
                  setForm(f => ({
                    ...f,
                    names,
                    name:     names[0] || '',
                    price:    total > 0 ? String(total) : f.price,
                    category: first?.category || f.category,
                    duration: first?.duration || f.duration,
                  }));
                }}
                onAutoFill={() => {}} // handled inside onChange above
              />
              {/* Selected services tags */}
              {form.names?.length > 0 && (
                <div style={{marginTop:8, display:'flex', flexWrap:'wrap', gap:6}}>
                  {form.names.map(n => {
                    const svc = SERVICE_LIST.find(s => s.name === n);
                    return (
                      <div key={n} style={{
                        display:'flex', alignItems:'center', gap:5,
                        background:'var(--accent-dim)', border:'1px solid rgba(240,192,64,.25)',
                        borderRadius:20, padding:'3px 10px 3px 8px', fontSize:'.78rem',
                      }}>
                        <span style={{color:'var(--accent)',fontWeight:700}}>{n}</span>
                        {svc?.price && <span style={{color:'var(--text2)',fontSize:'.72rem'}}>LKR {Number(svc.price).toLocaleString()}</span>}
                        <button onClick={() => setForm(f => ({...f, names: f.names.filter(x=>x!==n), name: f.names.filter(x=>x!==n)[0]||''}))}
                          style={{background:'none',border:'none',cursor:'pointer',color:'var(--text2)',padding:0,lineHeight:1,fontSize:'.85rem'}}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Auto-fill info from first service */}
              {form.names?.length > 0 && (
                <div style={{marginTop:6,padding:'6px 12px',background:'var(--surface2)',borderRadius:'var(--r)',fontSize:'.78rem',color:'var(--text2)',display:'flex',gap:16}}>
                  <span>📂 <strong style={{color:'var(--accent)'}}>{form.category}</strong></span>
                  {form.duration && <span>⏱ {form.duration}</span>}
                  {form.price && <span>💰 LKR {Number(form.price).toLocaleString()}</span>}
                </div>
              )}
            </div>

            <div className="field">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={h} rows={2} placeholder="Service description..." />
            </div>

            <div className="form-row">
              <div className="field">
                <label>Category</label>
                <select name="category" value={form.category} onChange={h}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Vehicle Type</label>
                <select name="vehicleType" value={form.vehicleType} onChange={h}>
                  {['All','Petrol','Diesel','Electric','Hybrid'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* ── MULTI-VEHICLE ASSIGNMENT ─────────────────────────────── */}
            <div className="section-title">Vehicle Assignment</div>
            <div className="form-row">
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>
                  Assign to Vehicles
                  {form.assignedVehicles?.length > 0 && (
                    <span style={{
                      marginLeft: 8, fontSize: '.67rem',
                      background: 'var(--accent-dim)', color: 'var(--accent)',
                      padding: '1px 8px', borderRadius: 10, fontWeight: 700,
                    }}>
                      {form.assignedVehicles.length} selected
                    </span>
                  )}
                </label>
                <VehiclePicker
                  selected={form.assignedVehicles || []}
                  onChange={plates => setForm(f => ({ ...f, assignedVehicles: plates }))}
                  vehicles={vehicles}
                />
              </div>
            </div>

            {/* Selected vehicles preview */}
            {form.assignedVehicles?.length > 0 && (
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14,
                padding: '10px 12px', background: 'var(--surface2)',
                borderRadius: 'var(--r)', border: '1px solid var(--border)',
              }}>
                {form.assignedVehicles.map(plate => {
                  const v = vehicles.find(x => x.plate === plate);
                  return (
                    <div key={plate} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--accent-dim)', border: '1px solid rgba(240,192,64,.25)',
                      borderRadius: 20, padding: '3px 10px 3px 8px', fontSize: '.78rem',
                    }}>
                      <span style={{ color: 'var(--accent)', fontFamily: 'monospace', fontWeight: 700 }}>{plate}</span>
                      {v && <span style={{ color: 'var(--text2)' }}>{v.make} {v.model}</span>}
                      <button
                        onClick={() => setForm(f => ({ ...f, assignedVehicles: f.assignedVehicles.filter(p => p !== plate) }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 0, lineHeight: 1, fontSize: '.9rem' }}>
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="field">
              <label>Assigned Date</label>
              <input name="assignedDate" type="date" value={form.assignedDate} onChange={h} />
            </div>

            <div className="section-title">Pricing &amp; Schedule</div>
            <div className="form-row">
              <div className="field">
                <label>
                  Price (LKR) *
                  {form.names?.length > 1 && (
                    <span style={{marginLeft:8,fontSize:'.67rem',background:'rgba(34,197,94,.15)',color:'var(--green)',padding:'1px 8px',borderRadius:10}}>
                      auto-calculated
                    </span>
                  )}
                </label>
                <input name="price" type="number" value={form.price} onChange={h} placeholder="5000" />
                {/* Price breakdown when multiple services selected */}
                {form.names?.length > 1 && (
                  <div style={{marginTop:6,background:'var(--surface2)',borderRadius:'var(--r)',overflow:'hidden',border:'1px solid var(--border)'}}>
                    {form.names.map(n => {
                      const svc = SERVICE_LIST.find(s => s.name === n);
                      return svc ? (
                        <div key={n} style={{
                          display:'flex',justifyContent:'space-between',alignItems:'center',
                          padding:'5px 10px',borderBottom:'1px solid var(--border)',
                          fontSize:'.76rem',
                        }}>
                          <span style={{color:'var(--text2)'}}>{n}</span>
                          <span style={{color:'var(--accent)',fontFamily:'monospace',fontWeight:600}}>
                            LKR {Number(svc.price).toLocaleString()}
                          </span>
                        </div>
                      ) : null;
                    })}
                    {/* Total row */}
                    <div style={{
                      display:'flex',justifyContent:'space-between',alignItems:'center',
                      padding:'6px 10px',background:'rgba(240,192,64,.08)',
                      fontSize:'.8rem',fontWeight:700,
                    }}>
                      <span style={{color:'var(--text)'}}>Total</span>
                      <span style={{color:'var(--accent)',fontFamily:'monospace'}}>
                        LKR {Number(form.price||0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="field">
                <label>Duration</label>
                <input name="duration" value={form.duration} onChange={h} placeholder="e.g. 2 hrs" />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Warranty</label>
                <input name="warranty" value={form.warranty} onChange={h} placeholder="3 months" />
              </div>
              <div className="field">
                <label>Priority</label>
                <select name="priority" value={form.priority||'Normal'} onChange={h}>
                  {['Low','Normal','High'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={h}>
                  <option>Available</option><option>Suspended</option>
                </select>
              </div>
              <div className="field">
                <label>Times Done</label>
                <input name="count" type="number" value={form.count} onChange={h} placeholder="0" />
              </div>
            </div>

            <div className="section-title">Additional Notes</div>
            <div className="field">
              <label>Tech Notes</label>
              <textarea name="techNotes" value={form.techNotes||''} onChange={h} rows={2} placeholder="Instructions for technician..." />
            </div>

            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={save}>{editId ? 'Update' : 'Save'} Service</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <div className="overlay" onClick={e => e.target===e.currentTarget && setViewModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">🔧 {viewModal.name}</div>
              <button className="modal-close" onClick={() => setViewModal(null)}>×</button>
            </div>
            <span className={`badge ${CAT_C[viewModal.category]||'bg-muted'}`} style={{ marginBottom:14, display:'inline-flex' }}>{viewModal.category}</span>
            <p style={{ fontSize:'.86rem', color:'var(--text2)', marginBottom:18, lineHeight:1.6 }}>{viewModal.description}</p>
            <div className="info-grid">
              {[
                { k:'Price',    v:'LKR '+Number(viewModal.price||0).toLocaleString() },
                { k:'Duration', v:viewModal.duration },
                { k:'Priority', v:viewModal.priority||'Normal' },
                { k:'Done',     v:viewModal.count },
                { k:'Warranty', v:viewModal.warranty },
                { k:'Status',   v:viewModal.status },
              ].map(i => (
                <div key={i.k} className="info-item">
                  <span className="info-key">{i.k}</span>
                  <span className="info-val">{i.v||'—'}</span>
                </div>
              ))}
            </div>
            {/* Assigned vehicles list */}
            {(() => {
              const assigned = Array.isArray(viewModal.assignedVehicles) ? viewModal.assignedVehicles : (viewModal.vehicle ? [viewModal.vehicle] : []);
              return assigned.length > 0 ? (
                <div style={{ marginTop:14 }}>
                  <div className="info-key" style={{ marginBottom:6 }}>ASSIGNED VEHICLES ({assigned.length})</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {assigned.map(plate => (
                      <span key={plate} className="badge bg-gold">
                        {vehicleLabel(plate)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
            {viewModal.techNotes && (
              <div className="info-item" style={{ marginTop:14 }}>
                <span className="info-key">Tech Notes</span>
                <span className="info-val">{viewModal.techNotes}</span>
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