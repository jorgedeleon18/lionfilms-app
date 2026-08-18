import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { INITIAL_BLOCKED, PRODUCTS } from '../data/catalog';
import { supabase } from '../supabaseClient';

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
  const [blocked, setBlocked] = useState(() => load('lf_blocked', INITIAL_BLOCKED));
  const [reservations, setReservations] = useState(() => load('lf_reservations', []));
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const [pendingReturnProductId, setPendingReturnProductId] = useState(null);
  const [savedCalState, setSavedCalState] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [gabySession, setGabySession] = useState(null);
  const [gabyLoginOpen, setGabyLoginOpen] = useState(false);
  const [gabyLoginError, setGabyLoginError] = useState('');
  const [gabyLoginLoading, setGabyLoginLoading] = useState(false);

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
  useEffect(() => save('lf_cliente_reg', clienteRegistrado), [clienteRegistrado]);
  useEffect(() => save('lf_cliente_data', clienteData), [clienteData]);
  useEffect(() => save('lf_cliente_dni', clienteActualDni), [clienteActualDni]);
  useEffect(() => save('lf_blocked', blocked), [blocked]);
  useEffect(() => save('lf_reservations', reservations), [reservations]);

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

  const registrarCliente = useCallback((data) => {
    setClienteData(data);
    setClienteRegistrado(true);
    setClienteActualDni(data.dni);
  }, []);
  const editarRegistro = useCallback(() => setClienteRegistrado(false), []);

  const toggleBlock = useCallback((productId, key) => {
    setBlocked((b) => {
      const list = b[productId] || [];
      const next = list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
      return { ...b, [productId]: next };
    });
  }, []);

  const registrarReserva = useCallback((cliente, cartItems) => {
    const items = cartItems.map((item) => ({ ...item, status: 'pendiente' }));
    setReservations((r) => [
      ...r,
      { id: 'r' + Date.now() + Math.floor(Math.random() * 1000), cliente, items, createdAt: new Date().toISOString() },
    ]);
  }, []);

  const marcarEstado = useCallback((reservaId, itemIdx, status) => {
    setReservations((rs) =>
      rs.map((r) => {
        if (r.id !== reservaId) return r;
        const items = r.items.map((it, i) => (i === itemIdx ? { ...it, status } : it));
        return { ...r, items };
      })
    );
    if (status === 'entregado') {
      setReservations((rs) => {
        const r = rs.find((x) => x.id === reservaId);
        if (r) {
          const item = r.items[itemIdx];
          const [fy, fm, fd] = item.from.split('-').map(Number);
          const [ty, tm, td] = item.to.split('-').map(Number);
          let cursor = new Date(fy, fm - 1, fd);
          const end = new Date(ty, tm - 1, td);
          const keys = [];
          while (cursor <= end) {
            keys.push(`${cursor.getFullYear()}-${(cursor.getMonth() + 1).toString().padStart(2, '0')}-${cursor.getDate().toString().padStart(2, '0')}`);
            cursor.setDate(cursor.getDate() + 1);
          }
          setBlocked((b) => {
            const list = b[item.productId] || [];
            const next = [...new Set([...list, ...keys])];
            return { ...b, [item.productId]: next };
          });
        }
        return rs;
      });
    }
  }, []);

  const pendingCount = reservations.reduce((n, r) => n + r.items.filter((i) => i.status === 'pendiente').length, 0);

  const value = {
    mode, setMode,
    gabySession, gabyLoginOpen, setGabyLoginOpen, gabyLoginError, gabyLoginLoading,
    loginGaby, logoutGaby,
    cart, addToCart, removeFromCart, clearCart,
    clienteRegistrado, clienteData, clienteActualDni, setClienteActualDni,
    registrarCliente, editarRegistro,
    blocked, toggleBlock,
    reservations, registrarReserva, marcarEstado, pendingCount,
    toast, showToast,
    pendingReturnProductId, setPendingReturnProductId,
    savedCalState, setSavedCalState,
    drawerOpen, setDrawerOpen,
    productsById: PRODUCTS,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
