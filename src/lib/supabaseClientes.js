import { supabase } from '../supabaseClient';

/* Registro de clientes que se dieron de alta (tabla aparte de las
   reservas), para que Gaby tenga a mano quién se registró aunque
   todavía no haya hecho ningún pedido — por ejemplo, para un sorteo. */

function clienteToApp(row) {
  return {
    dni: row.dni,
    nombre: row.nombre,
    apellido: row.apellido || '',
    tel: row.tel || '',
    mail: row.mail || '',
    dir: row.dir || '',
    createdAt: row.created_at,
  };
}

export async function fetchClientes() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
  if (error) {
    // Si Gaby no está logueada, RLS bloquea el select — no es un error real, solo lista vacía.
    return [];
  }
  return (data || []).map(clienteToApp);
}

export async function upsertCliente(data) {
  if (!supabase) return;
  const row = {
    dni: data.dni,
    nombre: data.nombre,
    apellido: data.apellido || null,
    tel: data.tel || null,
    mail: data.mail || null,
    dir: data.dir || null,
  };
  // Insert simple (no upsert/on-conflict): un "on conflict" necesita que
  // Postgres pueda LEER la fila existente para detectar el choque, y esa
  // lectura está bloqueada para el público (a propósito, así nadie ve la
  // lista de clientes) — eso hacía fallar hasta los DNI nuevos. Con un
  // insert directo, si el DNI ya existe, Postgres tira un error de
  // "duplicado" (23505) que simplemente ignoramos: no pisa datos de nadie.
  const { error } = await supabase.from('clientes').insert(row);
  if (error && error.code !== '23505') throw error;
}
