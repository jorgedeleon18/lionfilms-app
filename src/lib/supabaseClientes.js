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
  // Inserta si el DNI es nuevo; si ya existe, no hace nada (no pisa datos).
  // Solo Gaby logueada puede corregir un registro existente (ver RLS).
  const { error } = await supabase.from('clientes').upsert(row, { onConflict: 'dni', ignoreDuplicates: true });
  if (error) throw error;
}
