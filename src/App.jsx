import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import Home from './pages/Home';
import Listado from './pages/Listado';
import Producto from './pages/Producto';
import Alta from './pages/Alta';
import ComoAlquilar from './pages/ComoAlquilar';
import Contacto from './pages/Contacto';
import Pedido from './pages/Pedido';
import Fichas from './pages/Fichas';
import AdminFechas from './pages/AdminFechas';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
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
          <Route path="/admin/fechas/:id" element={<AdminFechas />} />
        </Routes>
        <footer>Lion Films × tu app. Colores, textos y fotos son placeholders para ir ajustando juntos.</footer>
        <CartDrawer />
        <Toast />
      </AppProvider>
    </BrowserRouter>
  );
}
