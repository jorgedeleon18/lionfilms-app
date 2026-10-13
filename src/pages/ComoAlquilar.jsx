import lionLogoColor from '../assets/lion-logo-color.png';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TERMS } from '../lib/condiciones';

const STEPS = [
  { n: 1, title: 'Selección de equipos', body: 'Explorá el catálogo por categoría: cámaras, lentes, trípodes, iluminación, audio y accesorios. Consultá las especificaciones técnicas, las imágenes y los precios de referencia de cada producto.' },
  { n: 2, title: 'Selección de fechas', body: 'Verificá la disponibilidad en el calendario de cada equipo. Seleccioná las fechas de retiro y devolución, y agregá al carrito todos los elementos que necesites para tu producción.' },
  { n: 3, title: 'Registro de clientes', body: 'Antes de realizar el primer pedido, completá el formulario de Alta de Clientes con tus datos. Una vez registrado, no será necesario repetir este paso en futuras solicitudes.' },
  { n: 4, title: 'Solicitud de alquiler', body: 'Enviá tu solicitud desde el carrito por WhatsApp o correo electrónico. El equipo de Lion Rental verificará la disponibilidad y se pondrá en contacto para confirmar la reserva, coordinar el pago y establecer las condiciones de entrega.' },
  { n: 5, title: 'Retiro y devolución', body: 'Una vez confirmada la reserva, se coordinarán los días y horarios de retiro y devolución del equipo. Ambas instancias se realizarán de acuerdo con las condiciones previamente acordadas.' },
];


export default function ComoAlquilar() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== '#condiciones') return;
    const t = setTimeout(() => document.getElementById('condiciones')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    return () => clearTimeout(t);
  }, [hash]);
  return (
    <main className="view active">
      <div className="page-shell">
        <div className="side-watermark"><img src={lionLogoColor} alt="" /></div>
        <div className="info-page">
          <h1>¿Cómo alquilar en Lion Rental?</h1>
          {STEPS.map((s) => (
            <div className="step-item" key={s.n}>
              <div className="step-num">{s.n}</div>
              <div><h4>{s.title}</h4><p>{s.body}</p></div>
            </div>
          ))}

          <details className="cond-box" id="condiciones" open={hash === '#condiciones' ? true : undefined}>
            <summary>Bases y condiciones de alquiler</summary>
            <div className="cond-list">
              {TERMS.map(([t, b], i) => (
                <div key={t}>
                  <h5>{String(i + 1).padStart(2, '0')}. {t}</h5>
                  <p>{b}</p>
                </div>
              ))}
            </div>
            <p className="cond-note">Al alquilar con Lion Films aceptás estas condiciones.</p>
          </details>
        </div>
      </div>
    </main>
  );
}
