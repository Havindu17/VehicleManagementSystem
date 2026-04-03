import { useState, useEffect } from 'react';
import { customerService, vehicleService, bookingService, invoiceService } from '../utils/api';
import "../style.css";

const actColor = { booking:"#c9a227", payment:"#43e97b", done:"#43e97b", customer:"#60a5fa", feedback:"#e879f9" };
const actIcon  = { booking:"📅", payment:"💳", done:"✅", customer:"👤", feedback:"⭐" };

const statusBadge = s => {
  if (s === "Completed")   return <span className="badge badge-green">Completed</span>;
  if (s === "In Progress") return <span className="badge badge-yellow">In Progress</span>;
  if (s === "Approved")    return <span className="badge badge-blue">Approved</span>;
  if (s === "Cancelled")   return <span className="badge badge-red">Cancelled</span>;
  return <span className="badge badge-gray">Pending</span>;
};

export default function Dashboard({ user }) {
  const displayName = user?.fullName || user?.name || "Admin";
  const hour  = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [stats,    setStats]    = useState({ bookings:0, vehicles:0, customers:0, revenue:'0' });
  const [recent,   setRecent]   = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [customers, vehicles, bookings, invoices] = await Promise.all([
          customerService.getAll(),
          vehicleService.getAll(),
          bookingService.getAll(),
          invoiceService.getAll(),
        ]);

        // Stats calculate කරන්න
        const totalRevenue = invoices.reduce((a, inv) => a + Number(inv.paid || 0), 0);
        setStats({
          bookings:  bookings.length,
          vehicles:  vehicles.length,
          customers: customers.length,
          revenue:   totalRevenue >= 1000000
            ? (totalRevenue / 1000000).toFixed(1) + 'M'
            : (totalRevenue / 1000).toFixed(0) + 'K',
        });

        // Recent bookings — latest 5
        const sorted = [...bookings].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        setRecent(sorted);

        // Activity feed generate කරන්න
        const acts = [];
        bookings.slice(0, 2).forEach(b => acts.push({
          time: b.date, text: `New booking — ${b.customer} · ${b.service}`, type: 'booking'
        }));
        invoices.filter(i => i.status === 'Paid').slice(0, 1).forEach(i => acts.push({
          time: i.date, text: `Payment received — ${i.invoiceCode} · LKR ${Number(i.paid || 0).toLocaleString()}`, type: 'payment'
        }));
        bookings.filter(b => b.status === 'Completed').slice(0, 1).forEach(b => acts.push({
          time: b.date, text: `Service completed — ${b.vehicle} · ${b.service}`, type: 'done'
        }));
        customers.slice(0, 1).forEach(c => acts.push({
          time: c.joinDate, text: `New customer registered — ${c.fullName}`, type: 'customer'
        }));
        setActivity(acts.slice(0, 5));

      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const statCards = [
    { label: "Total Bookings",  value: stats.bookings,  sub: "All time",           color: "#c9a227", icon: "📅" },
    { label: "Active Vehicles", value: stats.vehicles,  sub: "Registered",         color: "#43e97b", icon: "🚗" },
    { label: "Customers",       value: stats.customers, sub: "Registered users",   color: "#60a5fa", icon: "👤" },
    { label: "Revenue (LKR)",   value: stats.revenue,   sub: "Total collected",    color: "#e879f9", icon: "💰" },
  ];

  return (
    <div className="dash-page">

      {/* Welcome banner */}
      <div className="dash-banner">
        <div className="dash-banner-left">
          <div className="dash-banner-tag">🏆 Dashboard Overview</div>
          <h1>{greet}, <span>{displayName}</span> 👋</h1>
          <p>Here's what's happening at your service center today.</p>
        </div>
        <div className="dash-banner-right">
          <div className="dash-date-card">
            <div className="dash-date-day">{new Date().toLocaleDateString("en-US",{weekday:"long"})}</div>
            <div className="dash-date-full">{new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ padding:'40px', textAlign:'center', color:'var(--text2)' }}>⏳ Loading dashboard...</div>
      ) : (
        <>
          <div className="dash-stats">
            {statCards.map(s => (
              <div className="dash-stat-card" key={s.label} style={{ "--card-accent": s.color }}>
                <div className="dash-stat-top">
                  <div className="dash-stat-icon" style={{ background:`${s.color}18`, color:s.color }}>{s.icon}</div>
                  <span className="dash-stat-trend">↑</span>
                </div>
                <div className="dash-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="dash-stat-label">{s.label}</div>
                <div className="dash-stat-sub">{s.sub}</div>
                <div className="dash-stat-bar">
                  <div className="dash-stat-bar-fill" style={{ background: s.color }}/>
                </div>
              </div>
            ))}
          </div>

          <div className="dash-grid">

            {/* Recent Bookings */}
            <div className="dash-card dash-card-wide">
              <div className="dash-card-head">
                <div>
                  <h3>Recent Bookings</h3>
                  <p>Latest service appointments</p>
                </div>
                <span className="badge badge-blue">{recent.length} entries</span>
              </div>
              <div className="table-wrap">
                {recent.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'30px', color:'var(--text3)' }}>No bookings yet</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Vehicle</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map(r => (
                        <tr key={r.id}>
                          <td><span className="mono">{r.bookingCode}</span></td>
                          <td style={{ color:"var(--text)", fontWeight:600 }}>{r.customer}</td>
                          <td>{r.vehicle}</td>
                          <td>{r.service}</td>
                          <td>{statusBadge(r.status)}</td>
                          <td style={{ color:"var(--text3)" }}>{r.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="dash-card">
              <div className="dash-card-head">
                <div>
                  <h3>Recent Activity</h3>
                  <p>Latest events</p>
                </div>
                <span className="badge badge-gray">{activity.length} events</span>
              </div>
              <div className="dash-activity">
                {activity.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'30px', color:'var(--text3)' }}>No activity yet</div>
                ) : activity.map((a, i) => (
                  <div className="dash-act-item" key={i}>
                    <div className="dash-act-icon" style={{ background:`${actColor[a.type]}18`, color:actColor[a.type] }}>
                      {actIcon[a.type]}
                    </div>
                    <div className="dash-act-body">
                      <div className="dash-act-text">{a.text}</div>
                      <div className="dash-act-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

