import "./Header.css";
const titles = {
 
  bookings:  "Booking Management",
  customers: "Customer Management",
  vehicles:  "Vehicle Management",
  services:  "Service Management",
  invoices:  "Invoice & Payment",
  feedback:  "Feedback & Reviews",
  reports:   "Reports & Analytics",
  staff:     "Staff Management",
};

export default function Header({ activePage, user, onLogout }) {
  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="header-title">{titles[activePage] || "Dashboard"}</h2>
        <span className="header-date">{now}</span>
      </div>
      <div className="header-right">
        <div className="header-user">
          <span className="header-username">{user?.name || "User"}</span>
          <span className="header-role-badge">{user?.role || "Staff"}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          ⏻ Logout
        </button>
      </div>
    </header>
  );
}