import { useState, useEffect, useCallback } from 'react';
import ExportBtn from '../components/Exportbtn';
import { invoiceService, bookingService } from '../utils/api';
import "../style.css";

const ALL_STATUS = ['Unpaid', 'Partial', 'Paid', 'Overdue'];
const STATUS_C   = { Paid:'bg-green', Unpaid:'bg-orange', Partial:'bg-blue', Overdue:'bg-red' };
const EMPTY_INV  = {
  bookingId:'', bookingCode:'',
  customer:'', customerPhone:'',
  vehicle:'', plate:'', service:'',
  date: new Date().toISOString().slice(0,10),
  dueDate:'', total:'', paid:'0',
  status:'Unpaid', notes:'',
};

const fmt  = n => 'LKR ' + Number(n||0).toLocaleString();
const fmtK = n => { const v=Number(n||0); return v>=1000?`LKR ${(v/1000).toFixed(1)}K`:`LKR ${v}`; };

export default function InvoicePayment() {
  const [invoices,      setInvoices]      = useState([]);
  const [bookings,      setBookings]      = useState([]);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('All');
  const [modal,         setModal]         = useState(false);
  const [viewModal,     setViewModal]     = useState(null);
  const [form,          setForm]          = useState(EMPTY_INV);
  const [editId,        setEditId]        = useState(null);
  const [toast,         setToast]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [step,          setStep]          = useState('pick');
  const [bookingSearch, setBookingSearch] = useState('');

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),2500); };
  const h = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, bk] = await Promise.all([
        invoiceService.getAll(),
        bookingService.getAll(),
      ]);

      // Auto-create invoices for Completed bookings with no invoice
      const invoicedIds = new Set(inv.map(i=>String(i.bookingId)).filter(Boolean));
      const missing = bk.filter(b =>
        b.status==='Completed' && b.id && !invoicedIds.has(String(b.id))
      );

      let finalInv = inv;
      if (missing.length > 0) {
        const today  = new Date().toISOString().slice(0,10);
        const due    = new Date(); due.setDate(due.getDate()+14);
        const dueStr = due.toISOString().slice(0,10);
        await Promise.all(missing.map(b => invoiceService.create({
          bookingId:b.id, bookingCode:b.bookingCode||'',
          customer:b.customer||'', customerPhone:b.customerPhone||'',
          vehicle:b.vehicle||'', plate:b.plate||'', service:b.service||'',
          date:today, dueDate:dueStr,
          total:b.amount||'0', paid:'0', status:'Unpaid',
          notes:'Auto-generated from completed booking',
        })));
        finalInv = await invoiceService.getAll();
        setToast(`🧾 ${missing.length} invoice${missing.length>1?'s':''} auto-generated`);
        setTimeout(()=>setToast(''),3000);
      }

      setInvoices(finalInv);
      setBookings(bk.filter(b=>['Approved','In Progress','Completed'].includes(b.status)));
    } catch(err){ console.error(err); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ loadAll(); },[loadAll]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalInvoiced    = invoices.reduce((a,i)=>a+Number(i.total||0),0);
  const totalCollected   = invoices.reduce((a,i)=>a+Number(i.paid||0),0);
  const totalOutstanding = invoices.filter(i=>i.status!=='Paid').reduce((a,i)=>a+(Number(i.total||0)-Number(i.paid||0)),0);
  const overdueCount     = invoices.filter(i=>i.status==='Overdue').length;

  const filtered = invoices.filter(i=>{
    const q=search.toLowerCase();
    return (
      (i.invoiceCode||'').toLowerCase().includes(q)||
      (i.customer||'').toLowerCase().includes(q)||
      (i.bookingCode||'').toLowerCase().includes(q)
    )&&(statusFilter==='All'||i.status===statusFilter);
  });

  const filteredBookings = bookings.filter(b=>{
    const q=bookingSearch.toLowerCase();
    return (
      (b.bookingCode||'').toLowerCase().includes(q)||
      (b.customer||'').toLowerCase().includes(q)||
      (b.plate||'').toLowerCase().includes(q)
    );
  });

  const invoicedBookingIds = new Set(invoices.map(i=>i.bookingId).filter(Boolean));
  const balanceAmt = () => Math.max(0, Number(form.total||0)-Number(form.paid||0));

  // ── Actions ───────────────────────────────────────────────────────────────
  const openNew = () => {
    setForm(EMPTY_INV); setEditId(null);
    setStep('pick'); setBookingSearch('');
    setModal(true);
  };

  const selectBooking = b => {
    const due=new Date(); due.setDate(due.getDate()+14);
    setForm({
      bookingId:b.id, bookingCode:b.bookingCode||'',
      customer:b.customer||'', customerPhone:b.customerPhone||'',
      vehicle:b.vehicle||'', plate:b.plate||'', service:b.service||'',
      date:new Date().toISOString().slice(0,10),
      dueDate:due.toISOString().slice(0,10),
      total:b.amount||'', paid:'0', status:'Unpaid', notes:'',
    });
    setStep('form');
  };

  const openEdit = inv => {
    setForm({
      ...inv,
      date:    inv.date?.toString().slice(0,10)    || '',
      dueDate: inv.dueDate?.toString().slice(0,10) || '',
    });
    setEditId(inv.id);
    setStep('form');
    setModal(true);
  };

  const save = async () => {
    if(!form.customer||!form.total||!form.date){
      alert('Customer, total and date are required.'); return;
    }
    const total=Number(form.total), paid=Number(form.paid);
    let status='Unpaid';
    if(paid>=total) status='Paid';
    else if(paid>0) status='Partial';
    else if(form.dueDate&&new Date(form.dueDate)<new Date()) status='Overdue';
    const payload={...form,status};
    try{
      if(editId){ await invoiceService.update(editId,payload); showToast('✅ Invoice updated'); }
      else      { await invoiceService.create(payload);        showToast('✅ Invoice created'); }
      setModal(false); loadAll();
    }catch(err){ alert(err.message); }
  };

  const del = async id => {
    if(!confirm('Delete invoice?')) return;
    try{ await invoiceService.delete(id); showToast('🗑 Deleted'); loadAll(); }
    catch(err){ alert(err.message); }
  };

  // ── Generate Invoice (opens new tab) ─────────────────────────────────────
  const generateInvoice = inv => {
    const bal=Number(inv.total||0)-Number(inv.paid||0);
    const sColor=inv.status==='Paid'?'#22c55e':inv.status==='Partial'?'#f59e0b':'#ef4444';
    const bColor=bal>0?'#ef4444':'#22c55e';

    const rows=(inv.service||'').split(',').map(s=>s.trim()).filter(Boolean)
      .map(s=>`<tr>
        <td>${s}</td>
        <td style="color:#888;font-size:12px">${inv.bookingCode||'—'}</td>
        <td style="text-align:right;font-family:monospace;font-weight:600">—</td>
      </tr>`).join('');

    const html=`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Invoice ${inv.invoiceCode||''}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6fb;color:#222;padding:40px 20px}
.page{max-width:720px;margin:auto;background:#fff;border-radius:12px;box-shadow:0 4px 32px rgba(0,0,0,.1);overflow:hidden}
.hdr{background:linear-gradient(135deg,#0d1b4b,#1565C0);padding:36px 40px;display:flex;justify-content:space-between;align-items:flex-start}
.logo{font-size:28px;font-weight:800;letter-spacing:2px;color:#fff}
.logo span{color:#00BCD4}
.logo-sub{font-size:11px;color:rgba(255,255,255,.6);letter-spacing:1px;margin-top:3px}
.meta{text-align:right}
.inv-no{font-size:22px;font-weight:700;color:#00BCD4}
.inv-d{font-size:12px;color:rgba(255,255,255,.7);margin-top:4px}
.badge{display:inline-block;padding:3px 14px;border-radius:20px;font-size:11px;font-weight:700;margin-top:6px;background:${sColor};color:#fff}
.body{padding:36px 40px}
.gr{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
.ib h4{font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.ib p{font-size:14px;color:#222;line-height:1.7}
.ib strong{color:#0d1b4b}
.div{height:1px;background:#e8ecf0;margin:0 0 24px}
table{width:100%;border-collapse:collapse}
thead{background:#f0f4ff}
thead th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#1565C0;text-transform:uppercase;letter-spacing:.8px}
tbody td{padding:12px 14px;font-size:13.5px;border-bottom:1px solid #f0f0f0}
.tot{background:#f8faff;border-top:2px solid #e0e8ff}
.tot td{padding:10px 14px;font-size:13.5px}
.lbl{color:#555}
.val{text-align:right;font-weight:600;font-family:monospace;font-size:14px}
.grd{background:#0d1b4b}
.grd td{color:#fff;font-size:15px;font-weight:700;padding:13px 14px}
.grd .val{color:#00BCD4}
.bal{color:${bColor};font-weight:700;text-align:right;font-family:monospace}
.note{margin-top:20px;padding:12px 16px;background:#f8faff;border-radius:8px;border-left:3px solid #1565C0;font-size:13px;color:#555}
.ftr{background:#f8faff;padding:20px 40px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e8ecf0}
.ftr-n{font-size:11.5px;color:#888;line-height:1.6}
.ftr-b{font-size:13px;font-weight:700;color:#1565C0}
.pbtn{display:block;margin:24px auto 0;padding:12px 36px;background:#1565C0;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer}
.pbtn:hover{background:#0d47a1}
@media print{body{background:#fff;padding:0}.page{box-shadow:none;border-radius:0}.pbtn{display:none}}
</style></head><body>
<div class="page">
  <div class="hdr">
    <div><div class="logo">Auto<span>Serve</span></div><div class="logo-sub">Vehicle Service Management System</div></div>
    <div class="meta">
      <div class="inv-no">${inv.invoiceCode||'INV-XXXX'}</div>
      <div class="inv-d">Date: ${inv.date||'—'}</div>
      <div class="inv-d">Due:  ${inv.dueDate||'—'}</div>
      <div class="badge">${inv.status}</div>
    </div>
  </div>
  <div class="body">
    <div class="gr">
      <div class="ib"><h4>Bill To</h4><p><strong>${inv.customer||'—'}</strong><br/>${inv.customerPhone||''}</p></div>
      <div class="ib"><h4>Vehicle</h4><p><strong>${inv.vehicle||'—'}</strong><br/>Plate: <strong>${inv.plate||'—'}</strong></p></div>
    </div>
    <div class="div"></div>
    <table>
      <thead><tr><th>Description</th><th>Booking Ref</th><th style="text-align:right">Amount (LKR)</th></tr></thead>
      <tbody>${rows}</tbody>
      <tbody class="tot">
        <tr><td class="lbl" colspan="2">Subtotal</td><td class="val">LKR ${Number(inv.total||0).toLocaleString()}</td></tr>
        <tr><td class="lbl" colspan="2">Amount Paid</td><td class="val" style="color:#22c55e">LKR ${Number(inv.paid||0).toLocaleString()}</td></tr>
        <tr><td class="lbl" colspan="2" style="font-weight:700">Balance Due</td><td class="bal">LKR ${bal.toLocaleString()}</td></tr>
      </tbody>
      <tbody><tr class="grd"><td colspan="2">TOTAL</td><td class="val">LKR ${Number(inv.total||0).toLocaleString()}</td></tr></tbody>
    </table>
    ${inv.notes?`<div class="note"><strong>Note:</strong> ${inv.notes}</div>`:''}
  </div>
  <div class="ftr">
    <div class="ftr-n">Payment due by <strong>${inv.dueDate||'—'}</strong><br/>Thank you for choosing AutoServe!</div>
    <div class="ftr-b">AutoServe — Professional Vehicle Care</div>
  </div>
</div>
<button class="pbtn" onclick="window.print()">🖨 Print / Save as PDF</button>
</body></html>`;

    const win=window.open('','_blank');
    if(win){ win.document.write(html); win.document.close(); }
  };

  const exportData=filtered.map(i=>({
    'Invoice':i.invoiceCode,'Customer':i.customer,'Vehicle':i.vehicle,
    'Plate':i.plate,'Service':i.service,'Booking Ref':i.bookingCode,
    'Date':i.date,'Due Date':i.dueDate,
    'Total (LKR)':i.total,'Paid (LKR)':i.paid,
    'Balance':Number(i.total||0)-Number(i.paid||0),'Status':i.status,
  }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Invoice &amp; Payment</div>
          <div className="page-sub">{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <div className="page-actions">
          <ExportBtn data={exportData} filename="invoices-export" title="Invoice & Payment Report"/>
          <button className="btn btn-accent" onClick={openNew}>＋ New Invoice</button>
        </div>
      </div>

      <div className="stats-row stats-4">
        {[
          {icon:'💰',val:fmtK(totalInvoiced),   label:'Total Invoiced',color:'sc-gold'  },
          {icon:'✅',val:fmtK(totalCollected),  label:'Collected',     color:'sc-green' },
          {icon:'⌛',val:fmtK(totalOutstanding),label:'Outstanding',   color:'sc-orange'},
          {icon:'🔴',val:overdueCount,           label:'Overdue',       color:'sc-red'   },
        ].map(s=>(
          <div key={s.label} className={`stat-card ${s.color}`}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="tcard">
        <div className="tcard-bar">
          <div className="tcard-title">🧾 Invoice Ledger</div>
          <div className="tbar-right">
            <div className="search-wrap">
              <input className="search-box" placeholder="Invoice / Customer / Booking..."
                value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="filt-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              {['All',...ALL_STATUS].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading
          ? <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">Loading invoices...</div></div>
          : (
          <div className="tscroll">
            <table>
              <thead><tr>{['Invoice','Customer','Vehicle','Service','Date','Total','Paid','Balance','Status','Actions'].map(c=><th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {filtered.map(inv=>{
                  const bal=Number(inv.total||0)-Number(inv.paid||0);
                  return (
                    <tr key={inv.id}>
                      <td>
                        <span className="mono text-accent" style={{fontSize:'.78rem',fontWeight:700}}>{inv.invoiceCode}</span>
                        {inv.bookingCode&&<div style={{fontSize:'.72rem',color:'var(--text2)'}}>Ref: {inv.bookingCode}</div>}
                      </td>
                      <td><div className="text-bold">{inv.customer}</div><div style={{fontSize:'.76rem',color:'var(--text2)'}}>{inv.customerPhone}</div></td>
                      <td><div style={{fontSize:'.83rem'}}>{inv.vehicle}</div><span className="mono" style={{fontSize:'.74rem',color:'var(--accent)'}}>{inv.plate}</span></td>
                      <td style={{fontSize:'.82rem',maxWidth:160}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inv.service}</div></td>
                      <td style={{fontSize:'.82rem'}}>{inv.date}</td>
                      <td><span className="mono text-accent" style={{fontWeight:700}}>LKR {Number(inv.total||0).toLocaleString()}</span></td>
                      <td><span className="mono text-green" style={{fontWeight:700}}>LKR {Number(inv.paid||0).toLocaleString()}</span></td>
                      <td><span className="mono" style={{fontWeight:700,color:bal>0?'var(--red)':'var(--green)'}}>LKR {bal.toLocaleString()}</span></td>
                      <td><span className={`badge ${STATUS_C[inv.status]||'bg-muted'}`}>{inv.status}</span></td>
                      <td>
                        <div style={{display:'flex',gap:4}}>
                          <button className="btn btn-blue btn-xs" onClick={()=>setViewModal(inv)}>👁</button>
                          <button className="btn btn-outline btn-xs" title="Generate PDF" onClick={()=>generateInvoice(inv)}>📄</button>
                          <button className="btn btn-outline btn-xs" onClick={()=>openEdit(inv)}>✏️</button>
                          <button className="btn btn-danger btn-xs" onClick={()=>del(inv.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0&&<tr><td colSpan={10}><div className="empty-state"><div className="empty-icon">🧾</div><div className="empty-text">No invoices found</div></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="tfoot">
          <span>{filtered.length} of {invoices.length} invoices</span>
          <span>Total: LKR {filtered.reduce((a,i)=>a+Number(i.total||0),0).toLocaleString()}</span>
        </div>
      </div>

      {/* ── MODAL ─────────────────────────────────────────────────────────── */}
      {modal&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal modal-lg">

            {step==='pick'&&(
              <>
                <div className="modal-head">
                  <div className="modal-title">＋ New Invoice — Select Booking</div>
                  <button className="modal-close" onClick={()=>setModal(false)}>×</button>
                </div>
                <div className="search-wrap" style={{marginBottom:14}}>
                  <input className="search-box" style={{width:'100%'}}
                    placeholder="Search booking ID / customer / plate..."
                    value={bookingSearch} onChange={e=>setBookingSearch(e.target.value)} autoFocus/>
                </div>
                <div style={{maxHeight:380,overflowY:'auto',borderRadius:'var(--r)',border:'1px solid var(--border)'}}>
                  {filteredBookings.length===0
                    ?<div className="empty-state" style={{padding:'30px 20px'}}><div className="empty-icon">📅</div><div className="empty-text">No eligible bookings</div></div>
                    :filteredBookings.map(b=>{
                      const already=invoicedBookingIds.has(b.id);
                      return(
                        <div key={b.id}
                          onClick={()=>!already&&selectBooking(b)}
                          style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',
                            display:'flex',justifyContent:'space-between',alignItems:'center',
                            cursor:already?'not-allowed':'pointer',opacity:already?.45:1,transition:'background .12s'}}
                          onMouseEnter={e=>{if(!already)e.currentTarget.style.background='var(--surface2)';}}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                              <span className="mono text-accent" style={{fontWeight:700,fontSize:'.82rem'}}>{b.bookingCode}</span>
                              <span className={`badge ${b.status==='Completed'?'bg-green':b.status==='In Progress'?'bg-cyan':'bg-blue'}`} style={{fontSize:'.65rem'}}>{b.status}</span>
                              {already&&<span className="badge bg-muted" style={{fontSize:'.65rem'}}>Already invoiced</span>}
                            </div>
                            <div style={{fontSize:'.85rem',fontWeight:600,color:'var(--text)',marginBottom:2}}>{b.customer}</div>
                            <div style={{fontSize:'.78rem',color:'var(--text2)',display:'flex',gap:12}}>
                              <span>🚗 {b.vehicle}</span>
                              <span className="mono" style={{color:'var(--accent)'}}>{b.plate}</span>
                              <span>🔧 {b.service}</span>
                            </div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0,marginLeft:16}}>
                            {b.amount&&<div className="mono text-accent" style={{fontWeight:700,fontSize:'.9rem',marginBottom:3}}>LKR {Number(b.amount).toLocaleString()}</div>}
                            <div style={{fontSize:'.76rem',color:'var(--text2)'}}>{b.date}</div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
                <div style={{marginTop:14,textAlign:'center'}}>
                  <button className="btn btn-outline btn-sm" onClick={()=>{setForm(EMPTY_INV);setStep('form');}}>
                    Create invoice without booking
                  </button>
                </div>
                <div className="modal-foot">
                  <button className="btn btn-outline" onClick={()=>setModal(false)}>Cancel</button>
                </div>
              </>
            )}

            {step==='form'&&(
              <>
                <div className="modal-head">
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {!editId&&<button className="btn btn-outline btn-sm" onClick={()=>setStep('pick')} style={{padding:'4px 10px',fontSize:'.78rem'}}>← Back</button>}
                    <div className="modal-title">{editId?'✏️ Edit Invoice':'＋ New Invoice'}</div>
                  </div>
                  <button className="modal-close" onClick={()=>setModal(false)}>×</button>
                </div>

                {form.bookingCode&&(
                  <div className="alert-box alert-info" style={{marginBottom:12,fontSize:'.82rem'}}>
                    📅 Booking: <strong className="mono">{form.bookingCode}</strong> — {form.service}
                  </div>
                )}

                <div className="form-row">
                  <div className="field"><label>Customer *</label><input name="customer" value={form.customer} onChange={h} placeholder="Customer name"/></div>
                  <div className="field"><label>Phone</label><input name="customerPhone" value={form.customerPhone} onChange={h} placeholder="07X-XXXXXXX"/></div>
                </div>
                <div className="form-row">
                  <div className="field"><label>Vehicle</label><input name="vehicle" value={form.vehicle} onChange={h} placeholder="e.g. Toyota Camry"/></div>
                  <div className="field"><label>Plate No.</label><input name="plate" value={form.plate} onChange={h} placeholder="CAB-1234"/></div>
                </div>
                <div className="field"><label>Service</label><input name="service" value={form.service} onChange={h} placeholder="Service performed"/></div>
                <div className="form-row">
                  <div className="field"><label>Invoice Date *</label><input name="date" type="date" value={form.date} onChange={h}/></div>
                  <div className="field"><label>Due Date</label><input name="dueDate" type="date" value={form.dueDate} onChange={h}/></div>
                </div>
                <div className="form-row">
                  <div className="field"><label>Total Amount (LKR) *</label><input name="total" type="number" value={form.total} onChange={h} placeholder="0"/></div>
                  <div className="field"><label>Amount Paid (LKR)</label><input name="paid" type="number" value={form.paid} onChange={h} placeholder="0"/></div>
                </div>

                {form.total&&(
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                    background:'var(--surface2)',borderRadius:'var(--r)',
                    padding:'10px 14px',marginBottom:14,fontSize:'.86rem'}}>
                    <span style={{color:'var(--text2)'}}>Balance remaining:</span>
                    <span className="mono" style={{fontWeight:700,fontSize:'1rem',
                      color:balanceAmt()>0?'var(--red)':'var(--green)'}}>
                      LKR {balanceAmt().toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="form-row">
                  <div className="field">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={h}>
                      {ALL_STATUS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Notes</label><input name="notes" value={form.notes} onChange={h} placeholder="Payment notes..."/></div>
                </div>

                <div className="modal-foot">
                  <button className="btn btn-outline" onClick={()=>setModal(false)}>Cancel</button>
                  <button className="btn btn-accent" onClick={save}>{editId?'Update':'Create'} Invoice</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModal&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setViewModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">🧾 {viewModal.invoiceCode}</div>
              <button className="modal-close" onClick={()=>setViewModal(null)}>×</button>
            </div>
            <div style={{marginBottom:14,display:'flex',gap:8,alignItems:'center'}}>
              <span className={`badge ${STATUS_C[viewModal.status]||'bg-muted'}`}>{viewModal.status}</span>
              {viewModal.bookingCode&&<span className="badge bg-blue" style={{fontSize:'.68rem'}}>Booking: {viewModal.bookingCode}</span>}
            </div>
            <div className="info-grid">
              {[
                {k:'Customer',    v:viewModal.customer},
                {k:'Phone',       v:viewModal.customerPhone},
                {k:'Vehicle',     v:viewModal.vehicle},
                {k:'Plate',       v:viewModal.plate},
                {k:'Service',     v:viewModal.service},
                {k:'Invoice Date',v:viewModal.date},
                {k:'Due Date',    v:viewModal.dueDate},
                {k:'Total',       v:fmt(viewModal.total)},
                {k:'Paid',        v:fmt(viewModal.paid)},
                {k:'Balance',     v:fmt(Number(viewModal.total||0)-Number(viewModal.paid||0))},
              ].map(i=>(
                <div key={i.k} className="info-item">
                  <span className="info-key">{i.k}</span>
                  <span className="info-val">{i.v||'—'}</span>
                </div>
              ))}
            </div>
            {viewModal.notes&&(
              <div style={{marginTop:14,padding:'10px 14px',background:'var(--surface2)',borderRadius:'var(--r)',fontSize:'.84rem'}}>
                <strong>Notes: </strong>{viewModal.notes}
              </div>
            )}
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={()=>setViewModal(null)}>Close</button>
              <button className="btn btn-blue" onClick={()=>generateInvoice(viewModal)}>📄 Generate Invoice</button>
              <button className="btn btn-accent" onClick={()=>{openEdit(viewModal);setViewModal(null);}}>✏️ Edit</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="toast-stack"><div className="toast toast-success">{toast}</div></div>}
    </div>
  );
}