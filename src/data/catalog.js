import prodA7c from '../assets/prod-a7c.jpg';
import prodNeweer from '../assets/prod-neweer.jpg';
import prodBenro from '../assets/prod-benro.jpg';
import prodBexin from '../assets/prod-bexin.jpg';

export const CATEGORIES = [
  { id: 'todas', label: 'Todas' },
  { id: 'camaras', label: 'Cámaras', icon: '📷' },
  { id: 'lentes', label: 'Lentes', icon: '🔍' },
  { id: 'tripodes', label: 'Trípodes / Soporte', icon: '🎚️' },
  { id: 'luces', label: 'Luces', icon: '💡' },
  { id: 'audio', label: 'Audio', icon: '🎙️' },
  { id: 'monitores', label: 'Monitores / Transmisión', icon: '🖥️' },
  { id: 'comunicacion', label: 'Comunicación', icon: '📻' },
  { id: 'pilas', label: 'Pilas / Accesorios', icon: '🔋' },
];

/* Catálogo real de Lion Films (inventario que pasó Gaby) — precios de referencia
   inventados por ahora, Gaby los ajusta. Stock = cantidad real que figura en el inventario. */
export const PRODUCTS = [
  { id: 1, cat: 'camaras', icon: '📷', name: 'Sony FX6 (body) + batería BP-U60', sub: 'Cine digital full frame, 4K 120fps', price: '$45.000/día', priceNum: 45000, featured: true, badge: 'consultar', specs: [['Sensor', 'Full Frame 10.2MP'], ['Video', '4K 120p 10bit 4:2:2'], ['Montura', 'Sony E'], ['Stock', '1 unidad']] },
  { id: 2, cat: 'camaras', icon: '📷', img: prodA7c, name: 'Sony a7C (body)', sub: 'Full frame compacta, mirrorless', price: '$18.000/día', priceNum: 18000, featured: true, badge: null, specs: [['Sensor', 'Full Frame 24.2MP'], ['Video', '4K 30p'], ['Montura', 'Sony E'], ['Stock', '1 unidad']] },
  { id: 3, cat: 'pilas', icon: '🔋', name: 'Batería Sony BP-U60 (repuesto FX6)', sub: 'Batería adicional para Sony FX6', price: '$3.000/día', priceNum: 3000, featured: false, badge: null, specs: [['Compatibilidad', 'Sony FX6 / serie U'], ['Capacidad', '5900mAh'], ['Stock', '1 unidad']] },
  { id: 4, cat: 'pilas', icon: '🔋', name: 'Batería Sony NP-FZ100 (pack x4)', sub: 'Para cuerpos Sony a7/a9/FX', price: '$3.000/día', priceNum: 3000, featured: false, badge: null, specs: [['Compatibilidad', 'Sony NP-FZ100'], ['Capacidad', '2280mAh c/u'], ['Stock', '4 unidades']] },
  { id: 5, cat: 'pilas', icon: '🔋', name: 'Batería genérica p/monitor y transmisor (pack x6)', sub: 'Baterías tipo NP-F para accesorios', price: '$1.500/día', priceNum: 1500, featured: false, badge: null, specs: [['Uso', 'Monitor / transmisor de video'], ['Tipo', 'NP-F genérica'], ['Stock', '6 unidades']] },
  { id: 6, cat: 'lentes', icon: '🔍', name: 'Objetivo Sony 20mm f/1.8 FE', sub: 'Gran angular full frame', price: '$9.000/día', priceNum: 9000, featured: false, badge: null, specs: [['Apertura', 'f/1.8'], ['Montura', 'Sony E'], ['Formato', 'Full Frame'], ['Stock', '1 unidad']] },
  { id: 7, cat: 'lentes', icon: '🔍', name: 'Objetivo Sony 55mm f/1.8 FE', sub: 'Retrato / uso general, full frame', price: '$8.000/día', priceNum: 8000, featured: false, badge: null, specs: [['Apertura', 'f/1.8'], ['Montura', 'Sony E'], ['Formato', 'Full Frame'], ['Stock', '1 unidad']] },
  { id: 8, cat: 'lentes', icon: '🔍', name: 'Objetivo Sony 35mm f/1.4 FE', sub: 'Angular luminoso, full frame', price: '$12.000/día', priceNum: 12000, featured: true, badge: null, specs: [['Apertura', 'f/1.4'], ['Montura', 'Sony E'], ['Formato', 'Full Frame'], ['Stock', '1 unidad']] },
  { id: 9, cat: 'lentes', icon: '🔍', name: 'Objetivo Sony 85mm', sub: 'Teleobjetivo para retrato', price: '$10.000/día', priceNum: 10000, featured: false, badge: null, specs: [['Montura', 'Sony E'], ['Formato', 'Full Frame'], ['Uso', 'Retrato / entrevistas'], ['Stock', '1 unidad']] },
  { id: 10, cat: 'monitores', icon: '🖥️', name: 'Transmisor inalámbrico Holliland Mars', sub: 'Transmisión de video inalámbrica para set', price: '$12.000/día', priceNum: 12000, featured: false, badge: null, specs: [['Uso', 'Video wireless TX/RX'], ['Alcance', '~150m línea de vista'], ['Stock', '1 unidad']] },
  { id: 11, cat: 'tripodes', icon: '🎚️', name: 'Trípode jirafa Visico LS8012', sub: 'Soporte de luz / boom stand', price: '$5.000/día', priceNum: 5000, featured: false, badge: null, specs: [['Altura', 'hasta ~3.6m'], ['Uso', 'Luces / accesorios'], ['Stock', '1 unidad']] },
  { id: 12, cat: 'tripodes', icon: '🎚️', name: 'Bolsa de arena Ox Grip', sub: 'Contrapeso para stands y trípodes', price: '$1.500/día', priceNum: 1500, featured: false, badge: null, specs: [['Uso', 'Contrapeso de seguridad'], ['Stock', '2 unidades']] },
  { id: 13, cat: 'luces', icon: '💡', img: prodNeweer, name: 'Luz RGB Neweer HB80C + bolso', sub: 'Panel LED RGB, con bolso de transporte', price: '$9.000/día', priceNum: 9000, featured: true, badge: 'promo', originalPriceNum: 12000, specs: [['Tipo', 'LED RGB'], ['Potencia', '80W'], ['Incluye', 'Bolso de transporte'], ['Stock', '3 unidades']] },
  { id: 14, cat: 'luces', icon: '💡', name: 'Luz RGB LED Stick', sub: 'Tubo LED RGB portátil', price: '$6.000/día', priceNum: 6000, featured: false, badge: null, specs: [['Tipo', 'LED RGB tubo'], ['Uso', 'Luz de acento / ambiente'], ['Stock', '3 unidades']] },
  { id: 15, cat: 'tripodes', icon: '🎚️', name: 'Soporte Ox Grip (medida Full)', sub: 'Stand de luz, tamaño completo', price: '$4.000/día', priceNum: 4000, featured: false, badge: null, specs: [['Uso', 'Soporte de luces'], ['Tamaño', 'Full'], ['Stock', '2 unidades']] },
  { id: 16, cat: 'tripodes', icon: '🎚️', name: 'Soporte Ox Grip (medida Medium)', sub: 'Stand de luz, tamaño mediano', price: '$3.000/día', priceNum: 3000, featured: false, badge: null, specs: [['Uso', 'Soporte de luces'], ['Tamaño', 'Medium'], ['Stock', '1 unidad']] },
  { id: 17, cat: 'pilas', icon: '🔋', name: 'Bolso Benro', sub: 'Bolso de transporte para equipo', price: '$2.000/día', priceNum: 2000, featured: false, badge: null, specs: [['Uso', 'Transporte de cámara/accesorios'], ['Stock', '1 unidad']] },
  { id: 18, cat: 'monitores', icon: '🖥️', name: 'Monitor Viltrox DC-550 Pro', sub: 'Monitor de campo 5.5" para set', price: '$8.000/día', priceNum: 8000, featured: true, badge: null, specs: [['Pantalla', '5.5" Full HD'], ['Entrada', 'HDMI'], ['Uso', 'Monitoreo en set'], ['Stock', '1 unidad']] },
  { id: 19, cat: 'pilas', icon: '🔋', name: 'Cargador p/Luz LED Stick + cable', sub: 'Cargador y cable para luces LED Stick', price: '$1.000/día', priceNum: 1000, featured: false, badge: null, specs: [['Uso', 'Carga de Luz RGB LED Stick'], ['Stock', '3 unidades']] },
  { id: 20, cat: 'comunicacion', icon: '📻', name: 'Set de Handies Gadnic UHF16CH (x6)', sub: 'Radios para coordinar equipo en set', price: '$5.000/día', priceNum: 5000, featured: false, badge: null, specs: [['Canales', '16 UHF'], ['Uso', 'Comunicación de equipo'], ['Stock', '6 unidades']] },
  { id: 21, cat: 'audio', icon: '🎙️', name: 'Boompole 2.5 metros', sub: 'Pértiga para microfonía', price: '$3.000/día', priceNum: 3000, featured: false, badge: null, specs: [['Extensión', 'hasta 2.5m'], ['Uso', 'Sostener micrófono boom'], ['Stock', '1 unidad']] },
  { id: 22, cat: 'audio', icon: '🎙️', name: 'Micrófono Synco G2A2 Max', sub: 'Sistema inalámbrico dual', price: '$7.000/día', priceNum: 7000, featured: false, badge: null, specs: [['Tipo', 'Inalámbrico dual'], ['Uso', 'Entrevistas / diálogo'], ['Stock', '2 unidades']] },
  { id: 23, cat: 'audio', icon: '🎙️', name: 'Micrófono Rode Wireless Pro', sub: 'Sistema inalámbrico compacto', price: '$9.000/día', priceNum: 9000, featured: true, badge: 'promo', originalPriceNum: 12000, specs: [['Tipo', 'Inalámbrico compacto'], ['Uso', 'Entrevistas / vlog'], ['Stock', '2 unidades']] },
  { id: 24, cat: 'audio', icon: '🎙️', name: 'Grabadora Zoom H4n Pro', sub: 'Grabador de audio portátil', price: '$5.000/día', priceNum: 5000, featured: false, badge: null, specs: [['Canales', '4 pistas'], ['Micrófonos', 'X/Y integrados'], ['Stock', '1 unidad']] },
  { id: 25, cat: 'audio', icon: '🎙️', name: 'Auriculares Sony MDR-V55', sub: 'Monitoreo de audio en set', price: '$1.500/día', priceNum: 1500, featured: false, badge: null, specs: [['Uso', 'Monitoreo de audio'], ['Stock', '1 unidad']] },
  { id: 26, cat: 'pilas', icon: '🔋', name: 'Cargador de pilas Energizer + 6 pilas', sub: 'Cargador con pilas AA incluidas', price: '$1.000/día', priceNum: 1000, featured: false, badge: null, specs: [['Incluye', '6 pilas AA'], ['Stock', '1 unidad']] },
  { id: 27, cat: 'tripodes', icon: '🎚️', name: 'Brazo mágico 20cm', sub: 'Magic arm para accesorios en set', price: '$1.500/día', priceNum: 1500, featured: false, badge: null, specs: [['Longitud', '20 cm'], ['Uso', 'Sujeción de monitor/luz/mic'], ['Stock', '1 unidad']] },
  { id: 28, cat: 'audio', icon: '🎙️', name: 'Micrófono Boya Shotgun BM-6060', sub: 'Micrófono direccional para cámara', price: '$4.000/día', priceNum: 4000, featured: false, badge: null, specs: [['Tipo', 'Shotgun condensador'], ['Uso', 'Montado en cámara'], ['Stock', '1 unidad']] },
  /* --- de prueba: con foto real, para ver cómo queda el catálogo con fotos en vez de íconos --- */
  { id: 29, cat: 'tripodes', icon: '🎚️', img: prodBenro, name: 'Cabezal de video Benro KH25P', sub: 'Cabezal fluido profesional con trípode', price: '$6.500/día', priceNum: 6500, featured: true, badge: null, specs: [['Tipo', 'Cabezal fluido de video'], ['Carga máx', '~2.5 kg'], ['Incluye', 'Trípode + manija extensible'], ['Stock', '1 unidad']] },
  { id: 30, cat: 'tripodes', icon: '🎚️', img: prodBexin, name: 'Cabezal de video Bexin S-Series', sub: 'Cabezal fluido compacto para cámara', price: '$4.500/día', priceNum: 4500, featured: false, badge: null, specs: [['Tipo', 'Cabezal fluido de video'], ['Carga máx', '~1.8 kg'], ['Uso', 'Cámaras livianas / mirrorless'], ['Stock', '1 unidad']] },
];

export const BUNDLES = [
  { id: 'combo-doc', name: 'Combo Documental', items: [1, 11, 24], priceNum: 48000, from: '2026-08-28', to: '2026-08-29' },
  { id: 'combo-cine', name: 'Combo Rodaje con luz', items: [2, 13, 15], priceNum: 27000, from: '2026-08-28', to: '2026-08-30' },
];

export const INITIAL_BLOCKED = {
  1: ['2026-08-21', '2026-08-22', '2026-08-23'],
  2: ['2026-08-19'],
  4: ['2026-08-18', '2026-08-19'],
  6: ['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27'],
};

export function catLabel(catId) {
  const c = CATEGORIES.find((x) => x.id === catId);
  return c ? c.label : catId;
}
