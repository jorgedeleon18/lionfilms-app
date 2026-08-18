export function pad2(n) {
  return n.toString().padStart(2, '0');
}
export function dateKey(y, m, d) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}
export function fmtKey(key) {
  if (!key) return '';
  const [y, m, d] = key.split('-');
  return `${d}/${m}/${y}`;
}
export function rentalDays(from, to) {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const diff = Math.round((new Date(ty, tm - 1, td) - new Date(fy, fm - 1, fd)) / 86400000);
  return Math.max(diff, 1);
}
export function money(n) {
  return '$' + n.toLocaleString('es-AR');
}
export const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const STATUS_LABEL = { pendiente: 'Pendiente', entregado: 'Entregado', no_disponible: 'No disponible' };
