import { useState, useEffect } from "react";
import { api } from "../utils/api";

const ROLE_META = {
  "Vehicle Owner": { color: "#4fc3f7", bg: "rgba(79,195,247,0.12)", icon: "🚗" },
  "Garage Owner":  { color: "#81c784", bg: "rgba(129,199,132,0.12)", icon: "🏪" },
  "Admin":         { color: "#ffb74d", bg: "rgba(255,183,77,0.12)",  icon: "🛡️" },
};

const STATUS_META = {
  active:   { color: "#6dbf8a", bg: "rgba(109,191,138,0.12)", label: "Active" },
  inactive: { color: "#d97070", bg: "rgba(217,112,112,0.12)", label: "Inactive" },
};

const Avatar = ({ name, role, size = 44 }) => {
  const initials = (name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const meta = ROLE_META[role] || ROLE_META["Vehicle Owner"];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}11)`,
      border: `2px solid ${meta.color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.34, color: meta.color,
      flexShrink: 0, letterSpacing: "-0.5px",
    }}>{initials}</div>
  );
};

const RoleBadge = ({ role }) => {
  const meta = ROLE_META[role] || ROLE_META["Vehicle Owner"];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      color: meta.color, background: meta.bg,
      border: `1px solid ${meta.color}33`,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>{meta.icon} {role}</span>
  );
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.active;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      color: meta.color, background: meta.bg, border: `1px solid ${meta.color}33`,
    }}>{meta.label}</span>
  );
};

const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0, opacity: 0.75 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: "rgba(240,240,236,0.35)", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ fontSize: 13, color: "rgba(240,240,236,0.85)", marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
};

const ProfileModal = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(145deg, #10131f, #0d1020)",
        border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18,
        width: "100%", maxWidth: 480, padding: 28, position: "relative",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        maxHeight: "85vh", overflowY: "auto",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 8, color: "rgba(240,240,236,0.6)", cursor: "pointer",
          fontSize: 16, width: 30, height: 30, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>✕</button>

        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 22 }}>
          <Avatar name={user.fullName || user.username} role={user.role} size={62} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f0ec", marginBottom: 4 }}>
              {user.fullName || user.username}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status || "active"} />
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />

        <InfoRow icon="@"  label="Username" value={user.username} />
        <InfoRow icon="✉"  label="Email"    value={user.email} />
        <InfoRow icon="📞" label="Phone"    value={user.phone} />
        <InfoRow icon="🪪" label="NIC"      value={user.nic} />
        <InfoRow icon="📅" label="Joined"   value={user.joinedAt} />

        {user.role === "Vehicle Owner" && (<>
          <InfoRow icon="📍" label="Address"         value={user.address} />
          <InfoRow icon="🪪" label="Driving License" value={user.drivingLicense} />
        </>)}

        {user.role === "Garage Owner" && (<>
          <InfoRow icon="🏪" label="Business Name"   value={user.businessName} />
          <InfoRow icon="📋" label="Business Reg."   value={user.businessReg} />
          <InfoRow icon="📍" label="Garage Address"  value={user.garageAddress} />
          <InfoRow icon="🕐" label="Operating Hours" value={user.openHours} />
          <InfoRow icon="📞" label="Garage Phone"    value={user.garagePhone} />
        </>)}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Profiles({ user }) {

  if (!user || user.role !== "Admin") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "60vh", gap: 12 }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(240,240,236,0.7)" }}>
          Admin Access Only
        </div>
        <div style={{ fontSize: 13, color: "rgba(240,240,236,0.35)" }}>
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [filterRole,   setFilterRole]   = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected,     setSelected]     = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      // Uses api.get() from utils/api.js — automatically sends autoserve_token
      const data = await api.get("/auth/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (u.fullName  || "").toLowerCase().includes(q) ||
      (u.username  || "").toLowerCase().includes(q) ||
      (u.email     || "").toLowerCase().includes(q);
    const matchRole   = filterRole   === "All" || u.role === filterRole;
    const matchStatus = filterStatus === "All" || (u.status || "active") === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const counts = {
    all:    users.length,
    vo:     users.filter(u => u.role === "Vehicle Owner").length,
    go:     users.filter(u => u.role === "Garage Owner").length,
    admin:  users.filter(u => u.role === "Admin").length,
    active: users.filter(u => (u.status || "active") === "active").length,
  };

  const chip = (label, val, cur, set, color = "#4fc3f7") => (
    <button onClick={() => set(val)} style={{
      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      cursor: "pointer", transition: "all 0.2s",
      background: cur === val ? color + "22" : "rgba(255,255,255,0.04)",
      color:      cur === val ? color        : "rgba(240,240,236,0.45)",
      border:     `1px solid ${cur === val ? color + "55" : "rgba(255,255,255,0.08)"}`,
    }}>{label}</button>
  );

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "60vh", gap: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.08)",
        borderTop: "3px solid #4fc3f7",
        animation: "avsc-spin 0.8s linear infinite",
      }} />
      <div style={{ fontSize: 13, color: "rgba(240,240,236,0.35)" }}>Loading users…</div>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "60vh", gap: 12 }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#d97070" }}>{error}</div>
      <div style={{ fontSize: 12, color: "rgba(240,240,236,0.35)" }}>
        Make sure the backend is running and{" "}
        <code style={{ color: "#4fc3f7" }}>/api/users</code> is accessible.
      </div>
      <button onClick={loadUsers} style={{
        marginTop: 8, padding: "8px 20px", borderRadius: 10,
        background: "rgba(79,195,247,0.1)", border: "1px solid rgba(79,195,247,0.3)",
        color: "#4fc3f7", cursor: "pointer", fontSize: 13, fontWeight: 600,
      }}>↺ Retry</button>
    </div>
  );

  return (
    <div style={{ padding: "0 4px" }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0f0ec", margin: 0, marginBottom: 4 }}>
          👥 User Profiles
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(240,240,236,0.4)" }}>
          All registered users — Vehicle Owners, Garage Owners &amp; Admins
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))",
        gap: 12, marginBottom: 22 }}>
        {[
          ["Total Users",    counts.all,    "#c9a227"],
          ["Vehicle Owners", counts.vo,     "#4fc3f7"],
          ["Garage Owners",  counts.go,     "#81c784"],
          ["Admins",         counts.admin,  "#ffb74d"],
          ["Active",         counts.active, "#6dbf8a"],
        ].map(([label, val, clr]) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: clr }}>{val}</div>
            <div style={{ fontSize: 11, color: "rgba(240,240,236,0.4)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "7px 14px", flex: "1 1 200px", maxWidth: 280,
        }}>
          <span style={{ opacity: 0.4 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, username, email…"
            style={{ background: "none", border: "none", outline: "none",
              color: "#f0f0ec", fontSize: 13, flex: 1 }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {chip("All Roles",  "All",           filterRole, setFilterRole)}
          {chip("🚗 Vehicle", "Vehicle Owner", filterRole, setFilterRole, "#4fc3f7")}
          {chip("🏪 Garage",  "Garage Owner",  filterRole, setFilterRole, "#81c784")}
          {chip("🛡️ Admin",   "Admin",         filterRole, setFilterRole, "#ffb74d")}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {chip("All Status", "All",      filterStatus, setFilterStatus)}
          {chip("Active",     "active",   filterStatus, setFilterStatus, "#6dbf8a")}
          {chip("Inactive",   "inactive", filterStatus, setFilterStatus, "#d97070")}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "rgba(240,240,236,0.3)", marginBottom: 14 }}>
        Showing {filtered.length} of {users.length} users
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0",
          color: "rgba(240,240,236,0.3)", fontSize: 14 }}>
          No users found matching your filters.
        </div>
      ) : (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map(u => {
            const meta = ROLE_META[u.role] || ROLE_META["Vehicle Owner"];
            return (
              <div key={u.id} onClick={() => setSelected(u)} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "18px 20px",
                cursor: "pointer", transition: "all 0.2s",
                position: "relative", overflow: "hidden",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = `1px solid ${meta.color}44`;
                  e.currentTarget.style.background = "rgba(255,255,255,0.055)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${meta.color}88, transparent)`,
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Avatar name={u.fullName || u.username} role={u.role} size={46} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#f0f0ec",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.fullName || u.username}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(240,240,236,0.4)", marginTop: 2 }}>
                      @{u.username}
                    </div>
                  </div>
                  <StatusBadge status={u.status || "active"} />
                </div>

                <div style={{ fontSize: 12, color: "rgba(240,240,236,0.5)",
                  marginBottom: 12, display: "flex", gap: 6, alignItems: "center" }}>
                  <span>✉</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.email}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <RoleBadge role={u.role} />
                  <span style={{ fontSize: 11, color: "rgba(240,240,236,0.28)" }}>
                    Joined {u.joinedAt || "—"}
                  </span>
                </div>

                {u.role === "Garage Owner" && u.businessName && (
                  <div style={{ marginTop: 10, paddingTop: 10,
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    fontSize: 12, color: "rgba(240,240,236,0.4)",
                    display: "flex", gap: 6, alignItems: "center" }}>
                    <span>🏪</span> {u.businessName}
                  </div>
                )}

                <div style={{ marginTop: 12, fontSize: 11,
                  color: meta.color + "99", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 4 }}>
                  View full profile →
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <ProfileModal user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}