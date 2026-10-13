import { useApp } from '../context/AppContext';
import lionHead from '../assets/lion-head.png';

export default function SiteFooter() {
  const { gabySession, setGabyLoginOpen, logoutGaby } = useApp();

  return (
    <footer>
      © {new Date().getFullYear()} Lion Films — Alquiler de equipos audiovisuales
      <div style={{ marginTop: 14 }}>
        {gabySession ? (
          <a className="nav-icon-btn nav-icon-btn-staff" onClick={logoutGaby} style={{ display: 'inline-flex', cursor: 'pointer' }}>
            <img src={lionHead} alt="" style={{ width: 15, height: 15 }} /> Cerrar sesión Staff
          </a>
        ) : (
          <a className="nav-icon-btn nav-icon-btn-staff" onClick={() => setGabyLoginOpen(true)} style={{ display: 'inline-flex', cursor: 'pointer' }}>
            <img src={lionHead} alt="" style={{ width: 15, height: 15 }} /> Ingresar Staff
          </a>
        )}
      </div>
    </footer>
  );
}
