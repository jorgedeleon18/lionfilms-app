import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function GabyLoginModal() {
  const { gabyLoginOpen, setGabyLoginOpen, gabyLoginError, gabyLoginLoading, loginGaby } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!gabyLoginOpen) return null;

  const submit = (e) => {
    e.preventDefault();
    loginGaby(email, password);
  };

  return (
    <div className="drawer-overlay show" onClick={() => setGabyLoginOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        style={{ width: '100%', maxWidth: 360, padding: 28, borderRadius: 'var(--radius-lg)', background: 'rgba(28,16,46,0.96)', backdropFilter: 'blur(24px)', border: '1px solid var(--border)' }}
      >
        <h3 style={{ marginBottom: 6 }}>👑 Ingreso de Gaby</h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-mid)', marginBottom: 18 }}>Solo Gaby puede entrar acá para gestionar pedidos, fechas y clientes.</p>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {gabyLoginError && <p style={{ color: '#ff8080', fontSize: 12.5, marginBottom: 12 }}>{gabyLoginError}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button type="button" className="btn-ghost" onClick={() => setGabyLoginOpen(false)}>Cancelar</button>
          <button type="submit" className="btn-navy" disabled={gabyLoginLoading}>{gabyLoginLoading ? 'Entrando…' : 'Entrar'}</button>
        </div>
      </form>
    </div>
  );
}
