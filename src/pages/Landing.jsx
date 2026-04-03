import "../style.css";

const services = [
  { icon: "🔧", title: "Full Service",        desc: "Comprehensive inspection and maintenance for your vehicle." },
  { icon: "🛢️", title: "Oil & Filter Change", desc: "Premium oil change with genuine filter replacement." },
  { icon: "🛞", title: "Tyre & Alignment",    desc: "Tyre rotation, balancing and precision wheel alignment." },
  { icon: "❄️", title: "AC Service",           desc: "Full air conditioning diagnosis and regas service." },
  { icon: "🔩", title: "Brake Service",        desc: "Brake pad, disc and fluid inspection and replacement." },
  { icon: "⚡", title: "Diagnostics",          desc: "Advanced computer diagnostics for all makes and models." },
];

const stats = [
  { value: "10+",    label: "Years Experience" },
  { value: "4,800+", label: "Vehicles Serviced" },
  { value: "98%",    label: "Customer Satisfaction" },
  { value: "24/7",   label: "Support Available" },
];

export default function Landing({ onLogin, onRegister }) {
  return (
    <div className="landing">

      {/* ══ NAV ══════════════════════════════════════════════ */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="land-logo">
            <div className="land-logo-icon">⚙</div>
            <span>Auto<span className="blue">Serve</span></span>
          </div>
          <ul className="land-nav-links">
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#gallery">Gallery</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="land-nav-ctas">
            <button className="land-btn-ghost" onClick={onLogin}>Sign In</button>
            <button className="land-btn-gold"  onClick={onRegister}>Book a Service</button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="land-hero">
        <div className="land-hero-grid" />
        <div className="hero-glow-ring hero-ring1" />
        <div className="hero-glow-ring hero-ring2" />

        <div className="land-hero-content">
          {/* LEFT */}
          <div className="land-hero-left">
            <div className="hero-tag">🏆 Sri Lanka's Premier Auto Service</div>
            <h1 className="hero-title">
              Welcome to<br/>
              <span className="blue">Auto</span><span className="violet">Serve</span>
            </h1>
            <p className="hero-sub">
              Delivering reliable vehicle services for over 10 years.<br/>
              Precision engineering meets exceptional care.
            </p>
            <div className="hero-ctas">
              <button className="land-btn-gold hero-cta-main" onClick={onRegister}>
                🔧 Book a Service
              </button>
              <button className="land-btn-outline" onClick={onLogin}>
                Sign In →
              </button>
            </div>
            <div className="hero-contact">
              <span>📞 031 701 1991</span>
              <span className="hero-sep">|</span>
              <span>🕐 Mon–Fri 7:30AM – 5:00PM</span>
            </div>
          </div>

          {/* RIGHT — Car showcase card */}
          <div className="land-hero-right">
            <div className="hero-car-card">
              <img
                className="hero-car-img"
                src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop"
                alt="Vehicle Service"
              />
              <div className="hero-car-stats">
                <div className="hero-car-stat">
                  <span className="hero-car-stat-val">4.8★</span>
                  <span className="hero-car-stat-lbl">Rating</span>
                </div>
                <div className="hero-car-stat">
                  <span className="hero-car-stat-val">98%</span>
                  <span className="hero-car-stat-lbl">Satisfied</span>
                </div>
                <div className="hero-car-stat">
                  <span className="hero-car-stat-val">10+</span>
                  <span className="hero-car-stat-lbl">Years</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ════════════════════════════════════════ */}
      <div className="land-stats-bar">
        {stats.map(s => (
          <div className="land-stat" key={s.label}>
            <span className="land-stat-val">{s.value}</span>
            <span className="land-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ══ SERVICES ══════════════════════════════════════════ */}
      <section className="land-section" id="services">
        <div className="land-section-inner">
          <div className="land-section-label">What We Offer</div>
          <h2 className="land-section-title">Our <span className="blue">Services</span></h2>
          <p className="land-section-sub">Professional automotive care from certified technicians</p>

          <div className="land-services-grid">
            {services.map((s, i) => (
              <div className="land-service-card" key={i}>
                <div className="land-svc-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="land-svc-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT / IMAGE BAND ════════════════════════════════ */}
      <section className="land-section" id="about" style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="land-section-inner">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:52, alignItems:'center' }}>
            <div>
              <div className="land-section-label">About Us</div>
              <h2 className="land-section-title">
                Why Choose <span className="blue">AutoServe?</span>
              </h2>
              <p style={{ color:'var(--text2)', lineHeight:1.8, marginBottom:24 }}>
                We are Sri Lanka's most trusted vehicle service management platform.
                With over 10 years of experience, our certified technicians deliver
                precision engineering combined with exceptional customer care.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  ['✅','Certified & experienced technicians'],
                  ['✅','Genuine parts & premium materials'],
                  ['✅','Real-time service tracking'],
                  ['✅','Transparent pricing, no hidden fees'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display:'flex', alignItems:'center', gap:12,
                    fontSize:'.9rem', color:'var(--text2)' }}>
                    <span>{icon}</span> {text}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderRadius:'var(--radius-lg)', overflow:'hidden',
              border:'1px solid var(--border2)', boxShadow:'var(--shadow-lg)' }}>
              <img
                src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&q=80&auto=format&fit=crop"
                alt="Garage service"
                style={{ width:'100%', height:320, objectFit:'cover', display:'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ GALLERY ════════════════════════════════════════════ */}
      <section className="land-section" id="gallery">
        <div className="land-section-inner">
          <div className="land-section-label">Gallery</div>
          <h2 className="land-section-title">Our <span className="blue">Workshop</span></h2>
          <p className="land-section-sub">State-of-the-art facilities for your vehicle</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {[
              'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=75&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=75&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=75&auto=format&fit=crop',
            ].map((src, i) => (
              <div key={i} style={{ borderRadius:'var(--radius)', overflow:'hidden',
                border:'1px solid var(--border)', transition:'transform .3s',
                cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
              >
                <img src={src} alt={`Gallery ${i+1}`}
                  style={{ width:'100%', height:200, objectFit:'cover', display:'block' }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BAND ══════════════════════════════════════════ */}
      <section className="land-cta-band" id="contact">
        <div className="land-cta-band-inner">
          <div>
            <h2>Ready to book your next service?</h2>
            <p>Join thousands of satisfied customers across Sri Lanka.</p>
          </div>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            <button className="land-btn-gold" onClick={onRegister}>Book a Service</button>
            <button className="land-btn-ghost" onClick={onLogin}>Sign In</button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer className="land-footer">
        <div className="land-footer-inner">
          <div className="land-logo" style={{ justifyContent:'center', marginBottom:10 }}>
            <div className="land-logo-icon">⚙</div>
            <span>Auto<span className="blue">Serve</span></span>
          </div>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>
            © 2025 AutoServe · All rights reserved · Vehicle Service Management System
          </p>
        </div>
      </footer>

    </div>
  );
}