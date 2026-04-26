import { useState, useEffect } from 'react';
import { feedbackService, garageService } from '../utils/api';
import '../style.css';

const STARS = n => '★'.repeat(n) + '☆'.repeat(5-n);

const StarPicker = ({ value, onChange }) => (
  <div style={{ display:'flex', gap:10, justifyContent: 'center', margin: '20px 0' }}>
    {[1,2,3,4,5].map(i => (
      <button key={i} type="button" onClick={() => onChange(i)} style={{
        background:'none', border:'none', cursor:'pointer', fontSize:42, lineHeight:1,
        color: i <= value ? '#ffc83c' : 'var(--border2)',
        transform: i <= value ? 'scale(1.15)' : 'scale(1)',
        transition:'color 0.15s, transform 0.1s',
      }}>★</button>
    ))}
  </div>
);

export default function PublicFeedback({ garageName }) {
  const [form, setForm] = useState({
    customer: '',
    garage: garageName !== 'Our Garage' && garageName ? garageName : '',
    service: '',
    rating: 5,
    comment: ''
  });
  const [garages, setGarages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    garageService.getAll().then(g => {
      if (g && g.length > 0) setGarages(g);
    }).catch(e => console.error(e));
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer.trim()) return setError('Please enter your full name.');
    if (!form.garage) return setError('Please select a garage.');
    if (!form.comment.trim()) return setError('Please provide a comment.');

    setLoading(true);
    try {
      await feedbackService.create({
        customer: form.customer,
        garage: form.garage,
        service: form.service,
        rating: form.rating,
        comment: form.comment,
        date: new Date().toISOString().slice(0, 10),
        status: 'Pending'
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0d14', padding: 20 }}>
        <div style={{ background: 'var(--surface)', padding: 40, borderRadius: 'var(--r)', textAlign: 'center', maxWidth: 400, width: '100%', borderTop: '4px solid var(--green)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>✅</div>
          <h2 style={{ marginBottom: 15, color: 'var(--text)' }}>Thank You!</h2>
          <p style={{ color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>
            Your feedback for <strong>{garageName}</strong> has been successfully submitted. We appreciate your time!
          </p>
          <button className="btn btn-green" style={{ width: '100%', padding: 12 }} onClick={() => window.close()}>Close Window</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0d14', padding: 20 }}>
      <div style={{ background: 'var(--surface)', padding: '30px 25px', borderRadius: 'var(--r)', maxWidth: 450, width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 25 }}>
          <div style={{ fontSize: '3rem', marginBottom: 10 }}>⭐</div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text)', marginBottom: 5 }}>Leave a Review</h2>
          <p style={{ color: 'var(--text2)', fontSize: '.9rem' }}>How was your experience at <strong style={{ color: 'var(--accent)' }}>{garageName}</strong>?</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '10px 14px', borderRadius: 6, marginBottom: 20, fontSize: '.85rem', border: '1px solid rgba(239,68,68,0.3)' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />

          <div className="field" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Garage *</label>
            {garageName !== 'Our Garage' && garageName ? (
              <input 
                value={garageName} 
                disabled 
                style={{ padding: '12px 14px', fontSize: '1rem', background: 'var(--surface2)', color: 'var(--text)', opacity: 0.8 }}
              />
            ) : (
              <select
                name="garage"
                value={form.garage}
                onChange={handleChange}
                style={{ padding: '12px 14px', fontSize: '1rem', background: 'var(--surface2)', color: 'var(--text)' }}
              >
                <option value="">-- Select Garage --</option>
                {garages.map(g => (
                  <option key={g.id} value={g.businessName || g.name || g.fullName}>
                    {g.businessName || g.name || g.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Your Name *</label>
            <input 
              name="customer" 
              value={form.customer} 
              onChange={handleChange} 
              placeholder="Enter your registered name..." 
              style={{ padding: '12px 14px', fontSize: '1rem', background: 'var(--surface2)' }}
            />
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Service Received (Optional)</label>
            <input 
              name="service" 
              value={form.service} 
              onChange={handleChange} 
              placeholder="e.g. Full Service, Oil Change" 
              style={{ padding: '12px 14px', fontSize: '1rem', background: 'var(--surface2)' }}
            />
          </div>

          <div className="field" style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Comment *</label>
            <textarea 
              name="comment" 
              value={form.comment} 
              onChange={handleChange} 
              rows={4} 
              placeholder="Tell us about your experience..." 
              style={{ padding: '12px 14px', fontSize: '1rem', background: 'var(--surface2)', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-accent" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 8 }}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
