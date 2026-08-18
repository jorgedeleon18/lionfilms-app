import lionLogoColor from '../assets/lion-logo-color.png';

const STEPS = [
  { n: 1, title: 'Elegís el equipo', body: 'Recorré el listado por categoría — cámaras, lentes, trípodes, luces, audio o accesorios — y mirá specs, fotos y precio de referencia.' },
  { n: 2, title: 'Marcás las fechas', body: 'En cada producto vas a ver un calendario con los días disponibles en verde. Elegís retiro y devolución, y sumás todo lo que necesites al carrito.' },
  { n: 3, title: 'Te registrás (solo la primera vez)', body: 'Antes de mandar tu primer pedido completás la Alta de Clientes con tus datos. De ahí en adelante no te lo vuelve a pedir.' },
  { n: 4, title: 'Enviás el pedido', body: 'Desde el carrito lo mandás por WhatsApp o mail. Gaby lo recibe, confirma disponibilidad y coordina con vos el pago y la entrega — todo eso queda fuera de la web.' },
  { n: 5, title: 'Retirás el equipo', body: 'Coordinás día y horario de retiro y devolución directamente con Gaby.' },
];

export default function ComoAlquilar() {
  return (
    <main className="view active">
      <div className="page-shell">
        <div className="side-watermark"><img src={lionLogoColor} alt="" /></div>
        <div className="info-page">
          <h1>¿Cómo alquilar en Lion Films?</h1>
          {STEPS.map((s) => (
            <div className="step-item" key={s.n}>
              <div className="step-num">{s.n}</div>
              <div><h4>{s.title}</h4><p>{s.body}</p></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
