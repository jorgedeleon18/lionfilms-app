// Lion Films — avisos por mail a Gaby cuando hay un cliente nuevo o un pedido nuevo.
// Lo llama la base de datos (ver supabase-notificaciones.sql) cada vez que se
// inserta una fila en `clientes` o en `reservas`. Envía el mail con Resend.
//
// Secretos que necesita (Supabase > Edge Functions > Secrets):
//   RESEND_API_KEY  clave de Resend (la cuenta tiene que ser la del mail de Gaby)
//   WEBHOOK_SECRET  contraseña compartida con el SQL, para que nadie más pueda llamarla
//   NOTIFY_TO       (opcional) a quién avisar; por defecto produccion.lionfilms@gmail.com
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SITE = 'https://lionfilms.netlify.app';

// Fila genérica de la base de datos.
// deno-lint-ignore no-explicit-any
type Fila = Record<string, any>;

// Los datos los escribe el visitante: se escapan para que no puedan meter HTML en el mail.
const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const pesos = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
const fmt = (k: string) => k.split('-').reverse().join('/');
const dias = (a: string, b: string) => {
  const t = (k: string) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.max(Math.round((t(b) - t(a)) / 86400000), 1);
};

function filaCliente(c: Fila) {
  const tel = String(c.tel ?? c.cliente_tel ?? '').replace(/\D/g, '');
  const wa = tel.length === 10 ? `<a href="https://wa.me/549${tel}">Escribirle por WhatsApp</a>` : '';
  return `
    <p style="margin:0 0 4px"><b>${esc(c.nombre ?? c.cliente_nombre)} ${esc(c.apellido ?? c.cliente_apellido)}</b></p>
    <p style="margin:0;color:#444">DNI ${esc(c.dni ?? c.cliente_dni)}<br>
      Tel ${esc(c.tel ?? c.cliente_tel) || '—'} · Email ${esc(c.mail ?? c.cliente_mail) || '—'}<br>
      Dirección ${esc(c.dir ?? c.cliente_dir) || '—'}</p>
    <p style="margin:8px 0 0">${wa}</p>`;
}

const caja = (titulo: string, cuerpo: string) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:20px;border:1px solid #eee;border-radius:12px">
    <h2 style="margin:0 0 14px;color:#d6336c">${titulo}</h2>
    ${cuerpo}
    <p style="margin:18px 0 0;font-size:13px"><a href="${SITE}/fichas">Abrir el panel de Lion Films</a></p>
  </div>`;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('método no permitido', { status: 405 });
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('no autorizado', { status: 401 });
  }

  let payload: { tabla?: string; registro?: Fila };
  try { payload = await req.json(); } catch { return new Response('json inválido', { status: 400 }); }
  const { tabla, registro } = payload;
  if (!registro) return new Response('sin datos', { status: 400 });

  let asunto = '';
  let html = '';

  if (tabla === 'clientes') {
    asunto = `🦁 Cliente nuevo: ${registro.nombre ?? ''} ${registro.apellido ?? ''}`.trim();
    html = caja('Se registró un cliente nuevo', filaCliente(registro));
  } else if (tabla === 'reservas') {
    // La web guarda primero el pedido y enseguida sus equipos: se espera un instante a que estén.
    await new Promise((r) => setTimeout(r, 3000));
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: itemsData } = await db.from('reserva_items').select('*').eq('reserva_id', registro.id);
    const items: Fila[] = itemsData ?? [];
    const ids = [...new Set(items.map((i) => i.producto_id))];
    let prods: Fila[] = [];
    if (ids.length) {
      const { data } = await db.from('productos').select('id, nombre, precio_num').in('id', ids);
      prods = data ?? [];
    }
    const porId = new Map<number, Fila>(prods.map((p): [number, Fila] => [Number(p.id), p]));

    let total = 0;
    const lineas = items.map((i) => {
      const p = porId.get(Number(i.producto_id));
      const d = dias(String(i.desde), String(i.hasta));
      total += (p ? Number(p.precio_num) : 0) * Number(i.cantidad) * d;
      return `<li>${esc(p ? p.nombre : 'Producto eliminado')} ×${esc(i.cantidad)} — ${fmt(String(i.desde))} → ${fmt(String(i.hasta))} (${d} ${d === 1 ? 'día' : 'días'})</li>`;
    }).join('');

    asunto = `🎬 Pedido nuevo de ${registro.cliente_nombre ?? ''} ${registro.cliente_apellido ?? ''}`.trim();
    html = caja('Llegó un pedido nuevo', `
      ${filaCliente(registro)}
      <h3 style="margin:18px 0 6px;font-size:14px">Equipos pedidos</h3>
      <ul style="margin:0;padding-left:18px">${lineas || '<li>(todavía sin detalle)</li>'}</ul>
      <p style="margin:12px 0 0"><b>Valor estimado:</b> ${pesos(total)} <span style="color:#777">(precios de referencia)</span></p>
      <p style="margin:6px 0 0;color:#777;font-size:12px">Queda pendiente hasta que lo marques como entregado en el panel.</p>`);
  } else {
    return new Response('evento ignorado', { status: 200 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Lion Films <onboarding@resend.dev>',
      to: [Deno.env.get('NOTIFY_TO') ?? 'produccion.lionfilms@gmail.com'],
      subject: asunto,
      html,
    }),
  });
  if (!res.ok) {
    console.error('Resend rechazó el mail', res.status, await res.text());
    return new Response('no se pudo enviar el mail', { status: 502 });
  }
  return new Response('ok', { status: 200 });
});
