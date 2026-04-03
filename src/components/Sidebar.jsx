import "./Sidebar.css";
const nav = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "bookings",  icon: "📅", label: "Bookings" },
  { id: "customers", icon: "👤", label: "Customers" },
  { id: "vehicles",  icon: "🚗", label: "Vehicles" },
  { id: "services",  icon: "🔧", label: "Services" },
  { id: "invoices",  icon: "💳", label: "Invoices" },
  { id: "feedback",  icon: "⭐", label: "Feedback" },
  { id: "reports",   icon: "📊", label: "Reports" },
  { id: "staff",     icon: "👥", label: "Staff" },
];

export default function Sidebar({ activePage, setActivePage, user }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">⚙</div>
        <div>
          <div className="brand-name">AutoServ</div>
          <div className="brand-sub">Management System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {activePage === item.id && <span className="nav-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name || "User"}</div>
          <div className="user-role">{user?.role || "Staff"}</div>
        </div>
      </div>
    </aside>
  );
}