// Agrupa las categorías por su "grupo" (Imagen, Sonido, Accesorios…), respetando el orden.
// Si ninguna tiene grupo, devuelve un solo bloque sin título (se ve como siempre).
// Las que quedan sin grupo, cuando hay otros grupos, van al final bajo "Otros".
export function agruparCategorias(categories) {
  const hayGrupos = categories.some((c) => c.grupo);
  if (!hayGrupos) return [{ titulo: null, items: categories }];
  const orden = [];
  const mapa = new Map();
  categories.forEach((c) => {
    const key = c.grupo || '__otros';
    if (!mapa.has(key)) { mapa.set(key, []); orden.push(key); }
    mapa.get(key).push(c);
  });
  const claves = orden.filter((k) => k !== '__otros');
  if (mapa.has('__otros')) claves.push('__otros');
  return claves.map((k) => ({ titulo: k === '__otros' ? 'Otros' : k, items: mapa.get(k) }));
}

// Íconos sugeridos para elegir con un toque (Gaby también puede escribir cualquier emoji).
export const ICONOS_SUGERIDOS = [
  '📷', '🎥', '🎬', '🔍', '🎞️', '💡', '🔦', '🎙️', '🎧', '🔊', '📻', '🖥️',
  '📺', '🔋', '⚡', '🔌', '💾', '🎒', '🦾', '🛠️', '🚁', '🗼', '🧰', '📦',
];
