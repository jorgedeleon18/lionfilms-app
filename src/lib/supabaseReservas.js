import { supabase } from '../supabaseClient';

/* Fechas bloqueadas y pedidos (reservas) contra Supabase.
   - bloqueos: las lee cualquiera (para pintar el calendario), las cambia solo Gaby.
   - reservas / reserva_items: cualquiera puede enviar un pedido, solo Gaby los lee. */

// { [productoId]: ['2026-10-20', ...] } — o null si no se pudo leer
export async function fetchBloqueos() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('bloqueos').select('producto_id, fecha').limit(10000);
  if (error) {
    console.error('Error cargando fechas bloqueadas', error);
    return null;
  }
  const out = {};
  (data || []).forEach((r) => {
    (out[r.producto_id] ||= []).push(r.fecha);
  });
  return out;
}

export async function insertarBloqueos(productoId, keys) {
  if (!keys.length) return;
  const rows = keys.map((fecha) => ({ producto_id: productoId, fecha }));
  const { error } = await supabase
    .from('bloqueos')
    .upsert(rows, { onConflict: 'producto_id,fecha', ignoreDuplicates: true });
  if (error) throw error;
}

export async function borrarBloqueo(productoId, key) {
  const { error } = await supabase.from('bloqueos').delete().eq('producto_id', productoId).eq('fecha', key);
  if (error) throw error;
}

function nuevoId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Sin .select(): el visitante puede insertar pero no leer, así que no pedimos
// la fila de vuelta (por eso el id se genera acá).
export async function crearReserva(cliente, items) {
  if (!supabase) throw new Error('Supabase no está configurado');
  const id = nuevoId();
  const { error } = await supabase.from('reservas').insert({
    id,
    cliente_dni: cliente.dni,
    cliente_nombre: cliente.nombre,
    cliente_apellido: cliente.apellido || null,
    cliente_tel: cliente.tel || null,
    cliente_mail: cliente.mail || null,
    cliente_dir: cliente.dir || null,
  });
  if (error) throw error;
  const rows = items.map((it) => ({
    reserva_id: id,
    producto_id: it.productId,
    cantidad: it.qty,
    desde: it.from,
    hasta: it.to,
    estado: 'pendiente',
  }));
  const { error: errItems } = await supabase.from('reserva_items').insert(rows);
  if (errItems) throw errItems;
  return id;
}

// Solo Gaby logueada. Devuelve la misma forma que usaba la app antes:
// { id, cliente, items: [{ id, productId, qty, from, to, status }], createdAt } — o null si falló.
export async function fetchReservas() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('reservas')
    .select('*, reserva_items(*)')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error cargando pedidos', error);
    return null;
  }
  return (data || []).map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    cliente: {
      nombre: r.cliente_nombre,
      apellido: r.cliente_apellido || '',
      dni: r.cliente_dni,
      tel: r.cliente_tel || '',
      mail: r.cliente_mail || '',
      dir: r.cliente_dir || '',
    },
    items: (r.reserva_items || [])
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
      .map((i) => ({
        id: i.id,
        productId: Number(i.producto_id),
        qty: i.cantidad,
        from: i.desde,
        to: i.hasta,
        status: i.estado,
      })),
  }));
}

export async function actualizarEstadoItem(itemId, estado) {
  const { error } = await supabase.from('reserva_items').update({ estado }).eq('id', itemId);
  if (error) throw error;
}
