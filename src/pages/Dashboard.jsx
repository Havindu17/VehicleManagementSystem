import { useState, useEffect } from 'react';
import { customerService, vehicleService, bookingService, invoiceService, feedbackService, garageService, authService } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
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
  const displayName = user?.fullName || user?.username || "Admin";
  const isGarageOwner = user?.role === "Garage Owner";
  const isVehicleOwner = user?.role === "Vehicle Owner" || (!isGarageOwner && user?.role !== "Admin");
  const hour  = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [stats,    setStats]    = useState({ bookings:0, vehicles:0, customers:0, revenue:'0', rating:'N/A' });
  const [recent,   setRecent]   = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [garageDetails, setGarageDetails] = useState(null);
  const [vehicleOwnerDetails, setVehicleOwnerDetails] = useState(null);
  
  // Profile settings
  const [profileModal, setProfileModal] = useState(false);
  const [profileForm, setProfileForm]   = useState({});
  const [confirmObj, setConfirmObj]     = useState({ isOpen: false, id: null });
  const [successMsg, setSuccessMsg]     = useState('');
  
  const handleProfileChange = e => setProfileForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const openEditProfile = () => {
    setProfileForm({
      ...user,
      fullName: user.fullName || '', email: user.email || '', phone: user.phone || '',
      nic: user.nic || '', address: user.address || '', drivingLicense: user.drivingLicense || '',
      businessName: user.businessName || '', businessReg: user.businessReg || '',
      garageAddress: user.garageAddress || '', openHours: user.openHours || '', garagePhone: user.garagePhone || ''
    });
    setProfileModal(true);
  };
  
  const saveProfile = async () => {
    try {
      await authService.updateProfile(user.id, profileForm);
      if (isGarageOwner) {
        setGarageDetails(prev => ({ ...prev, ...profileForm }));
      } else if (isVehicleOwner) {
        setVehicleOwnerDetails(prev => ({ ...prev, ...profileForm }));
      }
      setProfileModal(false);
      setSuccessMsg('Your details have been updated successfully!');
    } catch(err) { alert(err.message); }
  };
  
  const handleDeleteAccount = async () => {
    try {
      await authService.deleteProfile(user.id);
      authService.logout();
      window.location.reload();
    } catch(err) { alert(err.message); }
    finally { setConfirmObj({ isOpen: false, id: null }); }
  };

  useEffect(() => {
    const loadDashboard = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [customers, vehicles, bookings, invoices, feedbacks, garages] = await Promise.all([
          customerService.getAll().catch(()=>[]),
          vehicleService.getAll().catch(()=>[]),
          bookingService.getAll().catch(()=>[]),
          invoiceService.getAll().catch(()=>[]),
          isGarageOwner ? feedbackService.getAll().catch(()=>[]) : Promise.resolve([]),
          isGarageOwner ? garageService.getAll().catch(()=>[]) : Promise.resolve([])
        ]);

        // Filter and calculate specific to Garage Owner
        const garageNameMatch = user?.businessName || displayName;
        const myFeedbacks = isGarageOwner ? feedbacks.filter(f => f.garage === garageNameMatch || f.garage === displayName) : [];
        const avgRating = myFeedbacks.length ? (myFeedbacks.reduce((a,f) => a + f.rating, 0) / myFeedbacks.length).toFixed(1) : 'N/A';
        const latestFeedback = myFeedbacks.length ? [...myFeedbacks].sort((a,b) => b.id - a.id)[0] : null;
        
        let myGarage = null;
        if (isGarageOwner) {
          // Garage details are stored on the user object in the database
          myGarage = garages.find(g => (g.businessName || g.name) === displayName) || user;
          setGarageDetails(myGarage);
        } else if (isVehicleOwner) {
          setVehicleOwnerDetails(user);
        }

        const totalRevenue = invoices.reduce((a, inv) => a + Number(inv.paid || 0), 0);
        const myPendingPayments = invoices.filter(i => i.customer === displayName && (i.status === 'Pending' || i.status === 'Partial')).length;
        const myBookingsCount = bookings.filter(b => b.customer === displayName).length;
        const myVehiclesCount = vehicles.filter(v => v.owner === displayName).length;

        setStats({
          bookings:  bookings.length,
          vehicles:  vehicles.length,
          customers: customers.length,
          revenue:   totalRevenue >= 1000000
            ? (totalRevenue / 1000000).toFixed(1) + 'M'
            : (totalRevenue / 1000).toFixed(0) + 'K',
          rating: avgRating,
          latestFeedback: latestFeedback,
          myFeedbacksCount: myFeedbacks.length,
          myBookings: myBookingsCount,
          myVehicles: myVehiclesCount,
          myPendingPayments: myPendingPayments
        });

        // Recent bookings — latest 5
        const myBookings = isVehicleOwner ? bookings.filter(b => b.customer === displayName) : bookings;
        const sorted = [...myBookings].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        setRecent(sorted);

        // Activity feed generate
        const acts = [];
        bookings.slice(0, 2).forEach(b => acts.push({
          time: b.date, text: `New booking — ${b.customer} · ${b.service}`, type: 'booking'
        }));
        if (!isGarageOwner) {
          invoices.filter(i => i.status === 'Paid').slice(0, 1).forEach(i => acts.push({
            time: i.date, text: `Payment received — ${i.invoiceCode} · LKR ${Number(i.paid || 0).toLocaleString()}`, type: 'payment'
          }));
          customers.slice(0, 1).forEach(c => acts.push({
            time: c.joinDate, text: `New customer registered — ${c.fullName}`, type: 'customer'
          }));
        } else {
          myFeedbacks.slice(0, 2).forEach(f => acts.push({
            time: f.date, text: `New Feedback from ${f.customer} - ${f.rating}★`, type: 'feedback'
          }));
        }
        bookings.filter(b => b.status === 'Completed').slice(0, 1).forEach(b => acts.push({
          time: b.date, text: `Service completed — ${b.vehicle} · ${b.service}`, type: 'done'
        }));
        setActivity(acts.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5));

      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        if (!silent) setLoading(false);
      }
    };
    
    loadDashboard();
    
    // Background polling for real-time updates every 5 seconds
    const intervalId = setInterval(() => {
      loadDashboard(true);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const statCards = isGarageOwner ? [
    { label: "Total Bookings",  value: stats.bookings,  sub: "All time",           color: "#c9a227", icon: "📅" },
    { label: "Total Feedbacks", value: stats.myFeedbacksCount || 0, sub: "Customer reviews", color: "#e879f9", icon: "💬" },
    { label: "Active Services", value: garageDetails?.services?.length || 0, sub: "Offered services", color: "#60a5fa", icon: "🔧" }
  ] : isVehicleOwner ? [
    { label: "Total Bookings",  value: stats.myBookings || 0, sub: "Your bookings", color: "#c9a227", icon: "📅" },
    { label: "Active Vehicles", value: stats.myVehicles || 0, sub: "Registered", color: "#43e97b", icon: "🚗" },
    { label: "Pending Payments",value: stats.myPendingPayments || 0, sub: "To be paid", color: "#ff9800", icon: "⌛" },
  ] : [
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1>{greet}, <span>{displayName}</span> 👋</h1>

          </div>
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

            {/* Garage Details or Activity */}
            {isGarageOwner ? (
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <h3>Garage Details</h3>
                    <p>Your business info</p>
                  </div>
                  {garageDetails && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={openEditProfile} title="Edit Garage Details" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>✏️</button>
                      <button onClick={() => setConfirmObj({ isOpen: true, id: user.id })} title="Delete Garage Account" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>🗑️</button>
                    </div>
                  )}
                </div>
                {garageDetails ? (
                  <div style={{ padding: '0 20px 20px' }}>
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Business Name</div>
                      <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600 }}>{garageDetails.businessName || garageDetails.name || garageDetails.fullName}</div>
                    </div>
                    {garageDetails.businessReg && (
                      <div style={{ marginBottom: 15 }}>
                        <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Business Reg No.</div>
                        <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{garageDetails.businessReg}</div>
                      </div>
                    )}
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Address</div>
                      <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{garageDetails.garageAddress || garageDetails.address || 'N/A'}</div>
                    </div>
                    {garageDetails.garagePhone && (
                      <div style={{ marginBottom: 15 }}>
                        <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Contact Number</div>
                        <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{garageDetails.garagePhone}</div>
                      </div>
                    )}
                    {garageDetails.openHours && (
                      <div style={{ marginBottom: 15 }}>
                        <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Open Hours</div>
                        <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{garageDetails.openHours}</div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 15, paddingTop: 15, borderTop: '1px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 5 }}>Services Offered</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {(garageDetails.services && garageDetails.services.length > 0) ? (
                            garageDetails.services.map((s, i) => (
                              <span key={i} className="badge badge-blue">{s}</span>
                            ))
                          ) : (
                            <span style={{ fontSize: '.85rem', color: 'var(--text3)' }}>Services not specified</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 25, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                      <div style={{ fontSize: '.85rem', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em', fontWeight: 'bold' }}>Your Public Feedback QR Code</div>
                      <div style={{ background: '#fff', padding: 10, borderRadius: 8, display: 'inline-block', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/?page=public-feedback&garage=${encodeURIComponent(garageDetails.businessName || garageDetails.name || garageDetails.fullName || displayName)}`)}`} 
                          alt="Feedback QR Code" 
                          style={{ display: 'block', width: 130, height: 130 }} 
                        />
                      </div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text2)', marginTop: 10 }}>Print this or display it on a tablet for your customers to scan.</div>
                      {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                        <div style={{ fontSize: '.7rem', color: 'var(--red)', marginTop: 8, lineHeight: 1.3, background: 'rgba(239,68,68,0.1)', padding: 6, borderRadius: 6, display: 'inline-block' }}>
                          ⚠️ Access via your Wi-Fi IP (192.168...) for the QR to work on mobile.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>
                    Garage details not configured yet.
                  </div>
                )}
              </div>
            ) : isVehicleOwner ? (
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <h3>Profile Details</h3>
                    <p>Your vehicle owner info</p>
                  </div>
                  {vehicleOwnerDetails && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={openEditProfile} title="Edit Profile Details" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>✏️</button>
                      <button onClick={() => setConfirmObj({ isOpen: true, id: user.id })} title="Delete Account" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>🗑️</button>
                    </div>
                  )}
                </div>
                {vehicleOwnerDetails ? (
                  <div style={{ padding: '0 20px 20px' }}>
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Full Name</div>
                      <div style={{ fontSize: '.9rem', color: 'var(--text)', fontWeight: '600' }}>{vehicleOwnerDetails.fullName || vehicleOwnerDetails.username || 'N/A'}</div>
                    </div>
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Email</div>
                      <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{vehicleOwnerDetails.email || 'N/A'}</div>
                    </div>
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Phone</div>
                      <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{vehicleOwnerDetails.phone || 'N/A'}</div>
                    </div>
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>NIC</div>
                      <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{vehicleOwnerDetails.nic || 'N/A'}</div>
                    </div>
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Address</div>
                      <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{vehicleOwnerDetails.address || 'N/A'}</div>
                    </div>
                    {vehicleOwnerDetails.drivingLicense && (
                      <div style={{ marginBottom: 15 }}>
                        <div style={{ fontSize: '.8rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Driving License</div>
                        <div style={{ fontSize: '.9rem', color: 'var(--text)' }}>{vehicleOwnerDetails.drivingLicense}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '20px' }}>
                    <div className="empty-icon">🚗</div>
                    <div className="empty-text">Loading profile details...</div>
                  </div>
                )}
              </div>
            ) : (
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
            )}
          </div>
        </>
      )}

      {/* ── Edit Profile Modal ── */}
      {profileModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setProfileModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">✏️ Edit Profile</div>
              <button className="modal-close" onClick={() => setProfileModal(false)}>×</button>
            </div>
            
            <div className="form-row">
              <div className="field">
                <label>Full Name</label>
                <input name="fullName" value={profileForm.fullName || ''} onChange={handleProfileChange} />
              </div>
              <div className="field">
                <label>Email</label>
                <input name="email" value={profileForm.email || ''} onChange={handleProfileChange} />
              </div>
            </div>
            
            <div className="form-row">
              <div className="field">
                <label>Phone</label>
                <input name="phone" value={profileForm.phone || ''} onChange={handleProfileChange} />
              </div>
              {isGarageOwner ? (
                <div className="field">
                  <label>Business Name</label>
                  <input name="businessName" value={profileForm.businessName || ''} onChange={handleProfileChange} />
                </div>
              ) : (
                <div className="field">
                  <label>NIC</label>
                  <input name="nic" value={profileForm.nic || ''} onChange={handleProfileChange} />
                </div>
              )}
            </div>

            {isGarageOwner ? (
              <>
                <div className="form-row">
                  <div className="field">
                    <label>Business Reg No.</label>
                    <input name="businessReg" value={profileForm.businessReg || ''} onChange={handleProfileChange} />
                  </div>
                  <div className="field">
                    <label>Garage Phone</label>
                    <input name="garagePhone" value={profileForm.garagePhone || ''} onChange={handleProfileChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field" style={{ flex: 2 }}>
                    <label>Garage Address</label>
                    <input name="garageAddress" value={profileForm.garageAddress || ''} onChange={handleProfileChange} />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Open Hours</label>
                    <input name="openHours" value={profileForm.openHours || ''} onChange={handleProfileChange} placeholder="e.g. 8AM - 6PM" />
                  </div>
                </div>
              </>
            ) : (
              <div className="form-row">
                <div className="field">
                  <label>Home Address</label>
                  <input name="address" value={profileForm.address || ''} onChange={handleProfileChange} />
                </div>
                <div className="field">
                  <label>Driving License</label>
                  <input name="drivingLicense" value={profileForm.drivingLicense || ''} onChange={handleProfileChange} />
                </div>
              </div>
            )}

            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setProfileModal(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={saveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Message Modal ── */}
      {successMsg && (
        <div className="overlay" style={{ zIndex: 9999 }}>
          <div className="modal" style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>✅</div>
            <h3 style={{ marginBottom: '10px', fontSize: '1.4rem' }}>Success!</h3>
            <p style={{ color: 'var(--text2)', marginBottom: '25px', lineHeight: '1.5' }}>{successMsg}</p>
            <button className="btn btn-accent" style={{ width: '100%', padding: '12px' }} onClick={() => setSuccessMsg("")}>Okay</button>
          </div>
        </div>
      )}
      
      <ConfirmModal
        isOpen={confirmObj.isOpen}
        title="Delete Account"
        message="Are you absolutely sure you want to permanently delete your account? This action cannot be undone and all your data will be cleared."
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmObj({ isOpen: false, id: null })}
      />
    </div>
  );
}

