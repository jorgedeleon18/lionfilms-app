import lionLogoColor from '../assets/lion-logo-color.png';

const STEPS = [
  { n: 1, title: 'Elegís el equipo', body: 'Recorré el listado por categoría — cámaras, lentes, trípodes, luces, audio o accesorios — y mirá specs, fotos y precio de referencia.' },
  { n: 2, title: 'Marcás las fechas', body: 'En cada producto vas a ver un calendario con los días disponibles en verde. Elegís retiro y devolución, y sumás todo lo que necesites al carrito.' },
  { n: 3, title: 'Te registrás (solo la primera vez)', body: 'Antes de mandar tu primer pedido completás la Alta de Clientes con tus datos. De ahí en adelante no te lo vuelve a pedir.' },
  { n: 4, title: 'Enviás el pedido', body: 'Desde el carrito lo mandás por WhatsApp o mail. Gaby lo recibe, confirma disponibilidad y coordina con vos el pago y la entrega — todo eso queda fuera de la web.' },
  { n: 5, title: 'Retirás el equipo', body: 'Coordinás día y horario de retiro y devolución directamente con Gaby.' },
];

const TERMS = [
  ['Identificación del cliente', 'Envío de documentación para verificar la identidad y los datos del cliente a nuestro WhatsApp 11.3623.9892.'],
  ['Reserva del equipamiento', 'La reserva queda confirmada una vez acreditado el pago correspondiente.'],
  ['Aceptación de las condiciones', 'Al alquilar, el cliente acepta nuestras condiciones generales y particulares.'],
  ['Pago del alquiler', 'El alquiler deberá estar abonado antes de la entrega.'],
  ['Señas y cancelaciones', 'Las cancelaciones se regirán por las condiciones informadas al confirmar cada reserva.'],
  ['Depósito o garantía', 'Algunos equipos pueden requerir una garantía previa a la entrega.'],
  ['Estado del equipamiento', 'Todos los equipos se entregan revisados y con su estado previamente documentado.'],
  ['Prueba y verificación', 'El cliente debe revisar y probar el equipamiento antes de retirarlo.'],
  ['Responsabilidad durante el alquiler', 'El cliente es responsable del equipo desde su entrega hasta su devolución.'],
  ['Uso adecuado', 'Los equipos deben utilizarse correctamente y respetando las especificaciones del fabricante.'],
  ['Personas autorizadas', 'El cliente responde por el equipo aunque sea utilizado por integrantes de su producción.'],
  ['Traslado y transporte', 'El cliente es responsable del equipamiento durante todos los traslados.'],
  ['Rodajes en exteriores', 'El equipo debe estar protegido frente a lluvia, humedad, polvo, golpes y condiciones extremas.'],
  ['Daños, golpes y rayaduras', 'Todo daño no preexistente podrá generar costos de reparación o reacondicionamiento.'],
  ['Reparación y reposición', 'Los equipos dañados, perdidos o destruidos deberán ser reparados o repuestos según corresponda.'],
  ['Robo, hurto o pérdida', 'Cualquier pérdida o sustracción deberá ser informada inmediatamente a Lion Films.'],
  ['Devolución', 'El equipo debe devolverse completo, en fecha y horario acordados y en las condiciones recibidas.'],
  ['Devoluciones fuera de término', 'Las demoras en la devolución pueden generar cargos adicionales.'],
  ['Material registrado y responsabilidad de uso', 'El cliente es responsable de realizar copias de seguridad del material registrado.'],
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

          <details className="terms-box" id="condiciones">
            <summary>Bases y condiciones de alquiler</summary>
            <div className="terms-list">
              {TERMS.map(([t, b], i) => (
                <div key={t}>
                  <h5>{String(i + 1).padStart(2, '0')}. {t}</h5>
                  <p>{b}</p>
                </div>
              ))}
            </div>
            <p className="terms-note">Al alquilar con Lion Films aceptás estas condiciones.</p>
          </details>
        </div>
      </div>
    </main>
  );
}
