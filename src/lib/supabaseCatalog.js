import { supabase } from '../supabaseClient';

/* Capa de datos del catálogo (categorías, productos+specs, combos) contra Supabase.
   Traduce entre las columnas en español de la base y la forma que ya usaba
   la app (name, sub, price, priceNum, cat, specs: [[etiqueta,valor],...], etc.) */

function productoToApp(row, categoriaIcon) {
  return {
    id: row.id,
    cat: row.categoria_id,
    icon: categoriaIcon || '📦',
    img: row.imagen_url || null,
    name: row.nombre,
    sub: row.subtitulo || '',
    descripcion: row.descripcion || '',
    price: `$${Number(row.precio_num).toLocaleString('es-AR')}/día`,
    priceNum: Number(row.precio_num),
    originalPriceNum: row.precio_original_num != null ? Number(row.precio_original_num) : null,
    featured: !!row.destacado,
    badge: row.badge || null,
    stock: row.stock,
    specs: (row.producto_specs || [])
      .sort((a, b) => a.orden - b.orden)
      .map((s) => [s.etiqueta, s.valor]),
  };
}

export async function fetchCatalog() {
  if (!supabase) return { categories: [], products: [], bundles: [] };

  const [{ data: categoriasRows, error: errCat }, { data: productosRows, error: errProd }, { data: combosRows, error: errCombo }] =
    await Promise.all([
      supabase.from('categorias').select('*').order('orden'),
      supabase.from('productos').select('*, producto_specs(*)').order('id'),
      supabase.from('combos').select('*, combo_items(producto_id)').order('id'),
    ]);

  if (errCat || errProd || errCombo) {
    console.error('Error cargando catálogo de Supabase', errCat || errProd || errCombo);
    return { categories: [], products: [], bundles: [] };
  }

  const categories = (categoriasRows || []).map((c) => ({ id: c.id, label: c.label, icon: c.icon }));
  const iconByCat = Object.fromEntries(categories.map((c) => [c.id, c.icon]));
  const products = (productosRows || []).map((r) => productoToApp(r, iconByCat[r.categoria_id]));
  const bundles = (combosRows || []).map((b) => ({
    id: b.id,
    name: b.nombre,
    priceNum: Number(b.precio_num),
    from: b.fecha_desde,
    to: b.fecha_hasta,
    items: (b.combo_items || []).map((i) => i.producto_id),
  }));

  return { categories, products, bundles };
}

export async function subirFotoProducto(file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('productos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('productos').getPublicUrl(path);
  return data.publicUrl;
}

export async function crearProducto(data) {
  const { specs, ...producto } = data;
  const { data: inserted, error } = await supabase.from('productos').insert(producto).select().single();
  if (error) throw error;
  if (specs && specs.length) {
    const rows = specs.map((s, i) => ({ producto_id: inserted.id, etiqueta: s.etiqueta, valor: s.valor, orden: i }));
    const { error: errSpecs } = await supabase.from('producto_specs').insert(rows);
    if (errSpecs) throw errSpecs;
  }
  return inserted.id;
}

export async function actualizarProducto(id, data) {
  const { specs, ...producto } = data;
  const { error } = await supabase.from('productos').update(producto).eq('id', id);
  if (error) throw error;
  // Reemplaza todas las specs por las nuevas (más simple que hacer diff).
  const { error: errDel } = await supabase.from('producto_specs').delete().eq('producto_id', id);
  if (errDel) throw errDel;
  if (specs && specs.length) {
    const rows = specs.map((s, i) => ({ producto_id: id, etiqueta: s.etiqueta, valor: s.valor, orden: i }));
    const { error: errIns } = await supabase.from('producto_specs').insert(rows);
    if (errIns) throw errIns;
  }
}

export async function borrarProducto(id) {
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) throw error;
}

export async function crearCategoria(data) {
  const { error } = await supabase.from('categorias').insert(data);
  if (error) throw error;
}

export async function borrarCategoria(id) {
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) throw error;
}

export async function crearCombo(data) {
  const { items, ...combo } = data;
  const { data: inserted, error } = await supabase.from('combos').insert(combo).select().single();
  if (error) throw error;
  if (items && items.length) {
    const rows = items.map((producto_id) => ({ combo_id: inserted.id, producto_id }));
    const { error: errItems } = await supabase.from('combo_items').insert(rows);
    if (errItems) throw errItems;
  }
  return inserted.id;
}

export async function borrarCombo(id) {
  const { error } = await supabase.from('combos').delete().eq('id', id);
  if (error) throw error;
}
