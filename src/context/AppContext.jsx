import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import {
  fetchCatalog,
  crearProducto, actualizarProducto, borrarProducto,
  crearCategoria, borrarCategoria, actualizarCategoria,
  crearCombo, borrarCombo, actualizarComboImagenes, subirFotoProducto, MAX_FOTOS_COMBO,
} from '../lib/supabaseCatalog';
import { fetchClientes, upsertCliente, reconocerCliente } from '../lib/supabaseClientes';
import {
  fetchBloqueos, insertarBloqueos, borrarBloqueo,
  crearReserva, fetchReservas, actualizarEstadoItem,
} from '../lib/supabaseReservas';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Todas las fechas entre desde y hasta (inclusive), como 'YYYY-MM-DD'.
function keysBetween(from, to) {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const cursor = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);
  const keys = [];
  while (cursor <= end) {
    keys.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

const AppContext = createContext(null);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage no disponible, seguimos solo en memoria */
  }
}

export function AppProvider({ children }) {
  const [mode, setMode] = useState('public');
  const [cart, setCart] = useState(() => load('lf_cart', []));
  const [clienteRegistrado, setClienteRegistrado] = useState(() => load('lf_cliente_reg', false));
  const [clienteData, setClienteData] = useState(() => load('lf_cliente_data', null));
  const [clienteActualDni, setClienteActualDni] = useState(() => load('lf_cliente_dni', null));
  // Fechas bloqueadas: vienen de Supabase (las ve todo el mundo).
  const [blocked, setBlocked] = useState({});
  const [bloqueosError, setBloqueosError] = useState(false);
  // Pedidos de TODOS los clientes: vienen de Supabase y solo los lee Gaby logueada.
  const [reservations, setReservations] = useState([]);
  // Pedidos que envió este navegador (historial propio del cliente en "Mi pedido").
  const [misPedidos, setMisPedidos] = useState(() => load('lf_reservations', []));
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const [pendingReturnProductId, setPendingReturnProductId] = useState(null);
  const [savedCalState, setSavedCalState] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [gabySession, setGabySession] = useState(null);
  const [gabyLoginOpen, setGabyLoginOpen] = useState(false);
  const [gabyLoginError, setGabyLoginError] = useState('');
  const [gabyLoginLoading, setGabyLoginLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clientesLoading, setClientesLoading] = useState(true);
  // Hasta qué registro de cliente ya vio Gaby (para el cartelito de "clientes nuevos").
  const [clientesVistosAt, setClientesVistosAt] = useState(() => load('lf_clientes_vistos', null));

  // Si Supabase falla (corte, red lenta) reintenta solo un par de veces antes
  // de avisar; así un tropiezo momentáneo no deja la pantalla vacía.
  const reloadCatalog = useCallback(async () => {
    for (let intento = 0; intento < 3; intento++) {
      try {
        const { categories: c, products: p, bundles: b } = await fetchCatalog();
        setCategories(c);
        setProducts(p);
        setBundles(b);
        setCatalogError(false);
        setCatalogLoading(false);
        return;
      } catch (err) {
        console.error('Error cargando catálogo de Supabase', err);
        if (intento < 2) await sleep(1500 * (intento + 1));
      }
    }
    setCatalogError(true);
    setCatalogLoading(false);
  }, []);

  // Botón "Reintentar" de la pantalla de error.
  const retryCatalog = useCallback(async () => {
    setCatalogError(false);
    setCatalogLoading(true);
    await reloadCatalog();
  }, [reloadCatalog]);

  const reloadBloqueos = useCallback(async () => {
    const b = await fetchBloqueos();
    if (b) { setBlocked(b); setBloqueosError(false); } else { setBloqueosError(true); }
  }, []);

  const reloadReservas = useCallback(async () => {
    const r = await fetchReservas();
    if (r) setReservations(r);
  }, []);

  useEffect(() => { reloadCatalog(); }, [reloadCatalog]);
  useEffect(() => { reloadBloqueos(); }, [reloadBloqueos]);
  useEffect(() => {
    if (gabySession) reloadReservas(); else setReservations([]);
  }, [gabySession, reloadReservas]);


  // Lista completa de clientes que se dieron de alta (tabla clientes en
  // Supabase). Solo Gaby logueada puede leerla (RLS) — se recarga cuando
  // inicia o cierra sesión.
  const reloadClientes = useCallback(async (silent = false) => {
    if (!silent) setClientesLoading(true);
    const c = await fetchClientes();
    setClientes(c);
    setClientesLoading(false);
  }, []);

  useEffect(() => { reloadClientes(); }, [reloadClientes, gabySession]);

  // Al volver a la pestaña, se refrescan fechas bloqueadas (y pedidos, si es Gaby).
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible') return;
      reloadBloqueos();
      if (gabySession) { reloadReservas(); reloadClientes(true); }
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [gabySession, reloadBloqueos, reloadReservas, reloadClientes]);

  const catLabel = useCallback((catId) => {
    const c = categories.find((x) => x.id === catId);
    return c ? c.label : catId;
  }, [categories]);

  // Devuelve el producto o, si ya fue borrado del catálogo (puede pasar con
  // pedidos históricos), un objeto placeholder para no romper la pantalla.
  const getProduct = useCallback((id) => (
    products.find((p) => p.id === id) || { id, name: 'Producto eliminado del catálogo', icon: '❔', img: null, price: '—', priceNum: 0, cat: 'todas', specs: [] }
  ), [products]);

  function specsToRows(specs) {
    return (specs || []).map(([etiqueta, valor]) => ({ etiqueta, valor }));
  }

  const guardarProducto = useCallback(async (id, form) => {
    const producto = {
      categoria_id: form.cat,
      nombre: form.name,
      subtitulo: form.sub || null,
      descripcion: form.descripcion || null,
      precio_num: Number(form.priceNum) || 0,
      precio_original_num: form.originalPriceNum ? Number(form.originalPriceNum) : null,
      destacado: !!form.featured,
      badge: form.badge || null,
      imagen_url: form.img || null,
      stock: Number(form.stock) || 1,
      specs: specsToRows(form.specs),
    };
    if (id) await actualizarProducto(id, producto);
    else await crearProducto(producto);
    await reloadCatalog();
  }, [reloadCatalog]);

  const eliminarProducto = useCallback(async (id) => {
    await borrarProducto(id);
    await reloadCatalog();
  }, [reloadCatalog]);

  const guardarCategoria = useCallback(async (form) => {
    const fila = { id: form.id, label: form.label, icon: form.icon || '📦', orden: categories.length + 1 };
    if (form.grupo && form.grupo.trim()) fila.grupo = form.grupo.trim();
    await crearCategoria(fila);
    await reloadCatalog();
  }, [reloadCatalog, categories.length]);

  const editarCategoria = useCallback(async (id, form) => {
    await actualizarCategoria(id, { label: form.label, icon: form.icon || '📦', grupo: (form.grupo || '').trim() || null });
    await reloadCatalog();
  }, [reloadCatalog]);

  const eliminarCategoria = useCallback(async (id) => {
    await borrarCategoria(id);
    await reloadCatalog();
  }, [reloadCatalog]);

  const guardarCombo = useCallback(async (form) => {
    const fila = {
      nombre: form.name,
      precio_num: Number(form.priceNum) || 0,
      fecha_desde: form.from || null,
      fecha_hasta: form.to || null,
      items: form.items,
    };
    if (form.imgs && form.imgs.length) { fila.imagenes = form.imgs; fila.imagen_url = form.imgs[0]; }
    await crearCombo(fila);
    await reloadCatalog();
  }, [reloadCatalog]);

  // Agrega o cambia la foto de un combo que ya existe (sube el archivo y lo guarda).
  const agregarFotosCombo = useCallback(async (id, files) => {
    const combo = bundles.find((b) => b.id === id);
    const actuales = combo ? combo.imgs : [];
    const lugar = MAX_FOTOS_COMBO - actuales.length;
    if (lugar <= 0) throw new Error('Un combo puede tener hasta ' + MAX_FOTOS_COMBO + ' fotos');
    const nuevas = [];
    for (const f of Array.from(files).slice(0, lugar)) nuevas.push(await subirFotoProducto(f));
    await actualizarComboImagenes(id, [...actuales, ...nuevas]);
    await reloadCatalog();
  }, [bundles, reloadCatalog]);

  const quitarFotoCombo = useCallback(async (id, url) => {
    const combo = bundles.find((b) => b.id === id);
    if (!combo) return;
    await actualizarComboImagenes(id, combo.imgs.filter((u) => u !== url));
    await reloadCatalog();
  }, [bundles, reloadCatalog]);

  const eliminarCombo = useCallback(async (id) => {
    await borrarCombo(id);
    await reloadCatalog();
  }, [reloadCatalog]);

  // Sesión de Gaby vía Supabase Auth: al cargar, recupera la sesión guardada
  // (si existe), y se mantiene sincronizada si expira o se cierra.
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setGabySession(data.session);
      if (data.session) setMode('admin');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setGabySession(session);
      setMode(session ? 'admin' : 'public');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loginGaby = useCallback(async (email, password) => {
    if (!supabase) {
      setGabyLoginError('Supabase no está configurado todavía (faltan las variables de entorno).');
      return false;
    }
    setGabyLoginLoading(true);
    setGabyLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setGabyLoginLoading(false);
    if (error) {
      setGabyLoginError('Email o contraseña incorrectos.');
      return false;
    }
    setGabyLoginOpen(false);
    setMode('admin');
    return true;
  }, []);

  const logoutGaby = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setMode('public');
  }, []);

  useEffect(() => save('lf_cart', cart), [cart]);
  useEffect(() => save('lf_clientes_vistos', clientesVistosAt), [clientesVistosAt]);
  useEffect(() => save('lf_cliente_reg', clienteRegistrado), [clienteRegistrado]);
  useEffect(() => save('lf_cliente_data', clienteData), [clienteData]);
  useEffect(() => save('lf_cliente_dni', clienteActualDni), [clienteActualDni]);
  useEffect(() => save('lf_reservations', misPedidos), [misPedidos]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  }, []);

  const addToCart = useCallback((item) => {
    setCart((c) => [...c, item]);
  }, []);
  const removeFromCart = useCallback((idx) => {
    setCart((c) => c.filter((_, i) => i !== idx));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);
  const removeCartItems = useCallback((idxs) => {
    const set = new Set(idxs);
    setCart((c) => c.filter((_, i) => !set.has(i)));
  }, []);
  const updateCartItem = useCallback((idx, patch) => {
    setCart((c) => c.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }, []);

  const registrarCliente = useCallback(async (data) => {
    setClienteData(data);
    setClienteRegistrado(true);
    setClienteActualDni(data.dni);
    // Best-effort: si Supabase no está disponible o falla, el registro local
    // (localStorage) igual funciona y el visitante puede seguir alquilando.
    try {
      await upsertCliente(data);
    } catch (err) {
      console.error('No se pudo guardar el cliente en Supabase', err);
    }
  }, []);
  const editarRegistro = useCallback(() => setClienteRegistrado(false), []);

  // "Ya alquilé antes": si el DNI + teléfono/email coinciden con un registro,
  // este navegador pasa a estar registrado con esos datos. Devuelve true/false;
  // si hay un problema de conexión, tira el error para avisarle al cliente.
  const reconocerClienteExistente = useCallback(async (dni, contacto) => {
    const c = await reconocerCliente(dni, contacto);
    if (!c) return false;
    setClienteData({ nombre: c.nombre, apellido: c.apellido, dni: c.dni, tel: c.tel, mail: c.mail, dir: c.dir });
    setClienteRegistrado(true);
    setClienteActualDni(c.dni);
    return true;
  }, []);

  const toggleBlock = useCallback(async (productId, key) => {
    const estabaBloqueado = (blocked[productId] || []).includes(key);
    const aplicar = (bloquear) => setBlocked((b) => {
      const list = b[productId] || [];
      const next = bloquear ? [...new Set([...list, key])] : list.filter((k) => k !== key);
      return { ...b, [productId]: next };
    });
    aplicar(!estabaBloqueado); // se ve al instante; si falla se deshace
    try {
      if (estabaBloqueado) await borrarBloqueo(productId, key);
      else await insertarBloqueos(productId, [key]);
    } catch (err) {
      console.error('No se pudo guardar el bloqueo', err);
      aplicar(estabaBloqueado);
      showToast('No se pudo guardar el cambio. Revisá tu conexión e intentá de nuevo.');
    }
  }, [blocked, showToast]);

  // Guarda el pedido en Supabase (para el panel de Gaby) y en este navegador
  // (historial del cliente). Devuelve true si quedó registrado en Supabase.
  const registrarReserva = useCallback(async (cliente, cartItems) => {
    const items = cartItems.map((item) => ({ ...item, status: 'pendiente' }));
    const id = 'r' + Date.now() + Math.floor(Math.random() * 1000);
    setMisPedidos((r) => [...r, { id, cliente, items, createdAt: new Date().toISOString() }]);
    try {
      await crearReserva(cliente, items);
      return true;
    } catch (err) {
      console.error('No se pudo registrar el pedido en Supabase', err);
      return false;
    }
  }, []);

  const marcarEstado = useCallback(async (reservaId, itemIdx, status) => {
    const r = reservations.find((x) => x.id === reservaId);
    const item = r && r.items[itemIdx];
    if (!item) return;
    try {
      // Primero se bloquean las fechas y recién después se cambia el estado,
      // así nunca queda "entregado" sin las fechas bloqueadas.
      if (status === 'entregado') {
        const keys = keysBetween(item.from, item.to);
        await insertarBloqueos(item.productId, keys);
        setBlocked((b) => ({ ...b, [item.productId]: [...new Set([...(b[item.productId] || []), ...keys])] }));
      }
      await actualizarEstadoItem(item.id, status);
      setReservations((rs) => rs.map((x) => (x.id !== reservaId ? x : {
        ...x, items: x.items.map((it, i) => (i === itemIdx ? { ...it, status } : it)),
      })));
    } catch (err) {
      console.error('No se pudo actualizar el estado', err);
      showToast('No se pudo guardar el cambio. Revisá tu conexión e intentá de nuevo.');
    }
  }, [reservations, showToast]);

  // Clientes registrados después de lo último que Gaby vio. Se compara contra la
  // fecha del propio registro (no contra el reloj del celular), así no se desfasa.
  const clientesNuevos = clientes.filter((c) => !clientesVistosAt || new Date(c.createdAt) > new Date(clientesVistosAt)).length;
  const marcarClientesVistos = useCallback(() => {
    const ultimo = clientes.reduce((max, c) => (c.createdAt && (!max || c.createdAt > max) ? c.createdAt : max), null);
    if (ultimo) setClientesVistosAt(ultimo);
  }, [clientes]);

  const pendingCount = reservations.reduce((n, r) => n + r.items.filter((i) => i.status === 'pendiente').length, 0);

  const value = {
    mode, setMode,
    gabySession, gabyLoginOpen, setGabyLoginOpen, gabyLoginError, gabyLoginLoading,
    loginGaby, logoutGaby,
    cart, addToCart, removeFromCart, clearCart, updateCartItem, removeCartItems,
    clienteRegistrado, clienteData, clienteActualDni, setClienteActualDni,
    registrarCliente, editarRegistro, reconocerClienteExistente,
    blocked, toggleBlock, reloadBloqueos, bloqueosError,
    reservations, misPedidos, registrarReserva, marcarEstado, pendingCount, reloadReservas,
    toast, showToast,
    pendingReturnProductId, setPendingReturnProductId,
    savedCalState, setSavedCalState,
    drawerOpen, setDrawerOpen,
    categories, products, bundles, catalogLoading, catalogError, retryCatalog, catLabel, getProduct, reloadCatalog,
    clientes, clientesLoading, reloadClientes, clientesNuevos, clientesVistosAt, marcarClientesVistos,
    guardarProducto, eliminarProducto,
    guardarCategoria, editarCategoria, eliminarCategoria,
    guardarCombo, agregarFotosCombo, quitarFotoCombo, eliminarCombo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
