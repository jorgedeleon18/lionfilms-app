import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { money } from '../utils';
import ProductMedia from '../components/ProductMedia';
import lionHead from '../assets/lion-head.png';
import lionLogoColor from '../assets/lion-logo-color.png';

export default function Home() {
  const navigate = useNavigate();
  const { cart, addToCart, clienteRegistrado, showToast, products, bundles } = useApp();
  const featured = products.filter((p) => p.featured);

  function addBundleToCart(bundle) {
    if (!clienteRegistrado) {
      showToast('Completá tus datos para poder alquilar');
      navigate('/alta');
      return;
    }
    bundle.items.forEach((pid) => addToCart({ productId: pid, qty: 1, from: bundle.from, to: bundle.to }));
    showToast(`Combo "${bundle.name}" agregado 🎬 — podés ajustar las fechas en el carrito`);
  }

  return (
    <main className="view active">
      <div className="hero">
        <div className="hero-eyebrow">Alquiler de equipo audiovisual</div>
        <h1>Cámaras, luces y <em>todo lo visual</em> para tu rodaje</h1>
        <p>Elegí el equipo, marcá las fechas que necesitás y mandanos tu pedido armado por WhatsApp. Gaby lo confirma y coordina la entrega con vos.</p>
        <div className="hero-actions">
          <a className="btn btn-gradient" onClick={() => navigate('/listado/todas')}>Ver listado de equipos</a>
          <a className="btn btn-outline" onClick={() => navigate('/como-alquilar')}>Cómo alquilar</a>
        </div>
      </div>

      <div className="promo-band">
        <div className="promo-watermark"><img src={lionLogoColor} alt="" /></div>
        <div className="section-title">Promociones<span>Combos armados con descuento — ideales para rodajes cortos</span></div>
        <div className="promo-grid">
          {bundles.map((b) => {
            const items = b.items.map((id) => products.find((p) => p.id === id)).filter(Boolean);
            if (!items.length) return null;
            const originalPriceNum = items.reduce((n, p) => n + p.priceNum, 0);
            const save = originalPriceNum - b.priceNum;
            return (
              <div className="promo-card" key={b.id} onClick={() => addBundleToCart(b)}>
                <span className="promo-badge">Promo</span>
                <h4>{b.name}</h4>
                <div className="promo-items">{items.map((p) => `${p.icon} ${p.name}`).join('  +  ')}</div>
                <div className="promo-price">
                  <span className="before">{money(originalPriceNum)}/día</span>
                  <span className="now">{money(b.priceNum)}/día</span>
                </div>
                <div className="promo-save">Ahorrás {money(save)}/día llevando el combo</div>
                <button className="btn btn-gradient btn-sm promo-add" onClick={(e) => { e.stopPropagation(); addBundleToCart(b); }}>Agregar combo al pedido</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-title">Recién llegados<span>Lo último que sumó Gaby al catálogo</span></div>
      <div className="featured-grid">
        {featured.map((p) => (
          <div className="tile" key={p.id} onClick={() => navigate(`/producto/${p.id}`)}>
            <div className="tile-media">
              <div className="tile-badge-logo"><img src={lionHead} alt="" /></div>
              <ProductMedia product={p} />
            </div>
            <div className="tile-title">{p.name}</div>
          </div>
        ))}
      </div>
      <div className="center-cta">
        <a className="btn btn-navy" onClick={() => navigate('/listado/todas')}>Listado de equipos</a>
      </div>
    </main>
  );
}
