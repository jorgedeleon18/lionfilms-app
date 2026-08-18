import { useApp } from '../context/AppContext';

export default function SiteFooter() {
  const { gabySession, setGabyLoginOpen, logoutGaby } = useApp();

  return (
    <footer>
      Lion Films × tu app. Colores, textos y fotos son placeholders para ir ajustando juntos.
      <div style={{ marginTop: 8 }}>
        {gabySession ? (
          <a onClick={logoutGaby} style={{ cursor: 'pointer', fontSize: 11.5, color: 'var(--text-low)', textDecoration: 'underline' }}>
            Cerrar sesión del equipo
          </a>
        ) : (
          <a onClick={() => setGabyLoginOpen(true)} style={{ cursor: 'pointer', fontSize: 11.5, color: 'var(--text-low)', textDecoration: 'underline' }}>
            Acceso del equipo
          </a>
        )}
      </div>
    </footer>
  );
}
