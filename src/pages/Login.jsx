import { useState } from "react";
import { authService } from "../utils/api";
import "../style.css";

export default function Login({ onLogin, onRegister, onBack }) {
  const [form, setForm]         = useState({ username: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const h = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await authService.login(form.username, form.password);
      onLogin(user);
    } catch (err) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avsc-screen">
      <div className="avsc-left">
        <div className="avsc-mesh" />
        <div className="avsc-mesh2" />
        <div className="avsc-car-wrap">
          <svg viewBox="0 0 860 380" xmlns="http://www.w3.org/2000/svg" className="avsc-car-svg">
            <path d="M80,270 L65,248 L72,185 L125,145 L230,112 L370,98 L510,96 L640,108 L740,148 L798,198 L812,250 L812,272 L80,272 Z" fill="none" stroke="#c9a227" strokeWidth="1.4" strokeDasharray="6 3" opacity="0.6"/>
            <path d="M200,148 L250,104 L375,86 L520,84 L618,102 L710,142" fill="none" stroke="#c9a227" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.5"/>
            <path d="M638,108 L740,148 L798,198" fill="none" stroke="#e8b84b" strokeWidth="2" opacity="0.65"/>
            <path d="M250,148 L288,108 L390,92 L520,90 L600,106 L640,144 Z" fill="rgba(201,162,39,0.04)" stroke="#c9a227" strokeWidth="1" opacity="0.45"/>
            <circle cx="210" cy="278" r="56" fill="none" stroke="#c9a227" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.55"/>
            <circle cx="210" cy="278" r="36" fill="none" stroke="#c9a227" strokeWidth="0.8" opacity="0.30"/>
            <circle cx="210" cy="278" r="5"  fill="#c9a227" opacity="0.6"/>
            <circle cx="668" cy="278" r="56" fill="none" stroke="#c9a227" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.55"/>
            <circle cx="668" cy="278" r="36" fill="none" stroke="#c9a227" strokeWidth="0.8" opacity="0.30"/>
            <circle cx="668" cy="278" r="5"  fill="#c9a227" opacity="0.6"/>
            <ellipse cx="800" cy="220" rx="12" ry="7" fill="rgba(232,184,75,0.5)" stroke="#e8b84b" strokeWidth="1"/>
            <circle cx="800" cy="220" r="5" fill="#e8b84b" opacity="0.8" className="avsc-glow"/>
          </svg>
        </div>
        <div className="avsc-left-content">
          <div className="avsc-logo">
            <div className="avsc-logo-icon">⚙</div>
            <div>
              <div className="avsc-logo-name">Auto<span>Serve</span></div>
              <div className="avsc-logo-tag">VEHICLE SERVICE MANAGEMENT</div>
            </div>
          </div>
          <div className="avsc-hero-text">
            <h1>Precision<br/><span>Engineering</span><br/>Meets Care.</h1>
            <p>Sri Lanka's trusted vehicle service platform.<br/>Delivering excellence for over 10 years.</p>
          </div>
          <div className="avsc-stats">
            {[["4,800+","Vehicles"], ["98%","Satisfied"], ["10+","Years"]].map(([v,l]) => (
              <div className="avsc-stat" key={l}>
                <span className="avsc-stat-v">{v}</span>
                <span className="avsc-stat-l">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="avsc-diag" />
      </div>

      <div className="avsc-right">
        <div className="avsc-right-nav">
          {onBack && <button className="avsc-back-btn" onClick={onBack}>← Home</button>}
          <button className="avsc-switch-btn" onClick={onRegister}>
            New here? <span>Register →</span>
          </button>
        </div>

        <div className="avsc-form-wrap">
          <div className="avsc-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to manage your vehicle services</p>
          </div>

          {error && <div className="avsc-error"><span>⚠</span> {error}</div>}

          <form onSubmit={submit} className="avsc-form">
            <div className="avsc-field">
              <label>Username</label>
              <div className="avsc-input-wrap">
                <span className="avsc-input-icon">👤</span>
                <input
                  name="username"
                  value={form.username}
                  onChange={h}
                  placeholder="Enter your username"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="avsc-field">
              <label>Password</label>
              <div className="avsc-input-wrap">
                <span className="avsc-input-icon">🔒</span>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={h}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="avsc-eye"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button type="submit" className="avsc-submit" disabled={loading}>
              {loading
                ? <span className="avsc-spinner-row"><span className="avsc-spinner"/>Signing in…</span>
                : <>🔐 Sign In</>
              }
            </button>
          </form>

          {/* Demo credentials */}
          <div className="avsc-demo">
            <div className="avsc-demo-title">Demo Credentials</div>
            {[
              ["Admin",         "admin",   "admin123"],
              ["Garage Owner",  "garage1", "garage123"],
              ["Vehicle Owner", "owner1",  "owner123"],
            ].map(([role, user, pass]) => (
              <div
                key={role}
                className="avsc-demo-row"
                onClick={() => setForm({ username: user, password: pass })}
                title="Click to fill"
              >
                <span className="avsc-demo-role">{role}</span>
                <code>{user} / {pass}</code>
              </div>
            ))}
            <div className="avsc-demo-hint">↑ Click any row to autofill</div>
          </div>
        </div>

        <div className="avsc-right-footer">
          © 2025 AutoServe · Vehicle Service Management System
        </div>
      </div>
    </div>
  );
}