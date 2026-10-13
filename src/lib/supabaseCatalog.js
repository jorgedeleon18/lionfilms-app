import { supabase } from '../supabaseClient';

/* Capa de datos del catálogo (categorías, productos+specs, combos) contra Supabase.
   Traduce entre las columnas en español de la base y la forma que ya usaba
   la app (name, sub, price, priceNum, cat, specs: [[etiqueta,valor],...], etc.) */

export const MAX_FOTOS_COMBO = 6;

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

  // Tiempo máximo de espera: si Supabase no contesta, se corta y se avisa
  // (en vez de quedar la pantalla vacía para siempre).
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase tardó demasiado en responder')), 12000));
  const [{ data: categoriasRows, error: errCat }, { data: productosRows, error: errProd }, { data: combosRows, error: errCombo }] =
    await Promise.race([
      Promise.all([
        supabase.from('categorias').select('*').order('orden'),
        supabase.from('productos').select('*, producto_specs(*)').order('id'),
        supabase.from('combos').select('*, combo_items(producto_id)').order('id'),
      ]),
      timeout,
    ]);

  // Antes devolvía listas vacías y la web quedaba en blanco sin explicación;
  // ahora el error sube y la app muestra "No pudimos cargar" con Reintentar.
  if (errCat || errProd || errCombo) throw (errCat || errProd || errCombo);

  const categories = (categoriasRows || []).map((c) => ({ id: c.id, label: c.label, icon: c.icon, grupo: c.grupo || '' }));
  const iconByCat = Object.fromEntries(categories.map((c) => [c.id, c.icon]));
  const products = (productosRows || []).map((r) => productoToApp(r, iconByCat[r.categoria_id]));
  const bundles = (combosRows || []).map((b) => ({
    id: b.id,
    name: b.nombre,
    priceNum: Number(b.precio_num),
    // Hasta 6 fotos; si todavía no se corrió el SQL nuevo, se usa la foto única de antes.
    imgs: Array.isArray(b.imagenes) && b.imagenes.length ? b.imagenes : (b.imagen_url ? [b.imagen_url] : []),
    img: (Array.isArray(b.imagenes) && b.imagenes[0]) || b.imagen_url || null,
    from: b.fecha_desde,
    to: b.fecha_hasta,
    items: (b.combo_items || []).map((i) => i.producto_id),
  }));

  return { categories, products, bundles };
}

/* Achica la foto en el navegador antes de subirla: Gaby puede elegir la
   foto original de la cámara (10-20 MB) y acá se convierte a un JPG de
   1600 px como máximo (~200-400 KB). Así el sitio carga rápido y no se
   gasta la cuota de descargas de Supabase. Si algo falla (formato que el
   navegador no entiende, como HEIC en Chrome), se sube la original. */
const FOTO_LADO_MAX = 1600;
const FOTO_CALIDAD = 0.82;

async function comprimirFoto(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  try {
    // imageOrientation: respeta la rotación del celular/cámara (EXIF).
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const escala = Math.min(1, FOTO_LADO_MAX / Math.max(bitmap.width, bitmap.height));
    const ancho = Math.round(bitmap.width * escala);
    const alto = Math.round(bitmap.height * escala);
    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // fondo blanco por si es un PNG con transparencia
    ctx.fillRect(0, 0, ancho, alto);
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', FOTO_CALIDAD));
    if (!blob || blob.size >= file.size) return file; // si no achicó nada, va la original
    return new File([blob], 'foto.jpg', { type: 'image/jpeg' });
  } catch (err) {
    console.warn('No se pudo comprimir la foto, se sube la original', err);
    return file;
  }
}

export async function subirFotoProducto(fileOriginal) {
  const file = await comprimirFoto(fileOriginal);
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('productos').upload(path, file, {
    contentType: file.type || undefined,
    cacheControl: '31536000', // cada foto tiene nombre único, se puede cachear 1 año
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

export async function actualizarCategoria(id, data) {
  const { error } = await supabase.from('categorias').update(data).eq('id', id);
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

export async function actualizarComboImagenes(id, urls) {
  const { error } = await supabase.from('combos').update({ imagenes: urls, imagen_url: urls[0] || null }).eq('id', id);
  if (error) throw error;
}

export async function borrarCombo(id) {
  const { error } = await supabase.from('combos').delete().eq('id', id);
  if (error) throw error;
}
