import { useState, useEffect, useCallback } from 'react';
import ExportBtn from '../components/Exportbtn';
import { feedbackService, customerService, garageService, servicesCatalogService } from '../utils/api';
import "../style.css";

// ── Mock data fallback 
const MOCK_CUSTOMERS = [
  { id:1, fullName:'Nimal Perera',    phone:'0771234567' },
  { id:2, fullName:'Kamal Silva',     phone:'0772345678' },
  { id:3, fullName:'Sunil Fernando',  phone:'0773456789' },
  { id:4, fullName:'Chamara Bandara', phone:'0774567890' },
  { id:5, fullName:'Ravi Jayasena',   phone:'0775678901' },
  { id:6, fullName:'Dilshan Perera',  phone:'0776789012' },
  { id:7, fullName:'Thilak Kumara',   phone:'0777890123' },
  { id:8, fullName:'Priya Madhavi',   phone:'0778901234' },
];

const MOCK_GARAGES = [
  { id:1, businessName:'AutoFix Garage',     garageAddress:'Colombo 03', services:['Oil Change','Full Service','Brake Inspection'] },
  { id:2, businessName:'Speed Auto Center',  garageAddress:'Nugegoda',   services:['Tyre Rotation','Wheel Alignment','AC Repair'] },
  { id:3, businessName:'City Motors',        garageAddress:'Kandy',      services:['Engine Diagnostic','Battery Check','Full Service'] },
  { id:4, businessName:'Lanka Auto Service', garageAddress:'Gampaha',    services:['Oil Change','Tyre Replacement','Suspension Check'] },
];

const EMPTY = { customer:'', garageId:'', garage:'', service:'', rating:5, comment:'', date:'' };
const STARS = n => '★'.repeat(n) + '☆'.repeat(5-n);
const STATUS_CLASS = { Approved:'bg-green', Pending:'bg-orange', Escalated:'bg-red' };

const StarPicker = ({ value, onChange }) => (
  <div style={{ display:'flex', gap:6 }}>
    {[1,2,3,4,5].map(i => (
      <button key={i} type="button" onClick={() => onChange(i)} style={{
        background:'none', border:'none', cursor:'pointer', fontSize:28, lineHeight:1,
        color: i <= value ? '#ffc83c' : 'var(--border2)',
        transform: i <= value ? 'scale(1.15)' : 'scale(1)',
        transition:'color 0.15s, transform 0.1s',
      }}>★</button>
    ))}
  </div>
);

const RatingBar = ({ label, count, total, color }) => {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:7 }}>
      <span style={{ fontSize:'.78rem', color:'var(--text2)', minWidth:16, textAlign:'right' }}>{label}★</span>
      <div style={{ flex:1, height:8, background:'var(--surface2)', borderRadius:99, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:99, transition:'width .4s' }} />
      </div>
      <span style={{ fontSize:'.75rem', color:'var(--text3)', minWidth:28, textAlign:'right' }}>{count}</span>
    </div>
  );
};

export default function Feedback() {
  const [data,           setData]          = useState([]);
  const [customers,      setCustomers]     = useState(MOCK_CUSTOMERS);
  const [garages,        setGarages]       = useState(MOCK_GARAGES);
  const [garageServices, setGarageServices]= useState([]);
  const [search,         setSearch]        = useState('');
  const [statusFilt,     setStatusFilt]    = useState('All');
  const [ratingFilt,     setRatingFilt]    = useState('All');
  const [modal,          setModal]         = useState(false);
  const [viewModal,      setViewModal]     = useState(null);
  const [replyModal,     setReplyModal]    = useState(null);
  const [replyText,      setReplyText]     = useState('');
  const [form,           setForm]          = useState(EMPTY);
  const [errors,         setErrors]        = useState({});
  const [toast,          setToast]         = useState('');
  const [loading,        setLoading]       = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const h = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]:'' }));
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      // Feedback 
      const f = await feedbackService.getAll();
      setData(f);
    } catch (err) { console.error('Feedback load error:', err); }

    // Customers 
    try {
      const c = await customerService.getAll();
      if (c && c.length > 0) setCustomers(c);
    } catch { /* mock data already set */ }

    // Garages 
    try {
      const g = await garageService.getAll();
      if (g && g.length > 0) setGarages(g);
    } catch { /* mock data already set */ }

    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Garage 
  const handleGarageChange = async e => {
    const garageId = e.target.value;
    const found = garages.find(g => String(g.id) === String(garageId));
    const garageName = found?.businessName || found?.name || '';
    setForm(f => ({ ...f, garageId, garage: garageName, service: '' }));
    setErrors(err => ({ ...err, garage:'' }));

    if (garageId) {
      // Mock services 
      const mockServices = found?.services || [];
      if (mockServices.length > 0) {
        setGarageServices(mockServices.map((s, i) => ({ id: i, name: s })));
      } else {
        try {
          const svcList = await garageService.getServices(garageId);
          setGarageServices(svcList);
        } catch {
          try {
            const all = await servicesCatalogService.getAll();
            setGarageServices(all);
          } catch {
            setGarageServices([]);
          }
        }
      }
    } else {
      setGarageServices([]);
    }
  };

  const filtered = data.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = (
      (f.customer||'').toLowerCase().includes(q) ||
      (f.garage||'').toLowerCase().includes(q)   ||
      (f.service||'').toLowerCase().includes(q)  ||
      (f.comment||'').toLowerCase().includes(q)
    );
    const matchStatus = statusFilt === 'All' || f.status === statusFilt;
    const matchRating = ratingFilt === 'All' || f.rating === Number(ratingFilt);
    return matchSearch && matchStatus && matchRating;
  });

  const avgRating = data.length
    ? (data.reduce((a, f) => a + f.rating, 0) / data.length).toFixed(1)
    : '0.0';

  const ratingDist = [5,4,3,2,1].map(n => ({
    n,
    count: data.filter(f => f.rating === n).length,
    color: n >= 4 ? 'var(--green)' : n === 3 ? 'var(--amber)' : 'var(--red)',
  }));

  const openAdd = () => {
    setForm({ ...EMPTY, date: new Date().toISOString().slice(0,10) });
    setGarageServices([]);
    setErrors({});
    setModal(true);
  };

  const save = async () => {
    const e = {};
    if (!form.customer) e.customer = 'Please select a customer.';
    if (!form.garage)   e.garage   = 'Please select a garage.';
    if (!form.comment)  e.comment  = 'Comment is required.';
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      await feedbackService.create({ ...form, rating: Number(form.rating) });
      showToast('✅ Feedback submitted');
      setModal(false);
      loadAll();
    } catch (err) { alert(err.message); }
  };

  const approve  = async id => { try { await feedbackService.updateStatus(id,'Approved');  showToast('✅ Approved');  loadAll(); } catch(err){ alert(err.message); }};
  const escalate = async id => { try { await feedbackService.updateStatus(id,'Escalated'); showToast('⚠️ Escalated'); loadAll(); } catch(err){ alert(err.message); }};
  const remove   = async id => {
    if (!confirm('Delete this feedback?')) return;
    try { await feedbackService.delete(id); showToast('🗑 Deleted'); loadAll(); }
    catch(err){ alert(err.message); }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    try {
      await feedbackService.updateStatus(replyModal.id, 'Approved');
      showToast('💬 Reply sent & approved');
      setReplyModal(null);
      setReplyText('');
      loadAll();
    } catch(err){ alert(err.message); }
  };

  const exportData = filtered.map(f => ({
    ID: f.feedbackCode, Customer: f.customer, Garage: f.garage,
    Service: f.service, Rating: f.rating, Comment: f.comment,
    Date: f.date, Status: f.status,
  }));

  const starColor = r => r >= 4 ? '#ffc83c' : r === 3 ? '#fb923c' : '#ff5370';

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Feedback &amp; Reviews</div>
          <div className="page-sub">Monitor customer satisfaction and manage reviews</div>
        </div>
        <div className="page-actions">
          <ExportBtn data={exportData} filename="feedback-export" title="Feedback Report" />
          <button className="btn btn-accent" onClick={openAdd}>＋ New Feedback</button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-row stats-4">
        {[
          { icon:'💬', label:'Total Reviews', val: data.length,                                    color:'sc-blue'   },
          { icon:'⭐', label:'Avg Rating',     val: `${avgRating} ★`,                             color:'sc-gold'   },
          { icon:'✅', label:'Approved',       val: data.filter(f=>f.status==='Approved').length,  color:'sc-green'  },
          { icon:'⚠️', label:'Escalated',      val: data.filter(f=>f.status==='Escalated').length, color:'sc-red'    },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Summary Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:22 }}>
        <div className="dash-card">
          <div className="dash-card-head">
            <div><h3>⭐ Rating Distribution</h3><p>Breakdown of all customer ratings</p></div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'2.5rem', fontWeight:900, color:'#ffc83c', lineHeight:1 }}>{avgRating}</div>
              <div style={{ fontSize:'.7rem', color:'var(--text3)', marginTop:2 }}>out of 5.0</div>
            </div>
          </div>
          {ratingDist.map(r => (
            <RatingBar key={r.n} label={r.n} count={r.count} total={data.length} color={r.color} />
          ))}
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <div><h3>🏪 Garage Ratings</h3><p>Average ratings per garage</p></div>
          </div>
          {garages.map(g => {
            const gName = g.businessName || g.name || '';
            const gData = data.filter(f => f.garage === gName);
            if (!gData.length) return (
              <div key={g.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize:'.84rem', color:'var(--text2)', fontWeight:600 }}>{gName}</div>
                  <div style={{ fontSize:'.72rem', color:'var(--text3)' }}>{g.garageAddress || ''}</div>
                </div>
                <span style={{ fontSize:'.75rem', color:'var(--text3)' }}>No reviews</span>
              </div>
            );
            const avg = (gData.reduce((a,f) => a + f.rating, 0) / gData.length).toFixed(1);
            return (
              <div key={g.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize:'.84rem', color:'var(--text2)', fontWeight:600 }}>{gName}</div>
                  <div style={{ fontSize:'.72rem', color:'var(--text3)' }}>{g.garageAddress || ''}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:'.75rem', color:'var(--text3)' }}>{gData.length} reviews</span>
                  <span style={{ fontSize:'.82rem', color:'#ffc83c', fontWeight:700 }}>★ {avg}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="tcard">
        <div className="tcard-bar">
          <div className="tcard-title">💬 All Feedback</div>
          <div className="tbar-right">
            <div className="search-wrap">
              <input className="search-box" placeholder="Search customer / garage..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filt-select" value={ratingFilt} onChange={e => setRatingFilt(e.target.value)}>
              <option value="All">All Ratings</option>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
            <select className="filt-select" value={statusFilt} onChange={e => setStatusFilt(e.target.value)}>
              {['All','Pending','Approved','Escalated'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">Loading...</div></div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr>{['Customer','Garage','Service','Rating','Comment','Date','Status','Actions'].map(col => <th key={col}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:'36px', color:'var(--text3)' }}>💬 No feedback found</td></tr>
                ) : filtered.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--indigo),var(--violet))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'.78rem', flexShrink:0 }}>
                          {(f.customer||'?')[0]}
                        </div>
                        <span className="text-bold">{f.customer}</span>
                      </div>
                    </td>
                    <td><span className="badge bg-purple">{f.garage || '—'}</span></td>
                    <td><span className="badge bg-blue">{f.service || '—'}</span></td>
                    <td>
                      <span style={{ color: starColor(f.rating), fontWeight:700, fontSize:'1rem', letterSpacing:1 }}>{STARS(f.rating)}</span>
                      <span className="text-muted" style={{ fontSize:'.72rem', marginLeft:4 }}>({f.rating}/5)</span>
                    </td>
                    <td style={{ maxWidth:200, fontSize:'.82rem', color:'var(--text2)' }}>
                      {(f.comment||'').length > 55 ? f.comment.slice(0,55)+'…' : f.comment}
                    </td>
                    <td className="text-muted" style={{ fontSize:'.81rem' }}>{f.date}</td>
                    <td><span className={`badge ${STATUS_CLASS[f.status]||'bg-muted'}`}>{f.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:5 }}>
                        <button className="btn btn-blue btn-xs"    onClick={() => setViewModal(f)}>👁</button>
                        <button className="btn btn-outline btn-xs" onClick={() => { setReplyModal(f); setReplyText(''); }}>💬</button>
                        {f.status === 'Pending' && <>
                          <button className="btn btn-outline btn-xs" onClick={() => approve(f.id)}>✓</button>
                          <button className="btn btn-danger btn-xs"  onClick={() => escalate(f.id)}>↑</button>
                        </>}
                        <button className="btn btn-danger btn-xs" onClick={() => remove(f.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="tfoot">
          <span>{filtered.length} of {data.length} reviews</span>
          <span>Average: <strong style={{ color:'#ffc83c' }}>{avgRating} ⭐</strong></span>
        </div>
      </div>

      {/* ── New Feedback Modal ── */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">＋ New Feedback</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            <div className="form-row">
              {/* Customer Dropdown */}
              <div className="field">
                <label>Customer *</label>
                <select name="customer" value={form.customer} onChange={h}>
                  <option value="">— Select customer —</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.fullName}>
                      {c.fullName}{c.phone ? ` · ${c.phone}` : ''}
                    </option>
                  ))}
                </select>
                {errors.customer && <span style={{ color:'var(--red)', fontSize:'.78rem' }}>{errors.customer}</span>}
              </div>

              {/* Garage Dropdown */}
              <div className="field">
                <label>Garage *</label>
                <select name="garageId" value={form.garageId} onChange={handleGarageChange}>
                  <option value="">— Select garage —</option>
                  {garages.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.businessName || g.name} {g.garageAddress ? `· ${g.garageAddress}` : ''}
                    </option>
                  ))}
                </select>
                {errors.garage && <span style={{ color:'var(--red)', fontSize:'.78rem' }}>{errors.garage}</span>}
              </div>
            </div>

            {/* Garage Services */}
            {form.garageId && garageServices.length > 0 && (
              <div className="field">
                <label>Service</label>
                <select name="service" value={form.service} onChange={h}>
                  <option value="">— Select service —</option>
                  {garageServices.map((s, i) => {
                    const label = s.name || s.serviceName || s.title || s;
                    return <option key={s.id || i} value={label}>{label}</option>;
                  })}
                </select>
              </div>
            )}

            {/* Rating */}
            <div className="field">
              <label>Rating</label>
              <StarPicker value={Number(form.rating)} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>

            {/* Date */}
            <div className="field">
              <label>Date</label>
              <input name="date" type="date" value={form.date} onChange={h} />
            </div>

            {/* Comment */}
            <div className="field">
              <label>Comment *</label>
              <textarea name="comment" value={form.comment} onChange={h} rows={4} placeholder="Write feedback here…" />
              {errors.comment && <span style={{ color:'var(--red)', fontSize:'.78rem' }}>{errors.comment}</span>}
            </div>

            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={save}>Submit Feedback</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setViewModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">💬 Feedback Detail</div>
              <button className="modal-close" onClick={() => setViewModal(null)}>×</button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,var(--indigo),var(--violet))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1.3rem' }}>
                {(viewModal.customer||'?')[0]}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:'1.05rem' }}>{viewModal.customer}</div>
                <span className={`badge ${STATUS_CLASS[viewModal.status]||'bg-muted'}`}>{viewModal.status}</span>
              </div>
            </div>
            <div className="info-grid">
              {[
                { k:'Feedback ID', v: viewModal.feedbackCode },
                { k:'Garage',      v: viewModal.garage },
                { k:'Service',     v: viewModal.service },
                { k:'Rating',      v: `${STARS(viewModal.rating)} (${viewModal.rating}/5)` },
                { k:'Date',        v: viewModal.date },
                { k:'Status',      v: viewModal.status },
              ].map(i => (
                <div key={i.k} className="info-item">
                  <span className="info-key">{i.k}</span>
                  <span className="info-val">{i.v||'—'}</span>
                </div>
              ))}
              <div className="info-item" style={{ gridColumn:'1/-1' }}>
                <span className="info-key">Comment</span>
                <span className="info-val">{viewModal.comment}</span>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setViewModal(null)}>Close</button>
              <button className="btn btn-blue" onClick={() => { setReplyModal(viewModal); setViewModal(null); setReplyText(''); }}>💬 Reply</button>
              {viewModal.status === 'Pending' && (
                <button className="btn btn-accent" onClick={() => { approve(viewModal.id); setViewModal(null); }}>✓ Approve</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reply Modal ── */}
      {replyModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setReplyModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">💬 Reply to {replyModal.customer}</div>
              <button className="modal-close" onClick={() => setReplyModal(null)}>×</button>
            </div>
            <div style={{ background:'var(--surface2)', borderRadius:'var(--r)', padding:'12px 14px', marginBottom:16, borderLeft:'3px solid var(--indigo)' }}>
              <div style={{ fontSize:'.72rem', color:'var(--text3)', marginBottom:4, textTransform:'uppercase', letterSpacing:'.08em' }}>Original Feedback</div>
              <div style={{ fontSize:'.84rem', color:'var(--text2)', marginBottom:6 }}>{replyModal.comment}</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{ color:'#ffc83c', fontWeight:700 }}>{STARS(replyModal.rating)}</span>
                {replyModal.garage  && <span className="badge bg-purple" style={{ fontSize:'.68rem' }}>{replyModal.garage}</span>}
                {replyModal.service && <span className="badge bg-blue"   style={{ fontSize:'.68rem' }}>{replyModal.service}</span>}
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:'.72rem', color:'var(--text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.08em' }}>Quick Templates</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {[
                  'Thank you for your feedback! We appreciate your kind words.',
                  'We apologize for the inconvenience. We will work to improve.',
                  'Thank you! We are glad you had a great experience.',
                  'We have noted your concern and will address it promptly.',
                ].map((t, i) => (
                  <button key={i} onClick={() => setReplyText(t)}
                    style={{ background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:6, padding:'5px 10px', fontSize:'.72rem', color:'var(--text2)', cursor:'pointer' }}>
                    Template {i+1}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Your Reply *</label>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={4} placeholder="Write your reply here…" />
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setReplyModal(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={submitReply} disabled={!replyText.trim()}>Send Reply</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-stack"><div className="toast toast-success">{toast}</div></div>}
    </div>
  );
}