import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import GabyLoginModal from './components/GabyLoginModal';
import SiteFooter from './components/SiteFooter';
import Home from './pages/Home';
import Listado from './pages/Listado';
import Producto from './pages/Producto';
import Alta from './pages/Alta';
import ComoAlquilar from './pages/ComoAlquilar';
import Contacto from './pages/Contacto';
import Pedido from './pages/Pedido';
import Fichas from './pages/Fichas';
import AdminFechas from './pages/AdminFechas';
import AdminCatalogo from './pages/AdminCatalogo';
import AdminProducto from './pages/AdminProducto';
import AdminPanel from './pages/AdminPanel';

// Al cambiar de página, arranca siempre arriba del todo (evita que quede
// el scroll heredado de la página anterior, que parecía "saltar" al final).
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listado" element={<Listado />} />
          <Route path="/listado/:cat" element={<Listado />} />
          <Route path="/producto/:id" element={<Producto />} />
          <Route path="/alta" element={<Alta />} />
          <Route path="/como-alquilar" element={<ComoAlquilar />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/pedido" element={<Pedido />} />
          <Route path="/fichas" element={<Fichas />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/fechas/:id" element={<AdminFechas />} />
          <Route path="/admin/catalogo" element={<AdminCatalogo />} />
          <Route path="/admin/productos/:id" element={<AdminProducto />} />
        </Routes>
        <SiteFooter />
        <CartDrawer />
        <Toast />
        <GabyLoginModal />
      </AppProvider>
    </BrowserRouter>
  );
}
