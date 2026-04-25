import { useState, useEffect, useCallback } from 'react';
import ExportBtn from '../components/Exportbtn';
import { servicesCatalogService, vehicleService } from '../utils/api';
import "../style.css";

const STAGES  = ['Vehicle Received','In Service','Quality Check','Ready for Pickup'];
const STAGE_C = { 'Vehicle Received':'bg-orange','In Service':'bg-blue','Quality Check':'bg-purple','Ready for Pickup':'bg-green' };
const CATS    = ['Routine Maintenance','Repairs','Emergency Services'];
const CAT_C   = { 'Routine Maintenance':'bg-blue','Repairs':'bg-orange','Emergency Services':'bg-red' };
const CAT_ICON = { 'Routine Maintenance':'🔧','Repairs':'🛠','Emergency Services':'🚨' };

const SERVICE_LIST = [
  {
    name:'Oil & Filter Change', category:'Routine Maintenance', duration:'1 hr', price:3500,
    brands:[
      { name:'Castrol GTX',    sizes:[{label:'1L',price:1200},{label:'4L',price:4200},{label:'5L',price:5100}] },
      { name:'Mobil Super',    sizes:[{label:'1L',price:1350},{label:'4L',price:4800},{label:'5L',price:5800}] },
      { name:'Shell Helix',   sizes:[{label:'1L',price:1400},{label:'4L',price:5000},{label:'5L',price:6000}] },
      { name:'Total Quartz',  sizes:[{label:'1L',price:1100},{label:'4L',price:3900},{label:'5L',price:4700}] },
      { name:'Liqui Moly',    sizes:[{label:'1L',price:1800},{label:'4L',price:6500},{label:'5L',price:7800}] },
      { name:'Caltex Havoline',sizes:[{label:'1L',price:1050},{label:'4L',price:3700},{label:'5L',price:4500}] },
    ],
  },
  {
    name:'Full Service', category:'Routine Maintenance', duration:'1 day', price:15000,
    brands:[
      { name:'Castrol Package', sizes:[{label:'Standard',price:15000},{label:'Premium',price:22000}] },
      { name:'Mobil Package',   sizes:[{label:'Standard',price:16000},{label:'Premium',price:24000}] },
      { name:'Shell Package',   sizes:[{label:'Standard',price:17000},{label:'Premium',price:25000}] },
      { name:'Total Package',   sizes:[{label:'Standard',price:14000},{label:'Premium',price:21000}] },
    ],
  },
  {
    name:'Tyre Rotation & Balance', category:'Routine Maintenance', duration:'1.5 hrs', price:4500,
    brands:[
      { name:'MRF',         sizes:[{label:'165/70R13',price:8500},{label:'185/65R14',price:10500},{label:'195/65R15',price:12500},{label:'205/55R16',price:14500}] },
      { name:'Apollo',      sizes:[{label:'165/70R13',price:7800},{label:'185/65R14',price:9500},{label:'195/65R15',price:11500},{label:'205/55R16',price:13500}] },
      { name:'Bridgestone', sizes:[{label:'165/70R13',price:12000},{label:'185/65R14',price:14500},{label:'195/65R15',price:17000},{label:'205/55R16',price:20000}] },
      { name:'Michelin',    sizes:[{label:'165/70R13',price:14000},{label:'185/65R14',price:17000},{label:'195/65R15',price:20000},{label:'205/55R16',price:23500}] },
      { name:'Continental', sizes:[{label:'165/70R13',price:13000},{label:'185/65R14',price:15500},{label:'195/65R15',price:18500},{label:'205/55R16',price:22000}] },
      { name:'Ceat',        sizes:[{label:'165/70R13',price:7200},{label:'185/65R14',price:8800},{label:'195/65R15',price:10500},{label:'205/55R16',price:12500}] },
      { name:'Goodyear',    sizes:[{label:'165/70R13',price:11000},{label:'185/65R14',price:13500},{label:'195/65R15',price:16000},{label:'205/55R16',price:19000}] },
      { name:'Falken',      sizes:[{label:'165/70R13',price:9500},{label:'185/65R14',price:11500},{label:'195/65R15',price:13800},{label:'205/55R16',price:16500}] },
    ],
  },
  {
    name:'Wheel Alignment', category:'Routine Maintenance', duration:'1 hr', price:3000,
    brands:[
      { name:'Hunter (4-wheel)',  sizes:[{label:'Sedan',price:3000},{label:'SUV / Van',price:4500}] },
      { name:'Hofmann (4-wheel)', sizes:[{label:'Sedan',price:2800},{label:'SUV / Van',price:4200}] },
      { name:'Bosch (4-wheel)',   sizes:[{label:'Sedan',price:3200},{label:'SUV / Van',price:4800}] },
      { name:'Manual (2-wheel)',  sizes:[{label:'Any',price:1800}] },
    ],
  },
  {
    name:'Battery Check & Replace', category:'Routine Maintenance', duration:'30 min', price:8000,
    brands:[
      { name:'Amaron',   sizes:[{label:'35 Ah',price:12500},{label:'45 Ah',price:15500},{label:'55 Ah',price:18500},{label:'65 Ah',price:22000}] },
      { name:'Exide',    sizes:[{label:'35 Ah',price:11000},{label:'45 Ah',price:14000},{label:'55 Ah',price:17000},{label:'65 Ah',price:20500}] },
      { name:'Luminous', sizes:[{label:'35 Ah',price:10500},{label:'45 Ah',price:13200},{label:'55 Ah',price:16000},{label:'65 Ah',price:19500}] },
      { name:'Bosch',    sizes:[{label:'35 Ah',price:14000},{label:'45 Ah',price:17500},{label:'55 Ah',price:21000},{label:'65 Ah',price:25000}] },
      { name:'Optima',   sizes:[{label:'35 Ah',price:18000},{label:'45 Ah',price:23000},{label:'55 Ah',price:28000},{label:'65 Ah',price:34000}] },
      { name:'Volta',    sizes:[{label:'35 Ah',price:9500},{label:'45 Ah',price:12000},{label:'55 Ah',price:15000},{label:'65 Ah',price:18000}] },
      { name:'Lucas',    sizes:[{label:'35 Ah',price:10000},{label:'45 Ah',price:12800},{label:'55 Ah',price:15500},{label:'65 Ah',price:19000}] },
      { name:'Rocket',   sizes:[{label:'35 Ah',price:9800},{label:'45 Ah',price:12500},{label:'55 Ah',price:15200},{label:'65 Ah',price:18500}] },
    ],
  },
  {
    name:'Air Filter Replacement', category:'Routine Maintenance', duration:'30 min', price:2500,
    brands:[
      { name:'Bosch',          sizes:[{label:'Standard (OEM fit)',price:1800},{label:'Premium / Cabin',price:2800}] },
      { name:'Denso',          sizes:[{label:'Standard (OEM fit)',price:1600},{label:'Premium / Cabin',price:2500}] },
      { name:'Mann Filter',    sizes:[{label:'Standard (OEM fit)',price:2200},{label:'Premium / Cabin',price:3200}] },
      { name:'K&N (reusable)', sizes:[{label:'Standard',price:6500},{label:'High-flow',price:9500}] },
      { name:'Sakura',         sizes:[{label:'Standard (OEM fit)',price:1200},{label:'Cabin',price:1800}] },
      { name:'Wix',            sizes:[{label:'Standard (OEM fit)',price:1400},{label:'Premium',price:2200}] },
    ],
  },
  {
    name:'Spark Plug Replacement', category:'Routine Maintenance', duration:'1 hr', price:4000,
    brands:[
      { name:'NGK',     sizes:[{label:'Standard (set of 4)',price:3200},{label:'Iridium (set of 4)',price:7500},{label:'Platinum (set of 4)',price:6000}] },
      { name:'Denso',   sizes:[{label:'Standard (set of 4)',price:3000},{label:'Iridium (set of 4)',price:7000},{label:'Platinum (set of 4)',price:5500}] },
      { name:'Bosch',   sizes:[{label:'Standard (set of 4)',price:3500},{label:'Iridium (set of 4)',price:8000},{label:'Platinum (set of 4)',price:6500}] },
      { name:'Champion',sizes:[{label:'Standard (set of 4)',price:2800},{label:'Iridium (set of 4)',price:6500}] },
    ],
  },
  {
    name:'Coolant Flush & Refill', category:'Routine Maintenance', duration:'1 hr', price:4500,
    brands:[
      { name:'Prestone', sizes:[{label:'Flush only',price:2500},{label:'Flush + coolant top-up',price:4500},{label:'Full coolant change',price:6500}] },
      { name:'Motul',    sizes:[{label:'Flush only',price:3000},{label:'Flush + coolant top-up',price:5000},{label:'Full coolant change',price:7200}] },
      { name:'Pentosin', sizes:[{label:'Flush only',price:3200},{label:'Flush + coolant top-up',price:5500},{label:'Full coolant change',price:8000}] },
      { name:'Shell',    sizes:[{label:'Flush only',price:2800},{label:'Flush + coolant top-up',price:4800},{label:'Full coolant change',price:6800}] },
    ],
  },
  {
    name:'Wiper Blade Replacement', category:'Routine Maintenance', duration:'15 min', price:1500,
    brands:[
      { name:'Bosch', sizes:[{label:'Front pair',price:2200},{label:'Rear single',price:1200},{label:'Full set (front + rear)',price:3200}] },
      { name:'Denso', sizes:[{label:'Front pair',price:2000},{label:'Rear single',price:1100},{label:'Full set (front + rear)',price:2900}] },
      { name:'Valeo', sizes:[{label:'Front pair',price:2500},{label:'Rear single',price:1400},{label:'Full set (front + rear)',price:3600}] },
      { name:'SWF',   sizes:[{label:'Front pair',price:1800},{label:'Rear single',price:1000},{label:'Full set (front + rear)',price:2600}] },
    ],
  },
  {
    name:'Full Brake Service', category:'Repairs', duration:'3 hrs', price:8200,
    brands:[
      { name:'Brembo', sizes:[{label:'Front pads',price:8500},{label:'Rear pads',price:7500},{label:'Full set (4)',price:28000}] },
      { name:'Bosch',  sizes:[{label:'Front pads',price:5500},{label:'Rear pads',price:4800},{label:'Full set (4)',price:18500}] },
      { name:'Nissin', sizes:[{label:'Front pads',price:4200},{label:'Rear pads',price:3800},{label:'Full set (4)',price:15000}] },
      { name:'Bendix', sizes:[{label:'Front pads',price:4800},{label:'Rear pads',price:4200},{label:'Full set (4)',price:16500}] },
      { name:'ATE',    sizes:[{label:'Front pads',price:6000},{label:'Rear pads',price:5200},{label:'Full set (4)',price:21000}] },
      { name:'TRW',    sizes:[{label:'Front pads',price:5800},{label:'Rear pads',price:5000},{label:'Full set (4)',price:20000}] },
      { name:'Textar', sizes:[{label:'Front pads',price:5200},{label:'Rear pads',price:4500},{label:'Full set (4)',price:18000}] },
    ],
  },
  {
    name:'AC Repair & Regas', category:'Repairs', duration:'4 hrs', price:12000,
    brands:[
      { name:'Denso',           sizes:[{label:'Regas only (R134a)',price:4500},{label:'Regas + Service',price:9500},{label:'Full repair',price:22000}] },
      { name:'Sanden',          sizes:[{label:'Regas only (R134a)',price:4200},{label:'Regas + Service',price:8800},{label:'Full repair',price:20000}] },
      { name:'Zexel',           sizes:[{label:'Regas only (R134a)',price:4000},{label:'Regas + Service',price:8500},{label:'Full repair',price:19000}] },
      { name:'Generic / Local', sizes:[{label:'Regas only',price:3200},{label:'Full service',price:7000}] },
    ],
  },
  {
    name:'Engine Diagnostic', category:'Repairs', duration:'2 hrs', price:5000,
    brands:[
      { name:'Bosch KTS (OBD2)', sizes:[{label:'Basic scan',price:2500},{label:'Full diagnostic',price:5000},{label:'ECU report',price:7500}] },
      { name:'Autel MaxiDAS',    sizes:[{label:'Basic scan',price:2000},{label:'Full diagnostic',price:4500},{label:'ECU report',price:7000}] },
      { name:'Launch X431',      sizes:[{label:'Basic scan',price:2200},{label:'Full diagnostic',price:4800},{label:'ECU report',price:7200}] },
      { name:'Snap-on',          sizes:[{label:'Basic scan',price:2800},{label:'Full diagnostic',price:5500},{label:'ECU report',price:8000}] },
    ],
  },
  {
    name:'Suspension Repair', category:'Repairs', duration:'4 hrs', price:18000,
    brands:[
      { name:'KYB',      sizes:[{label:'Front (per shock)',price:8500},{label:'Rear (per shock)',price:7500},{label:'Full set (4)',price:30000}] },
      { name:'Monroe',   sizes:[{label:'Front (per shock)',price:9000},{label:'Rear (per shock)',price:8000},{label:'Full set (4)',price:33000}] },
      { name:'Bilstein', sizes:[{label:'Front (per shock)',price:18000},{label:'Rear (per shock)',price:16000},{label:'Full set (4)',price:65000}] },
      { name:'Gabriel',  sizes:[{label:'Front (per shock)',price:7000},{label:'Rear (per shock)',price:6000},{label:'Full set (4)',price:25000}] },
      { name:'Sachs',    sizes:[{label:'Front (per shock)',price:10000},{label:'Rear (per shock)',price:9000},{label:'Full set (4)',price:37000}] },
    ],
  },
  {
    name:'Clutch Replacement', category:'Repairs', duration:'1 day', price:25000,
    brands:[
      { name:'Aisin', sizes:[{label:'Disc only',price:8500},{label:'Kit (disc+cover)',price:18000},{label:'Full kit + bearing',price:22000}] },
      { name:'LUK',   sizes:[{label:'Disc only',price:10000},{label:'Kit (disc+cover)',price:22000},{label:'Full kit + bearing',price:27000}] },
      { name:'Valeo', sizes:[{label:'Disc only',price:9500},{label:'Kit (disc+cover)',price:21000},{label:'Full kit + bearing',price:25500}] },
      { name:'Exedy', sizes:[{label:'Disc only',price:9000},{label:'Kit (disc+cover)',price:19500},{label:'Full kit + bearing',price:23500}] },
      { name:'Sachs', sizes:[{label:'Disc only',price:9800},{label:'Kit (disc+cover)',price:20500},{label:'Full kit + bearing',price:24500}] },
    ],
  },
  {
    name:'Gearbox Service', category:'Repairs', duration:'1 day', price:30000,
    brands:[
      { name:'Castrol Transmax', sizes:[{label:'Manual flush',price:6500},{label:'Auto flush',price:9500},{label:'Full rebuild',price:45000}] },
      { name:'Mobil ATF',        sizes:[{label:'Manual flush',price:7000},{label:'Auto flush',price:10000},{label:'Full rebuild',price:48000}] },
      { name:'Shell Spirax',     sizes:[{label:'Manual flush',price:7200},{label:'Auto flush',price:10500},{label:'Full rebuild',price:50000}] },
      { name:'Total Fluide',     sizes:[{label:'Manual flush',price:6800},{label:'Auto flush',price:9800},{label:'Full rebuild',price:46000}] },
    ],
  },
  {
    name:'Radiator Flush', category:'Repairs', duration:'2 hrs', price:6000,
    brands:[
      { name:'Prestone', sizes:[{label:'Flush only',price:3500},{label:'Flush + coolant',price:6000},{label:'Full coolant change',price:8500}] },
      { name:'Motul',    sizes:[{label:'Flush only',price:4000},{label:'Flush + coolant',price:7000},{label:'Full coolant change',price:9500}] },
      { name:'Pentosin', sizes:[{label:'Flush only',price:4500},{label:'Flush + coolant',price:7500},{label:'Full coolant change',price:10500}] },
      { name:'Wurth',    sizes:[{label:'Flush only',price:3800},{label:'Flush + coolant',price:6500},{label:'Full coolant change',price:9000}] },
    ],
  },
  {
    name:'Timing Belt Replacement', category:'Repairs', duration:'4 hrs', price:20000,
    brands:[
      { name:'Gates',     sizes:[{label:'Belt only',price:5500},{label:'Belt + tensioner',price:9500},{label:'Full kit',price:14000}] },
      { name:'Dayco',     sizes:[{label:'Belt only',price:5000},{label:'Belt + tensioner',price:9000},{label:'Full kit',price:13000}] },
      { name:'Contitech', sizes:[{label:'Belt only',price:6000},{label:'Belt + tensioner',price:10500},{label:'Full kit',price:15500}] },
      { name:'Bosch',     sizes:[{label:'Belt only',price:5800},{label:'Belt + tensioner',price:10000},{label:'Full kit',price:14500}] },
      { name:'Bando',     sizes:[{label:'Belt only',price:4500},{label:'Belt + tensioner',price:8000},{label:'Full kit',price:12000}] },
    ],
  },
  {
    name:'Power Steering Service', category:'Repairs', duration:'2 hrs', price:7500,
    brands:[
      { name:'Castrol',  sizes:[{label:'Fluid flush',price:3500},{label:'Flush + refill',price:6000},{label:'Full rack repair',price:35000}] },
      { name:'Pentosin', sizes:[{label:'Fluid flush',price:4000},{label:'Flush + refill',price:6800},{label:'Full rack repair',price:38000}] },
      { name:'Wurth',    sizes:[{label:'Fluid flush',price:3800},{label:'Flush + refill',price:6200}] },
      { name:'Motul',    sizes:[{label:'Fluid flush',price:4200},{label:'Flush + refill',price:7000},{label:'Full rack repair',price:40000}] },
    ],
  },
  {
    name:'Fuel Injector Cleaning', category:'Repairs', duration:'2 hrs', price:6500,
    brands:[
      { name:'BG Products', sizes:[{label:'Ultrasonic clean (set)',price:6500},{label:'On-car flush',price:4500}] },
      { name:'Wynns',       sizes:[{label:'Ultrasonic clean (set)',price:5800},{label:'On-car flush',price:4000}] },
      { name:'Liqui Moly',  sizes:[{label:'Ultrasonic clean (set)',price:7000},{label:'On-car flush',price:5000}] },
      { name:'STP',         sizes:[{label:'On-car flush',price:3500},{label:'Additive treatment',price:1500}] },
    ],
  },
  {
    name:'Flat Tyre Repair', category:'Emergency Services', duration:'30 min', price:1500,
    brands:[
      { name:'Patch repair', sizes:[{label:'Standard patch',price:800},{label:'Mushroom plug',price:1200}] },
      { name:'Plug kit',     sizes:[{label:'Rope plug',price:600},{label:'String plug',price:700}] },
      { name:'Foam sealant', sizes:[{label:'Temp fix (300ml)',price:1500},{label:'Temp fix (450ml)',price:2000}] },
    ],
  },
  {
    name:'Jump Start', category:'Emergency Services', duration:'15 min', price:1000,
    brands:[
      { name:'Booster cables', sizes:[{label:'Standard jump',price:1000}] },
      { name:'Portable pack',  sizes:[{label:'Lithium jump pack',price:1500},{label:'Heavy duty pack',price:2000}] },
    ],
  },
  {
    name:'Towing Service', category:'Emergency Services', duration:'1 hr', price:5000,
    brands:[
      { name:'Flatbed tow',    sizes:[{label:'Up to 5 km',price:3500},{label:'5–15 km',price:5000},{label:'15–30 km',price:8000},{label:'30+ km',price:12000}] },
      { name:'Wheel-lift tow', sizes:[{label:'Up to 5 km',price:2500},{label:'5–15 km',price:4000},{label:'15–30 km',price:6500},{label:'30+ km',price:10000}] },
    ],
  },
  {
    name:'Emergency Brake Fix', category:'Emergency Services', duration:'2 hrs', price:8000,
    brands:[
      { name:'Brembo', sizes:[{label:'Pad replace (front)',price:8500},{label:'Pad replace (rear)',price:7500}] },
      { name:'Bosch',  sizes:[{label:'Pad replace (front)',price:5500},{label:'Pad replace (rear)',price:4800}] },
      { name:'Nissin', sizes:[{label:'Pad replace (front)',price:4200},{label:'Pad replace (rear)',price:3800}] },
      { name:'Bendix', sizes:[{label:'Pad replace (front)',price:4500},{label:'Pad replace (rear)',price:4000}] },
    ],
  },
  {
    name:'Emergency Lockout', category:'Emergency Services', duration:'30 min', price:2500,
    brands:[
      { name:'Standard unlock', sizes:[{label:'Car door',price:2500},{label:'Boot / trunk',price:3000}] },
      { name:'Spare key cut',   sizes:[{label:'Basic key',price:3500},{label:'Transponder key',price:8500},{label:'Smart key',price:15000}] },
    ],
  },
  {
    name:'Fuel Delivery', category:'Emergency Services', duration:'30 min', price:2000,
    brands:[
      { name:'Petrol delivery', sizes:[{label:'5L can',price:2000},{label:'10L can',price:3500}] },
      { name:'Diesel delivery', sizes:[{label:'5L can',price:1900},{label:'10L can',price:3200}] },
    ],
  },
];

const EMPTY = {
  serviceSelections: {},
  name:'', category:'Routine Maintenance', description:'', price:'',
  vehicleType:'All', assignedVehicles:[], duration:'', status:'Available',
  warranty:'', count:0, assignedDate: new Date().toISOString().slice(0,10),
  techNotes:'', priority:'Normal',
};

// ── buildPayload helper ───────────────────────────────────────────────────────
// ✅ FIX: serviceSelections field එක backend එකට යන්නේ නැහැ
function buildPayload(form, name, names, sel) {
  const { serviceSelections, ...rest } = form;
  return {
    ...rest,
    name,
    names,
    assignedVehicles: form.assignedVehicles || [],
    vehicle: form.assignedVehicles?.[0] || '',
    selectedBrand: sel?.brand || '',
    selectedSize:  sel?.size  || '',
  };
}

// ── ServiceCard ───────────────────────────────────────────────────────────────
function ServiceCard({ svcName, sel, onBrand, onSize, onRemove, onToggle }) {
  const svc      = SERVICE_LIST.find(s => s.name === svcName);
  if (!svc) return null;
  const brandObj = svc.brands.find(b => b.name === sel.brand);
  const isComplete = sel.brand && sel.size;
  const partPrice  = brandObj?.sizes.find(s => s.label === sel.size)?.price || 0;

  return (
    <div style={{
      background:'var(--surface2)',
      border:`1px solid ${isComplete ? 'rgba(240,192,64,.35)' : 'var(--border)'}`,
      borderRadius:'var(--r)',
      animation:'svcFadeIn .18s ease',
      position:'relative',
    }}>
      <style>{`@keyframes svcFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div onClick={onToggle} style={{
        display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer',
        background: isComplete ? 'rgba(240,192,64,.06)' : 'transparent',
        borderRadius: sel.expanded ? 'var(--r) var(--r) 0 0' : 'var(--r)',
      }}>
        <div style={{
          width:8, height:8, borderRadius:'50%', flexShrink:0,
          background: isComplete ? 'var(--accent)' : 'var(--border2)',
          transition:'background .2s',
        }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:'.85rem', fontWeight:600, color:'var(--text)' }}>{svcName}</div>
          <div style={{ fontSize:'.72rem', color:'var(--text2)', marginTop:1 }}>
            {svc.category} · {svc.duration} · LKR {Number(svc.price).toLocaleString()}
          </div>
          {!sel.expanded && isComplete && (
            <div style={{
              marginTop:5, display:'inline-flex', alignItems:'center', gap:6,
              background:'rgba(55,138,221,.12)', border:'1px solid rgba(55,138,221,.25)',
              borderRadius:20, padding:'2px 10px', fontSize:'.72rem',
            }}>
              <span style={{color:'#6a9fd8', fontWeight:600}}>{sel.brand}</span>
              <span style={{color:'var(--text2)'}}>·</span>
              <span style={{color:'var(--text2)'}}>{sel.size}</span>
              <span style={{color:'var(--accent)', fontFamily:'monospace', fontWeight:700}}>
                · LKR {Number(partPrice).toLocaleString()}
              </span>
              <span style={{color:'#6a9fd8', fontSize:'.68rem', marginLeft:2}}>edit</span>
            </div>
          )}
        </div>
        <span style={{
          fontSize:'.7rem', color:'var(--text2)', opacity:.6,
          transition:'transform .2s',
          transform: sel.expanded ? 'rotate(180deg)' : 'none',
        }}>▼</span>
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text2)', fontSize:'1.1rem', lineHeight:1, padding:'2px 4px', flexShrink:0 }}
          onMouseEnter={e => e.currentTarget.style.color='var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text2)'}
        >×</button>
      </div>

      {sel.expanded && (
        <div style={{
          borderTop:'1px solid var(--border)',
          padding:'12px 14px',
          display:'flex', flexDirection:'column', gap:10,
          borderRadius:'0 0 var(--r) var(--r)',
          overflow:'visible',
        }}>
          <div style={{ position:'relative', zIndex:20 }}>
            <div style={{ fontSize:'.68rem', fontWeight:700, letterSpacing:.8, textTransform:'uppercase', color:'var(--text2)', marginBottom:7 }}>
              Brand &amp; Type
            </div>
            <BrandDropdown brands={svc.brands} selected={sel.brand} onSelect={brand => onBrand(brand)} />
          </div>

          {brandObj && (
            <div style={{ position:'relative', zIndex:10 }}>
              <div style={{ fontSize:'.68rem', fontWeight:700, letterSpacing:.8, textTransform:'uppercase', color:'var(--text2)', marginBottom:7 }}>
                Size / Type
              </div>
              <SizeDropdown
                sizes={brandObj.sizes}
                selected={sel.size}
                onSelect={size => onSize(size, brandObj.sizes.find(s => s.label === size)?.price || 0)}
              />
            </div>
          )}

          {isComplete && (
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 14px', background:'rgba(55,138,221,.08)',
              border:'1px solid rgba(55,138,221,.2)', borderRadius:'var(--r)',
            }}>
              <span style={{ fontSize:'.83rem', color:'#6a9fd8', fontWeight:500 }}>
                {sel.brand} · {sel.size}
              </span>
              <span style={{ fontSize:'.83rem', color:'#378ADD', fontWeight:700, fontFamily:'monospace' }}>
                LKR {Number(partPrice).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── BrandDropdown ─────────────────────────────────────────────────────────────
function BrandDropdown({ brands, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'9px 13px', background:'var(--bg)',
        border:`1px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`,
        borderRadius:'var(--r)', cursor:'pointer', fontSize:'.84rem',
        color: selected ? 'var(--accent)' : 'var(--text2)', fontWeight: selected ? 600 : 400,
      }}>
        <span>{selected || 'Select brand...'}</span>
        <span style={{ fontSize:'.7rem', opacity:.6 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 3px)', left:0, right:0, zIndex:9999,
          background:'var(--surface)', border:'1px solid var(--border2)',
          borderRadius:'var(--r)', boxShadow:'0 8px 24px rgba(0,0,0,.5)',
          maxHeight:240, overflowY:'auto',
        }}>
          {brands.map(b => (
            <div key={b.name}
              onClick={() => { onSelect(b.name); setOpen(false); }}
              style={{
                padding:'9px 13px', fontSize:'.84rem', cursor:'pointer',
                borderBottom:'1px solid var(--border)',
                color: selected === b.name ? 'var(--accent)' : 'var(--text)',
                fontWeight: selected === b.name ? 700 : 400,
                background: selected === b.name ? 'rgba(240,192,64,.08)' : 'transparent',
                transition:'background .1s',
              }}
              onMouseEnter={e => { if (selected !== b.name) e.currentTarget.style.background = 'var(--surface2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = selected === b.name ? 'rgba(240,192,64,.08)' : 'transparent'; }}
            >{b.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SizeDropdown ──────────────────────────────────────────────────────────────
function SizeDropdown({ sizes, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'9px 13px', background:'var(--bg)',
        border:`1px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`,
        borderRadius:'var(--r)', cursor:'pointer', fontSize:'.84rem',
        color: selected ? 'var(--accent)' : 'var(--text2)', fontWeight: selected ? 600 : 400,
      }}>
        <span>{selected || 'Select size / type...'}</span>
        <span style={{ fontSize:'.7rem', opacity:.6 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 3px)', left:0, right:0, zIndex:9999,
          background:'var(--surface)', border:'1px solid var(--border2)',
          borderRadius:'var(--r)', boxShadow:'0 8px 24px rgba(0,0,0,.5)',
          maxHeight:240, overflowY:'auto',
        }}>
          {sizes.map(sz => (
            <div key={sz.label}
              onClick={() => { onSelect(sz.label, sz.price); setOpen(false); }}
              style={{
                padding:'9px 13px', fontSize:'.84rem', cursor:'pointer',
                borderBottom:'1px solid var(--border)',
                display:'flex', justifyContent:'space-between', alignItems:'center',
                color: selected === sz.label ? 'var(--accent)' : 'var(--text)',
                fontWeight: selected === sz.label ? 700 : 400,
                background: selected === sz.label ? 'rgba(240,192,64,.08)' : 'transparent',
                transition:'background .1s',
              }}
              onMouseEnter={e => { if (selected !== sz.label) e.currentTarget.style.background = 'var(--surface2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = selected === sz.label ? 'rgba(240,192,64,.08)' : 'transparent'; }}
            >
              <span>{sz.label}</span>
              <span style={{ fontFamily:'monospace', fontSize:'.78rem', color:'var(--accent)', fontWeight:700 }}>
                LKR {Number(sz.price).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ServiceNamePicker ─────────────────────────────────────────────────────────
function ServiceNamePicker({ selected, onAdd, onRemoveAll }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');

  const filteredList = SERVICE_LIST.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );
  const grouped = filteredList.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const count = Object.keys(selected).length;
  const triggerLabel = count === 0 ? '— Select services —'
    : count === 1 ? Object.keys(selected)[0]
    : `${count} services selected`;

  return (
    <div style={{ position:'relative' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', gap:8,
        background:'var(--bg)',
        border:`1px solid ${count ? 'var(--accent)' : 'var(--border2)'}`,
        borderRadius:'var(--r)', padding:'10px 13px', cursor:'pointer',
        minHeight:42, fontSize:'.88rem',
        color: count ? 'var(--text)' : 'var(--text2)', transition:'border-color .18s',
      }}>
        <span style={{ flex:1, fontWeight: count ? 600 : 400 }}>{triggerLabel}</span>
        {count > 0 && (
          <span style={{ background:'var(--accent-dim)', color:'var(--accent)', borderRadius:20, padding:'1px 8px', fontSize:'.72rem', fontWeight:700, flexShrink:0 }}>{count}</span>
        )}
        <span style={{ fontSize:'.7rem', opacity:.5 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
          zIndex:9999, background:'#131720',
          border:'1.5px solid var(--accent)', borderRadius:'var(--r)',
          boxShadow:'0 12px 36px rgba(0,0,0,.75)', overflow:'hidden',
        }}>
          <div style={{ padding:'7px 9px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ fontSize:'.8rem', opacity:.5 }}>🔍</span>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search services..." onClick={e => e.stopPropagation()}
              style={{ flex:1, background:'transparent', border:'none', fontSize:'.84rem', color:'var(--text)', outline:'none' }} />
            {search && (
              <button onClick={e => { e.stopPropagation(); setSearch(''); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text2)', fontSize:'.9rem', padding:0 }}>×</button>
            )}
          </div>
          <div style={{ padding:'5px 12px', borderBottom:'1px solid var(--border)', display:'flex', gap:10, alignItems:'center' }}>
            <button onClick={() => { SERVICE_LIST.forEach(s => onAdd(s)); }}
              style={{ fontSize:'.74rem', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0 }}>☑ Select all</button>
            <span style={{ color:'var(--border2)' }}>|</span>
            <button onClick={onRemoveAll}
              style={{ fontSize:'.74rem', color:'var(--red)', background:'none', border:'none', cursor:'pointer', padding:0 }}>✕ Clear all</button>
            {count > 0 && <span style={{ marginLeft:'auto', fontSize:'.72rem', color:'var(--text2)' }}>{count} selected</span>}
          </div>

          <div style={{ maxHeight:340, overflowY:'auto' }}>
            {Object.keys(grouped).length === 0
              ? <div style={{ padding:'16px', textAlign:'center', fontSize:'.83rem', color:'var(--text2)' }}>No services found</div>
              : Object.entries(grouped).map(([cat, svcs]) => (
                <div key={cat}>
                  <div style={{
                    padding:'6px 12px 4px', fontSize:'.68rem', fontWeight:700,
                    letterSpacing:1, color:'var(--accent)', textTransform:'uppercase',
                    background:'#0d1018', borderBottom:'1px solid var(--border)',
                    display:'flex', alignItems:'center', gap:6,
                  }}>{CAT_ICON[cat] || '🔧'} {cat}</div>

                  {svcs.map(svc => {
                    const isSel = !!selected[svc.name];
                    return (
                      <div key={svc.name}
                        onClick={() => { if (!isSel) { onAdd(svc); setOpen(false); } }}
                        style={{
                          padding:'9px 14px', cursor: isSel ? 'default' : 'pointer',
                          borderBottom:'1px solid var(--border)',
                          display:'flex', alignItems:'center', gap:10,
                          background: isSel ? 'rgba(240,192,64,.08)' : 'transparent',
                          opacity: isSel ? .6 : 1,
                          transition:'background .12s',
                        }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#1a1f2e'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isSel ? 'rgba(240,192,64,.08)' : 'transparent'; }}
                      >
                        <div style={{
                          width:18, height:18, borderRadius:4, flexShrink:0,
                          border:`2px solid ${isSel ? 'var(--accent)' : 'var(--border2)'}`,
                          background: isSel ? 'var(--accent)' : 'transparent',
                          display:'flex', alignItems:'center', justifyContent:'center', transition:'.15s',
                        }}>
                          {isSel && <span style={{ fontSize:'.65rem', color:'#000', fontWeight:900, lineHeight:1 }}>✓</span>}
                        </div>
                        <span style={{ flex:1, fontSize:'.85rem', color: isSel ? 'var(--accent)' : 'var(--text)', fontWeight: isSel ? 700 : 400 }}>{svc.name}</span>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ fontSize:'.77rem', fontWeight:700, color:'var(--accent)', background:'rgba(240,192,64,.13)', padding:'2px 9px', borderRadius:20 }}>
                            LKR {Number(svc.price).toLocaleString()}
                          </div>
                          <div style={{ fontSize:'.68rem', color:'var(--text2)', marginTop:2 }}>⏱ {svc.duration}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            }
          </div>

          <div style={{ padding:'8px 12px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end' }}>
            <button onClick={() => setOpen(false)}
              style={{ background:'var(--accent)', color:'#000', border:'none', borderRadius:7, padding:'6px 20px', fontSize:'.83rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Done ({count})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── VehiclePicker ─────────────────────────────────────────────────────────────
function VehiclePicker({ selected = [], onChange, vehicles }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const filtered = vehicles.filter(v =>
    `${v.plate} ${v.make} ${v.model} ${v.owner}`.toLowerCase().includes(search.toLowerCase())
  );
  const toggle = plate => selected.includes(plate)
    ? onChange(selected.filter(p => p !== plate))
    : onChange([...selected, plate]);
  const label = selected.length === 0
    ? '— Select vehicles (optional) —'
    : `${selected.length} vehicle${selected.length > 1 ? 's' : ''} selected`;

  return (
    <div style={{ position:'relative' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', gap:6,
        background:'var(--bg)', border:'1px solid var(--border2)',
        borderRadius:'var(--r)', padding:'10px 13px', cursor:'pointer',
        minHeight:42, fontSize:'.88rem', color: selected.length ? 'var(--text)' : 'var(--text2)',
      }}>
        <span style={{ flex:1 }}>{label}</span>
        {selected.length > 0 && (
          <span style={{ background:'var(--accent-dim)', color:'var(--accent)', borderRadius:20, padding:'1px 8px', fontSize:'.72rem', fontWeight:700 }}>{selected.length}</span>
        )}
        <span style={{ fontSize:'.7rem', opacity:.6 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:9999,
          background:'#131720', border:'1.5px solid var(--accent)',
          borderRadius:'var(--r)', boxShadow:'0 12px 32px rgba(0,0,0,.7)', overflow:'hidden',
        }}>
          <div style={{ padding:'6px 8px', borderBottom:'1px solid var(--border)' }}>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search vehicles..." onClick={e => e.stopPropagation()}
              style={{ width:'100%', background:'#0d1018', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'5px 8px', fontSize:'.83rem', color:'var(--text)', outline:'none' }} />
          </div>
          <div style={{ padding:'5px 12px', display:'flex', gap:8, borderBottom:'1px solid var(--border)' }}>
            <button onClick={() => onChange(vehicles.map(v => v.plate))}
              style={{ fontSize:'.74rem', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0 }}>Select all</button>
            <span style={{ color:'var(--border2)' }}>|</span>
            <button onClick={() => onChange([])}
              style={{ fontSize:'.74rem', color:'var(--text2)', background:'none', border:'none', cursor:'pointer', padding:0 }}>Clear</button>
          </div>
          <div style={{ maxHeight:240, overflowY:'auto' }}>
            {filtered.length === 0
              ? <div style={{ padding:'12px', fontSize:'.83rem', color:'var(--text2)', textAlign:'center' }}>No vehicles found</div>
              : filtered.map(v => {
                const isChecked = selected.includes(v.plate);
                return (
                  <div key={v.plate} onClick={() => toggle(v.plate)} style={{
                    padding:'9px 12px', cursor:'pointer', borderBottom:'1px solid var(--border)',
                    display:'flex', alignItems:'center', gap:10,
                    background: isChecked ? 'rgba(240,192,64,.08)' : 'transparent', transition:'background .12s',
                  }}
                    onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = '#1a1f2e'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isChecked ? 'rgba(240,192,64,.08)' : 'transparent'; }}
                  >
                    <div style={{
                      width:18, height:18, borderRadius:4, flexShrink:0,
                      border:`2px solid ${isChecked ? 'var(--accent)' : 'var(--border2)'}`,
                      background: isChecked ? 'var(--accent)' : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center', transition:'.15s',
                    }}>
                      {isChecked && <span style={{ fontSize:'.6rem', color:'#000', fontWeight:900 }}>✓</span>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'.84rem', fontWeight:600, color:'var(--text)' }}>
                        <span className="mono" style={{ color:'var(--accent)', marginRight:6 }}>{v.plate}</span>{v.make} {v.model}
                      </div>
                      <div style={{ fontSize:'.74rem', color:'var(--text2)', marginTop:1 }}>Owner: {v.owner} &nbsp;·&nbsp; {v.year}</div>
                    </div>
                  </div>
                );
              })
            }
          </div>
          <div style={{ padding:'8px 12px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end' }}>
            <button onClick={() => setOpen(false)}
              style={{ background:'var(--accent)', color:'#000', border:'none', borderRadius:7, padding:'6px 18px', fontSize:'.83rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Done ({selected.length})
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

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, v] = await Promise.all([servicesCatalogService.getAll(), vehicleService.getAll()]);
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
    return (s.name.toLowerCase().includes(q) || (s.category || '').toLowerCase().includes(q))
      && (catFilter === 'All' || s.category === catFilter);
  });

  // ── Form helpers ──────────────────────────────────────────────────────────
  const calcTotalPrice = (selections) =>
    Object.entries(selections).reduce((sum, [name, sel]) => {
      const svc = SERVICE_LIST.find(s => s.name === name);
      if (!svc) return sum;
      const brandObj = svc.brands.find(b => b.name === sel.brand);
      const partPrice = brandObj?.sizes.find(s => s.label === sel.size)?.price || 0;
      return sum + svc.price + partPrice;
    }, 0);

  const addService = (svc) => {
    setForm(f => {
      if (f.serviceSelections[svc.name]) return f;
      const newSels = { ...f.serviceSelections, [svc.name]: { brand: null, size: null, expanded: true } };
      const first = SERVICE_LIST.find(s => s.name === Object.keys(newSels)[0]);
      return { ...f, serviceSelections: newSels, name: Object.keys(newSels)[0] || '', category: first?.category || f.category, duration: first?.duration || f.duration, price: String(calcTotalPrice(newSels)) };
    });
  };

  const removeService = (name) => {
    setForm(f => {
      const newSels = { ...f.serviceSelections };
      delete newSels[name];
      const first = SERVICE_LIST.find(s => s.name === Object.keys(newSels)[0]);
      return { ...f, serviceSelections: newSels, name: Object.keys(newSels)[0] || '', category: first?.category || f.category, duration: first?.duration || f.duration, price: String(calcTotalPrice(newSels)) };
    });
  };

  const setBrand = (svcName, brand) => {
    setForm(f => {
      const newSels = { ...f.serviceSelections, [svcName]: { ...f.serviceSelections[svcName], brand, size: null } };
      return { ...f, serviceSelections: newSels, price: String(calcTotalPrice(newSels)) };
    });
  };

  const setSize = (svcName, size) => {
    setForm(f => {
      const newSels = { ...f.serviceSelections, [svcName]: { ...f.serviceSelections[svcName], size } };
      setTimeout(() => {
        setForm(ff => ({ ...ff, serviceSelections: { ...ff.serviceSelections, [svcName]: { ...ff.serviceSelections[svcName], expanded: false } } }));
      }, 300);
      return { ...f, serviceSelections: newSels, price: String(calcTotalPrice(newSels)) };
    });
  };

  const toggleCard = (svcName) => {
    setForm(f => ({ ...f, serviceSelections: { ...f.serviceSelections, [svcName]: { ...f.serviceSelections[svcName], expanded: !f.serviceSelections[svcName].expanded } } }));
  };

  const openAdd = () => { setForm({ ...EMPTY, serviceSelections: {}, assignedVehicles: [] }); setEditId(null); setModal(true); };

  const openEdit = r => {
    const names = Array.isArray(r.names) ? r.names : (r.name ? [r.name] : []);
    const serviceSelections = {};
    names.forEach(n => {
      serviceSelections[n] = {
        brand: n === names[0] ? (r.selectedBrand || null) : null,
        size:  n === names[0] ? (r.selectedSize  || null) : null,
        expanded: false,
      };
    });
    setForm({
      ...r,
      serviceSelections,
      assignedDate: r.assignedDate?.toString().slice(0, 10) || '',
      assignedVehicles: Array.isArray(r.assignedVehicles) ? r.assignedVehicles : (r.vehicle ? [r.vehicle] : []),
    });
    setEditId(r.id);
    setModal(true);
  };

  // ✅ FIXED save() — serviceSelections backend එකට යන්නේ නැහැ, brand/size correctly pass වෙනවා
  const save = async () => {
    const names = Object.keys(form.serviceSelections);
    if (names.length === 0 && !form.name) { alert('Select at least one service.'); return; }
    if (!form.price) { alert('Price is required.'); return; }

    const namesToSave      = names.length > 0 ? names : [form.name];
    const currentSelections = form.serviceSelections; // ✅ snapshot of current state

    try {
      if (editId) {
        const sel     = currentSelections[namesToSave[0]] || {};
        const payload = buildPayload(form, namesToSave[0], namesToSave, sel);
        await servicesCatalogService.update(editId, payload);
        showToast('✅ Service updated');

      } else {
        if (namesToSave.length === 1) {
          const sel     = currentSelections[namesToSave[0]] || {};
          const payload = buildPayload(form, namesToSave[0], namesToSave, sel);
          await servicesCatalogService.create(payload);
        } else {
          await Promise.all(namesToSave.map(n => {
            const svcData = SERVICE_LIST.find(s => s.name === n);
            const sel     = currentSelections[n] || {};
            const payload = buildPayload(
              { ...form, price: svcData ? String(svcData.price) : form.price, duration: svcData?.duration || form.duration, category: svcData?.category || form.category },
              n, [n], sel
            );
            return servicesCatalogService.create(payload);
          }));
        }
        showToast(namesToSave.length > 1 ? `✅ ${namesToSave.length} services added` : '✅ Service added');
      }

      setModal(false);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
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
      if (idx < STAGES.length - 1) { showToast(`✅ ${j.vehicle} → ${STAGES[idx + 1]}`); return { ...j, stage: STAGES[idx + 1] }; }
      return j;
    }));
  };

  const totalRevenue = services.reduce((a, s) => a + Number(s.price || 0) * Number(s.count || 0), 0);
  const exportData = filtered.map(s => ({
    ID: s.serviceCode, 'Service Name': s.name, Category: s.category,
    'Price (LKR)': s.price, Duration: s.duration, Status: s.status,
    Brand: s.selectedBrand || '—', Size: s.selectedSize || '—',
    'Assigned Vehicles': (s.assignedVehicles || []).join(', '),
  }));

  const selCount = Object.keys(form.serviceSelections || {}).length;

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
          { icon:'🔧', label:'Total Services', val:services.length,                                    color:'sc-blue'   },
          { icon:'✅', label:'Available',       val:services.filter(s=>s.status==='Available').length,  color:'sc-green'  },
          { icon:'🏭', label:'Active Jobs',     val:pipeline.length,                                    color:'sc-orange' },
          { icon:'💰', label:'Est. Revenue',    val:'LKR '+(totalRevenue/1000).toFixed(0)+'K',         color:'sc-gold'   },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-val" style={{ fontSize: typeof s.val === 'string' ? '1.4rem' : '2rem' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:16, background:'var(--surface2)', borderRadius:'var(--r)', padding:4, width:'fit-content' }}>
        {['catalogue', 'pipeline'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'8px 20px', borderRadius:7, border:'none', cursor:'pointer',
            background: tab === t ? 'var(--surface)' : 'none',
            color: tab === t ? 'var(--accent)' : 'var(--text2)',
            fontFamily:'inherit', fontWeight: tab === t ? 700 : 500, fontSize:'.86rem',
            boxShadow: tab === t ? 'var(--shadow)' : 'none', transition:'.15s',
          }}>{t === 'catalogue' ? '📋 Service Catalogue' : '🏭 Job Pipeline'}</button>
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
                {['All', ...CATS].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {loading
            ? <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">Loading services...</div></div>
            : (
              <div className="tscroll">
                <table>
                  <thead>
                    <tr>{['ID','Service','Category','Brand / Size','Vehicles','Price (LKR)','Duration','Done','Priority','Status','Actions'].map(col => <th key={col}>{col}</th>)}</tr>
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
                          <td><span className={`badge ${CAT_C[s.category] || 'bg-muted'}`}>{s.category}</span></td>
                          <td>
                            {s.selectedBrand
                              ? <div>
                                  <div style={{ fontSize:'.8rem', fontWeight:600, color:'var(--text)' }}>{s.selectedBrand}</div>
                                  {s.selectedSize && <div style={{ fontSize:'.72rem', color:'var(--accent)' }}>{s.selectedSize}</div>}
                                </div>
                              : <span style={{ color:'var(--text2)', fontSize:'.78rem' }}>—</span>}
                          </td>
                          <td>
                            {assigned.length === 0
                              ? <span style={{ color:'var(--text2)', fontSize:'.78rem' }}>—</span>
                              : assigned.length === 1
                                ? <span className="mono text-accent" style={{ fontSize:'.8rem' }}>{vehicleLabel(assigned[0])}</span>
                                : <div><span className="mono text-accent" style={{ fontSize:'.8rem' }}>{vehicleLabel(assigned[0])}</span><span style={{ fontSize:'.72rem', color:'var(--text2)', marginLeft:4 }}>+{assigned.length - 1} more</span></div>}
                          </td>
                          <td><span className="mono text-accent" style={{ fontWeight:700 }}>{Number(s.price || 0).toLocaleString()}</span></td>
                          <td className="text-muted">{s.duration}</td>
                          <td style={{ textAlign:'center' }}><span className="badge bg-gold">{s.count}</span></td>
                          <td><span className={`badge ${s.priority === 'High' ? 'bg-red' : s.priority === 'Normal' ? 'bg-blue' : 'bg-muted'}`}>{s.priority || 'Normal'}</span></td>
                          <td><span className={`badge ${s.status === 'Available' ? 'bg-green' : 'bg-red'}`}>{s.status}</span></td>
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
                    {filtered.length === 0 && (
                      <tr><td colSpan={11}>
                        <div className="empty-state"><div className="empty-icon">🔧</div><div className="empty-text">No services found</div></div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          }
          <div className="tfoot"><span>{filtered.length} of {services.length} services</span></div>
        </div>
      )}

      {tab === 'pipeline' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {STAGES.map(stage => (
            <div key={stage} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontWeight:700, fontSize:'.83rem' }}>{stage}</span>
                <span className={`badge ${STAGE_C[stage]}`}>{pipeline.filter(j => j.stage === stage).length}</span>
              </div>
              <div style={{ padding:10, display:'flex', flexDirection:'column', gap:8, minHeight:120 }}>
                {pipeline.filter(j => j.stage === stage).map(j => (
                  <div key={j.id} style={{ background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:8, padding:'10px 12px' }}>
                    <div style={{ fontSize:'.75rem', color:'var(--accent)', fontFamily:'monospace', marginBottom:3 }}>{j.bookingId}</div>
                    <div style={{ fontWeight:600, fontSize:'.83rem', marginBottom:2 }}>{j.vehicle}</div>
                    <div style={{ fontSize:'.77rem', color:'var(--text2)', marginBottom:6 }}>{j.service} · {j.tech}</div>
                    {stage !== 'Ready for Pickup'
                      ? <button className="btn btn-blue btn-xs" style={{ width:'100%', justifyContent:'center' }} onClick={() => advanceStage(j.id)}>→ Next Stage</button>
                      : <span className="badge bg-green" style={{ width:'100%', justifyContent:'center', display:'inline-flex' }}>✓ Complete</span>}
                  </div>
                ))}
                {pipeline.filter(j => j.stage === stage).length === 0 && (
                  <div style={{ textAlign:'center', padding:'24px 8px', color:'var(--muted)', fontSize:'.78rem' }}>No jobs</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-head">
              <div className="modal-title">{editId ? '✏️ Edit Service' : '＋ New Service'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            <div className="section-title">
              Service Info
              {selCount > 0 && (
                <span style={{ marginLeft:8, fontSize:'.67rem', background:'var(--accent-dim)', color:'var(--accent)', padding:'2px 10px', borderRadius:10, fontWeight:700, verticalAlign:'middle' }}>
                  {selCount} selected
                </span>
              )}
            </div>

            <div className="field">
              <label>Service Name *</label>
              <ServiceNamePicker
                selected={form.serviceSelections || {}}
                onAdd={addService}
                onRemoveAll={() => setForm(f => ({ ...f, serviceSelections: {}, name: '', price: '', category: 'Routine Maintenance', duration: '' }))}
              />
            </div>

            {selCount > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:8 }}>
                {Object.entries(form.serviceSelections).map(([name, sel]) => (
                  <ServiceCard
                    key={name} svcName={name} sel={sel}
                    onBrand={brand => setBrand(name, brand)}
                    onSize={(size) => setSize(name, size)}
                    onRemove={() => removeService(name)}
                    onToggle={() => toggleCard(name)}
                  />
                ))}
                {selCount > 1 && (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'rgba(240,192,64,.08)', border:'1px solid rgba(240,192,64,.2)', borderRadius:'var(--r)', marginTop:4 }}>
                    <span style={{ fontSize:'.83rem', color:'var(--text2)', fontWeight:600 }}>Grand Total ({selCount} services)</span>
                    <span style={{ fontFamily:'monospace', fontWeight:800, color:'var(--accent)', fontSize:'.92rem' }}>
                      LKR {Number(form.price || 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

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

            <div className="section-title">Vehicle Assignment</div>
            <div className="field">
              <label>
                Assign to Vehicles
                {form.assignedVehicles?.length > 0 && (
                  <span style={{ marginLeft:8, fontSize:'.67rem', background:'var(--accent-dim)', color:'var(--accent)', padding:'1px 8px', borderRadius:10, fontWeight:700 }}>
                    {form.assignedVehicles.length} selected
                  </span>
                )}
              </label>
              <VehiclePicker selected={form.assignedVehicles || []} onChange={plates => setForm(f => ({ ...f, assignedVehicles: plates }))} vehicles={vehicles} />
            </div>

            {form.assignedVehicles?.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14, padding:'10px 12px', background:'var(--surface2)', borderRadius:'var(--r)', border:'1px solid var(--border)' }}>
                {form.assignedVehicles.map(plate => {
                  const v = vehicles.find(x => x.plate === plate);
                  return (
                    <div key={plate} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--accent-dim)', border:'1px solid rgba(240,192,64,.25)', borderRadius:20, padding:'3px 10px 3px 8px', fontSize:'.78rem' }}>
                      <span style={{ color:'var(--accent)', fontFamily:'monospace', fontWeight:700 }}>{plate}</span>
                      {v && <span style={{ color:'var(--text2)' }}>{v.make} {v.model}</span>}
                      <button onClick={() => setForm(f => ({ ...f, assignedVehicles: f.assignedVehicles.filter(p => p !== plate) }))}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text2)', padding:0, lineHeight:1, fontSize:'.9rem' }}>×</button>
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
                  {selCount > 0 && <span style={{ marginLeft:8, fontSize:'.67rem', background:'rgba(34,197,94,.15)', color:'var(--green)', padding:'1px 8px', borderRadius:10 }}>auto-calculated</span>}
                </label>
                <input name="price" type="number" value={form.price} onChange={h} placeholder="5000" />
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
                <select name="priority" value={form.priority || 'Normal'} onChange={h}>
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
              <textarea name="techNotes" value={form.techNotes || ''} onChange={h} rows={2} placeholder="Instructions for technician..." />
            </div>

            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={save}>{editId ? 'Update' : 'Save'} Service</button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {viewModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setViewModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">🔧 {viewModal.name}</div>
              <button className="modal-close" onClick={() => setViewModal(null)}>×</button>
            </div>
            <span className={`badge ${CAT_C[viewModal.category] || 'bg-muted'}`} style={{ marginBottom:14, display:'inline-flex' }}>{viewModal.category}</span>
            <p style={{ fontSize:'.86rem', color:'var(--text2)', marginBottom:18, lineHeight:1.6 }}>{viewModal.description}</p>
            <div className="info-grid">
              {[
                { k:'Price',    v:'LKR ' + Number(viewModal.price || 0).toLocaleString() },
                { k:'Duration', v:viewModal.duration },
                { k:'Priority', v:viewModal.priority || 'Normal' },
                { k:'Done',     v:viewModal.count },
                { k:'Warranty', v:viewModal.warranty },
                { k:'Status',   v:viewModal.status },
                { k:'Brand',    v:viewModal.selectedBrand || '—' },
                { k:'Size',     v:viewModal.selectedSize  || '—' },
              ].map(i => (
                <div key={i.k} className="info-item">
                  <span className="info-key">{i.k}</span>
                  <span className="info-val">{i.v || '—'}</span>
                </div>
              ))}
            </div>
            {(() => {
              const assigned = Array.isArray(viewModal.assignedVehicles) ? viewModal.assignedVehicles : (viewModal.vehicle ? [viewModal.vehicle] : []);
              return assigned.length > 0 ? (
                <div style={{ marginTop:14 }}>
                  <div className="info-key" style={{ marginBottom:6 }}>ASSIGNED VEHICLES ({assigned.length})</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {assigned.map(plate => <span key={plate} className="badge bg-gold">{vehicleLabel(plate)}</span>)}
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