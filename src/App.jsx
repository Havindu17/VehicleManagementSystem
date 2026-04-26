import { useState, useEffect } from "react";
import { authService } from "./utils/api";

import Landing            from "./pages/Landing";
import Login              from "./pages/Login";
import Register           from "./pages/Register";
import Dashboard          from "./pages/Dashboard";
import BookingManagement  from "./pages/BookingManagement";
import CustomerManagement from "./pages/CustomerManagement";
import VehicleManagement  from "./pages/VehicleManagement";
import ServiceManagement  from "./pages/ServiceManagement";
import InvoicePayment     from "./pages/InvoicePayment";
import Feedback           from "./pages/Feedback";
import Profiles           from "./pages/Profiles";   // ← NEW
import PublicFeedback     from "./pages/PublicFeedback";

import "./style.css";

const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"⊞",  roles:["Admin","Garage Owner","Vehicle Owner"] },
  { id:"bookings",  label:"Bookings",  icon:"📅", roles:["Admin","Garage Owner","Vehicle Owner"] },
  { id:"customers", label:"Customers", icon:"👤", roles:["Admin"] },
  { id:"vehicles",  label:"Vehicles",  icon:"🚗", roles:["Admin","Vehicle Owner"] },
  { id:"services",  label:"Services",  icon:"🔧", roles:["Admin","Garage Owner"] },
  { id:"invoices",  label:"Invoices",  icon:"🧾", roles:["Admin","Garage Owner","Vehicle Owner"] },
  { id:"feedback",  label:"Feedback",  icon:"⭐", roles:["Admin","Garage Owner","Vehicle Owner"] },
  { id:"profiles",  label:"Profiles",  icon:"👥", roles:["Admin"] },   // ← NEW — Admin only
];

export default function App() {
  const [user,       setUser]       = useState(null);
  const [authPage,   setAuthPage]   = useState("landing");
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogin    = (userData) => { setUser(userData); setActivePage("dashboard"); };
  const handleRegister = (userData) => { setUser(null); setAuthPage("login"); };
  const handleLogout   = () => { authService.logout(); setUser(null); setAuthPage("landing"); };

  const href = window.location.href;
  const isPublicFeedback = href.includes('page=public-feedback');
  let feedbackGarage = 'Our Garage';
  if (isPublicFeedback) {
    const match = href.match(/garage=([^&]+)/);
    if (match) feedbackGarage = decodeURIComponent(match[1]);
    return <PublicFeedback garageName={feedbackGarage} />;
  }

  if (!user) {
    if (authPage === "landing") {
      return (
        <Landing
          onLogin={() => setAuthPage("login")}
          onRegister={() => setAuthPage("register")}
        />
      );
    }
    if (authPage === "register") {
      return (
        <Register
          onRegister={handleRegister}
          onBack={() => setAuthPage("login")}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setAuthPage("register")}
        onBack={() => setAuthPage("landing")}
      />
    );
  }

  const userRole     = user.role || "Vehicle Owner";
  const userInitials = (user.fullName || user.username || "U")
    .split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const visibleNav   = NAV.filter(n => n.roles.includes(userRole));

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":  return <Dashboard user={user} />;
      case "bookings":   return <BookingManagement user={user} />;
      case "customers":  return <CustomerManagement />;
      case "vehicles":   return <VehicleManagement user={user} />;
      case "services":   return <ServiceManagement />;
      case "invoices":   return <InvoicePayment user={user} />;
      case "feedback":   return <Feedback user={user} />;
      case "profiles":   return <Profiles user={user} />;   // ← NEW
      default:           return <Dashboard user={user} />;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">Auto<span>Serve</span></div>
          <div className="sidebar-logo-sub">Vehicle Service System</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-label">Main Menu</div>
          {visibleNav.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-avatar">{userInitials}</div>
          <div style={{ flex:1, overflow:"hidden" }}>
            <div className="user-name" style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user.fullName || user.username}
            </div>
            <div className="user-role">{userRole}</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{
            background:"var(--red-dim)", border:"1px solid rgba(239,68,68,.22)",
            borderRadius:7, padding:"5px 8px", color:"var(--red)",
            cursor:"pointer", fontSize:".78rem", flexShrink:0,
          }}>⏻</button>
        </div>
      </aside>

      <div className="main-area">
        <header className="header">
          <div className="header-title">
            {visibleNav.find(n => n.id === activePage)?.label || "Dashboard"}
          </div>
          <div className="header-right">
            <div className="header-chip">
              {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}
            </div>
            <div className="header-chip">
              {userRole === "Admin" ? "🛡️" : userRole === "Garage Owner" ? "🏪" : "🚗"} {userRole}
            </div>
            <button className="header-logout" onClick={handleLogout}>⏻ Logout</button>
          </div>
        </header>
        <main className="page-content">{renderPage()}</main>
      </div>
    </div>
  );
}