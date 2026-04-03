import { useState } from "react";
import { authService } from "../utils/api";
import "../style.css";

// ─── Validators ───────────────────────────────────────────────────────────────
const validators = {
  email: (v) => {
    if (!v) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter.';
    if (!/[0-9]/.test(v)) return 'Include at least one number.';
    return '';
  },
  name: (v) => {
    if (!v || !v.trim()) return 'Full name is required.';
    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!/^[a-zA-Z\s.'-]+$/.test(v)) return 'Name contains invalid characters.';
    return '';
  },
  username: (v) => {
    if (!v || !v.trim()) return 'Username is required.';
    if (v.trim().length < 3) return 'Username must be at least 3 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Username can only contain letters, numbers, underscore.';
    return '';
  },
  confirmPassword: (v, password) => {
    if (!v) return 'Please confirm your password.';
    if (v !== password) return 'Passwords do not match.';
    return '';
  },
};

// ─── Password Strength ────────────────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8)           score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^a-zA-Z0-9]/.test(password))  score++;

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#d97070', '#d4956a', '#6a9fd8', '#6dbf8a'];
  const label  = labels[score - 1] || 'Weak';
  const color  = colors[score - 1] || '#d97070';

  const requirements = [
    [password.length >= 8,           'Minimum 8 characters'],
    [/[A-Z]/.test(password),         'Uppercase letter'],
    [/[0-9]/.test(password),         'Number'],
    [/[^a-zA-Z0-9]/.test(password),  'Special character (boosts strength)'],
  ];

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: '2px', borderRadius: '2px',
            background: i <= score ? color : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '11px', color, letterSpacing: '0.04em' }}>{label} password</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px' }}>
        {requirements.map(([met, text], i) => (
          <span key={i} style={{
            fontSize: '11px',
            color: met ? '#6dbf8a' : '#5a5860',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'color 0.2s',
          }}>
            <span style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: met ? 'rgba(109,191,138,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${met ? 'rgba(109,191,138,0.4)' : 'rgba(255,255,255,0.08)'}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8px', flexShrink: 0, transition: 'all 0.2s',
            }}>
              {met ? '✓' : ''}
            </span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Field Error ──────────────────────────────────────────────────────────────
const FieldError = ({ msg }) =>
  msg ? (
    <span style={{
      fontSize: '11px', color: '#d97070',
      marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px',
    }}>
      <span style={{ fontSize: '9px' }}>⚠</span> {msg}
    </span>
  ) : null;

// ─── Register Component ───────────────────────────────────────────────────────
export default function Register({ onRegister, onBack }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "", username: "", email: "", phone: "", nic: "",
    password: "", confirm: "", role: "Vehicle Owner",
    address: "", drivingLicense: "",
    businessName: "", businessReg: "", garageAddress: "", openHours: "", garagePhone: "",
  });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── getFieldError ─────────────────────────────────────────────────────────
  const getFieldError = (field, value, allForm = form) => {
    switch (field) {
      case 'fullName': return validators.name(value);
      case 'username': return validators.username(value);
      case 'email':    return validators.email(value);
      case 'password': return validators.password(value);
      case 'confirm':  return validators.confirmPassword(value, allForm.password);
      default:         return '';
    }
  };

  // ── onChange ──────────────────────────────────────────────────────────────
  const h = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: getFieldError(name, value, newForm) }));
    }
    // confirm password re-validate when password changes
    if (name === 'password' && touched.confirm) {
      setErrors(prev => ({
        ...prev,
        confirm: validators.confirmPassword(newForm.confirm, value),
      }));
    }
  };

  // ── onBlur ────────────────────────────────────────────────────────────────
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: getFieldError(field, form[field]) }));
  };

  // ── Step 1 validation ─────────────────────────────────────────────────────
  const nextStep = (e) => {
    e.preventDefault();
    setServerError("");

    const step1Fields = ['fullName', 'username', 'email'];
    const newErrors = {};
    const newTouched = {};

    step1Fields.forEach(f => {
      newErrors[f]  = getFieldError(f, form[f]);
      newTouched[f] = true;
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    setTouched(prev => ({ ...prev, ...newTouched }));

    if (Object.values(newErrors).some(Boolean)) return;
    setStep(2);
  };

  // ── Step 2 validation + submit ────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();
    setServerError("");

    const step2Fields = ['password', 'confirm'];
    const newErrors = {};
    const newTouched = {};

    step2Fields.forEach(f => {
      newErrors[f]  = getFieldError(f, form[f]);
      newTouched[f] = true;
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    setTouched(prev => ({ ...prev, ...newTouched }));

    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const data = await authService.register(form);
      onRegister && onRegister(data);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const roleIcon = form.role === "Garage Owner" ? "🏪" : form.role === "Admin" ? "🛡️" : "🚗";

  // helper — input border style
  const borderStyle = (field) =>
    errors[field] && touched[field] ? { borderColor: '#d97070' } : {};

  return (
    <div className="avsc-screen">

      {/* ── LEFT PANEL ── */}
      <div className="avsc-left">
        <div className="avsc-mesh" />
        <div className="avsc-mesh2" />
        <div className="avsc-diag" />
        <div className="avsc-left-content">
          <div className="avsc-logo">
            <div className="avsc-logo-icon">⚙</div>
            <div>
              <div className="avsc-logo-name">Auto<span>Serve</span></div>
              <div className="avsc-logo-tag">VEHICLE SERVICE MANAGEMENT</div>
            </div>
          </div>
          <div className="avsc-hero-text">
            <h1>Join the<br /><span>AutoServe</span><br />Community.</h1>
            <p>Register to book services, track your vehicle<br />and manage your garage.</p>
          </div>
          <div className="reg-roles">
            {[
              ["🚗", "Vehicle Owner", "Book & track services"],
              ["🏪", "Garage Owner",  "Manage your garage"],
              ["🛡️", "Admin",         "Full system access"],
            ].map(([icon, role, desc]) => (
              <div
                key={role}
                className={`reg-role-card ${form.role === role ? "active" : ""}`}
                onClick={() => setForm({ ...form, role })}
              >
                <span className="reg-role-icon">{icon}</span>
                <div>
                  <div className="reg-role-name">{role}</div>
                  <div className="reg-role-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="avsc-right">
        <div className="avsc-right-nav">
          <button className="avsc-back-btn" onClick={onBack}>← Back to Login</button>
          <div className="reg-step-indicator">
            {[1, 2].map(n => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: step >= n ? "linear-gradient(135deg,#c9a227,#8b6914)" : "rgba(255,255,255,0.06)",
                  color: step >= n ? "#060810" : "rgba(240,240,236,0.35)",
                  fontWeight: 800, fontSize: 12, transition: "all 0.3s",
                }}>{n}</div>
                {n < 2 && <div style={{
                  width: 32, height: 2, borderRadius: 2,
                  background: step > n ? "linear-gradient(90deg,#c9a227,#8b6914)" : "rgba(255,255,255,0.08)",
                }} />}
              </div>
            ))}
            <span style={{ fontSize: 11, color: "rgba(240,240,236,0.38)", fontWeight: 600, marginLeft: 6 }}>
              {step === 1 ? "Account Details" : `${roleIcon} ${form.role === "Garage Owner" ? "Garage Info" : "Personal Info"} & Password`}
            </span>
          </div>
        </div>

        <div className="avsc-form-wrap">
          {serverError && <div className="avsc-error"><span>⚠</span>{serverError}</div>}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={nextStep} className="avsc-form" style={{ gap: 16 }} noValidate>
              <div className="avsc-form-header">
                <h2>Create Account</h2>
                <p>Fill in your basic information</p>
              </div>
              <div className="reg-grid">

                <div className="avsc-field">
                  <label>Full Name *</label>
                  <div className="avsc-input-wrap">
                    <span className="avsc-input-icon">👤</span>
                    <input name="fullName" value={form.fullName} onChange={h}
                      onBlur={() => handleBlur('fullName')}
                      placeholder="e.g. Nimal Perera"
                      style={borderStyle('fullName')} />
                  </div>
                  <FieldError msg={touched.fullName && errors.fullName} />
                </div>

                <div className="avsc-field">
                  <label>Username *</label>
                  <div className="avsc-input-wrap">
                    <span className="avsc-input-icon">@</span>
                    <input name="username" value={form.username} onChange={h}
                      onBlur={() => handleBlur('username')}
                      placeholder="Unique username"
                      style={borderStyle('username')} />
                  </div>
                  <FieldError msg={touched.username && errors.username} />
                </div>

                <div className="avsc-field">
                  <label>Email *</label>
                  <div className="avsc-input-wrap">
                    <span className="avsc-input-icon">✉</span>
                    <input name="email" type="email" value={form.email} onChange={h}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@email.com"
                      style={borderStyle('email')} />
                  </div>
                  <FieldError msg={touched.email && errors.email} />
                </div>

                <div className="avsc-field">
                  <label>Phone</label>
                  <div className="avsc-input-wrap">
                    <span className="avsc-input-icon">📞</span>
                    <input name="phone" value={form.phone} onChange={h} placeholder="07X-XXXXXXX" />
                  </div>
                </div>

                <div className="avsc-field">
                  <label>NIC</label>
                  <div className="avsc-input-wrap">
                    <span className="avsc-input-icon">🪪</span>
                    <input name="nic" value={form.nic} onChange={h} placeholder="9XXXXXXXXV" />
                  </div>
                </div>

                <div className="avsc-field">
                  <label>Register As *</label>
                  <div className="avsc-input-wrap">
                    <span className="avsc-input-icon">{roleIcon}</span>
                    <select name="role" value={form.role} onChange={h} style={{ paddingLeft: 40 }}>
                      <option>Vehicle Owner</option>
                      <option>Garage Owner</option>
                      <option>Admin</option>
                    </select>
                  </div>
                </div>

              </div>
              <button type="submit" className="avsc-submit">Next Step →</button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={submit} className="avsc-form" style={{ gap: 16 }} noValidate>
              <div className="avsc-form-header">
                <h2>{roleIcon} {form.role === "Garage Owner" ? "Garage Details" : "Personal Details"}</h2>
              </div>
              <div className="reg-grid">

                {form.role === "Vehicle Owner" && (<>
                  <div className="avsc-field">
                    <label>Address</label>
                    <div className="avsc-input-wrap">
                      <span className="avsc-input-icon">📍</span>
                      <input name="address" value={form.address} onChange={h} placeholder="City / District" />
                    </div>
                  </div>
                  <div className="avsc-field">
                    <label>Driving License No.</label>
                    <div className="avsc-input-wrap">
                      <span className="avsc-input-icon">🪪</span>
                      <input name="drivingLicense" value={form.drivingLicense} onChange={h} placeholder="DL Number" />
                    </div>
                  </div>
                </>)}

                {form.role === "Garage Owner" && (<>
                  <div className="avsc-field">
                    <label>Business Name</label>
                    <div className="avsc-input-wrap">
                      <span className="avsc-input-icon">🏪</span>
                      <input name="businessName" value={form.businessName} onChange={h} placeholder="ABC Auto Garage" />
                    </div>
                  </div>
                  <div className="avsc-field">
                    <label>Business Reg. No.</label>
                    <div className="avsc-input-wrap">
                      <span className="avsc-input-icon">📋</span>
                      <input name="businessReg" value={form.businessReg} onChange={h} placeholder="REG-XXXXX" />
                    </div>
                  </div>
                  <div className="avsc-field" style={{ gridColumn: "1/-1" }}>
                    <label>Garage Address</label>
                    <div className="avsc-input-wrap">
                      <span className="avsc-input-icon">📍</span>
                      <input name="garageAddress" value={form.garageAddress} onChange={h} placeholder="Full address" />
                    </div>
                  </div>
                  <div className="avsc-field">
                    <label>Operating Hours</label>
                    <div className="avsc-input-wrap">
                      <span className="avsc-input-icon">🕐</span>
                      <input name="openHours" value={form.openHours} onChange={h} placeholder="8AM – 6PM" />
                    </div>
                  </div>
                  <div className="avsc-field">
                    <label>Garage Phone</label>
                    <div className="avsc-input-wrap">
                      <span className="avsc-input-icon">📞</span>
                      <input name="garagePhone" value={form.garagePhone} onChange={h} placeholder="011-XXXXXXX" />
                    </div>
                  </div>
                </>)}

                {form.role === "Admin" && (
                  <div className="avsc-field" style={{ gridColumn: "1/-1" }}>
                    <div className="reg-admin-note">
                      🛡️ Admin accounts have full system access.
                    </div>
                  </div>
                )}

                <div className="avsc-field">
                  <label>Password *</label>
                  <div className="avsc-input-wrap">
                    <span className="avsc-input-icon">🔒</span>
                    <input name="password" type="password" value={form.password} onChange={h}
                      onBlur={() => handleBlur('password')}
                      placeholder="Min. 8 characters"
                      style={borderStyle('password')} />
                  </div>
                  <PasswordStrength password={form.password} />
                  <FieldError msg={touched.password && errors.password} />
                </div>

                <div className="avsc-field">
                  <label>Confirm Password *</label>
                  <div className="avsc-input-wrap">
                    <span className="avsc-input-icon">🔒</span>
                    <input name="confirm" type="password" value={form.confirm} onChange={h}
                      onBlur={() => handleBlur('confirm')}
                      placeholder="Repeat password"
                      style={borderStyle('confirm')} />
                  </div>
                  <FieldError msg={touched.confirm && errors.confirm} />
                </div>

              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="avsc-submit"
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: "rgba(240,240,236,0.65)", boxShadow: "none", border: "1px solid rgba(255,255,255,0.10)" }}
                  onClick={() => { setStep(1); setServerError(""); }}
                >← Back</button>
                <button type="submit" className="avsc-submit" style={{ flex: 2 }} disabled={loading}>
                  {loading
                    ? <span className="avsc-spinner-row"><span className="avsc-spinner" />Creating…</span>
                    : "✅ Create Account"
                  }
                </button>
              </div>
            </form>
          )}

          <div className="auth-link-row" style={{ marginTop: 16 }}>
            Already have an account?{" "}
            <button className="auth-link" onClick={onBack}>Sign in →</button>
          </div>
        </div>

        <div className="avsc-right-footer">
          © 2025 AutoServe · Vehicle Service Management System
        </div>
      </div>
    </div>
  );
}