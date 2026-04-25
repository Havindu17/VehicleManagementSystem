import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="overlay" style={{ zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ 
        maxWidth: 400, 
        padding: '24px', 
        textAlign: 'center',
        background: '#1a1f2e',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚠️</div>
        <h3 style={{ margin: '0 0 10px', color: 'var(--text)', fontSize: '1.25rem' }}>{title}</h3>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} style={{ flex: 1 }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
