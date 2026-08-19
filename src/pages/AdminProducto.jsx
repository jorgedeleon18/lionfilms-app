import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { subirFotoProducto } from '../lib/supabaseCatalog';

const emptyForm = {
  cat: '', name: '', sub: '', descripcion: '', priceNum: '', originalPriceNum: '',
  featured: false, badge: '', img: '', stock: 1, specs: [],
};

export default function AdminProducto() {
  const navigate = useNavigate();
  const { id } = useParams(); // 'nuevo' o el id numérico
  const isNew = id === 'nuevo';
  const { gabySession, products, categories, catalogLoading, guardarProducto, eliminarProducto, showToast } = useApp();

  const existing = !isNew ? products.find((p) => p.id === Number(id)) : null;
  const [form, setForm] = useState(emptyForm);
  const [loaded, setLoaded] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!isNew && existing && !loaded) {
      setForm({
        cat: existing.cat, name: existing.name, sub: existing.sub, descripcion: existing.descripcion || '',
        priceNum: existing.priceNum, originalPriceNum: existing.originalPriceNum || '',
        featured: existing.featured, badge: existing.badge || '', img: existing.img || '',
        stock: existing.stock, specs: existing.specs.map(([etiqueta, valor]) => ({ etiqueta, valor })),
      });
      setLoaded(true);
    }
  }, [isNew, existing, loaded]);

  if (!gabySession) {
    return (
      <main className="view active">
        <div className="container">
          <p>Esta página es solo para Gaby. Iniciá sesión desde el link "Acceso del equipo" abajo del sitio.</p>
          <a className="back-link" onClick={() => navigate('/')}>← Volver al inicio</a>
        </div>
      </main>
    );
  }

  if (!isNew && !existing) {
    return <main className="view active"><div className="container"><p>{catalogLoading ? 'Cargando…' : 'Producto no encontrado.'}</p></div></main>;
  }

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setSpec(idx, field, value) {
    setForm((f) => ({ ...f, specs: f.specs.map((s, i) => (i === idx ? { ...s, [field]: value } : s)) }));
  }
  function addSpec() {
    setForm((f) => ({ ...f, specs: [...f.specs, { etiqueta: '', valor: '' }] }));
  }
  function removeSpec(idx) {
    setForm((f) => ({ ...f, specs: f.specs.filter((_, i) => i !== idx) }));
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo si hace falta
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const url = await subirFotoProducto(file);
      setField('img', url);
    } catch (err) {
      setUploadError('No se pudo subir la foto: ' + (err.message || 'algo salió mal'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.cat || !form.name || !form.priceNum) {
      showToast('Completá al menos categoría, nombre y precio');
      return;
    }
    setSaving(true);
    try {
      await guardarProducto(isNew ? null : existing.id, {
        ...form,
        specs: form.specs.filter((s) => s.etiqueta.trim() && s.valor.trim()).map((s) => [s.etiqueta, s.valor]),
      });
      showToast(isNew ? 'Producto creado ✅' : 'Producto actualizado ✅');
      navigate(`/listado/${form.cat}`);
    } catch (err) {
      showToast('Error al guardar: ' + (err.message || 'algo salió mal'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (isNew) return;
    const ok = window.confirm(`¿Borrar "${existing.name}" del catálogo? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await eliminarProducto(existing.id);
      showToast('Producto eliminado');
      navigate(`/listado/${form.cat}`);
    } catch (err) {
      showToast('Error al borrar: ' + (err.message || 'algo salió mal'));
    }
  }

  return (
    <main className="view active">
      <a className="back-link" onClick={() => navigate('/admin')}>← Volver al panel</a>
      <div className="alta-wrap" style={{ maxWidth: 720 }}>
        <div className="listado-head" style={{ marginTop: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{isNew ? 'Nuevo producto' : `Editar — ${existing.name}`}</h2>
        </div>

        <form onSubmit={handleSave}>
          <div className="field-row">
            <div className="field">
              <label>Categoría</label>
              <select value={form.cat} onChange={(e) => setField('cat', e.target.value)} required>
                <option value="">Elegí una categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Stock (unidades)</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setField('stock', e.target.value)} />
            </div>
          </div>

          <div className="field-row">
            <div className="field"><label>Nombre</label><input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Sony a7C (body)" required /></div>
          </div>
          <div className="field-row">
            <div className="field"><label>Subtítulo</label><input value={form.sub} onChange={(e) => setField('sub', e.target.value)} placeholder="Full frame compacta, mirrorless" /></div>
          </div>
          <div className="field-row">
            <div className="field"><label>Descripción</label><input value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)} placeholder="Detalle más largo (opcional)" /></div>
          </div>

          <div className="field-row">
            <div className="field"><label>Precio por día ($)</label><input type="number" min="0" value={form.priceNum} onChange={(e) => setField('priceNum', e.target.value)} required /></div>
            <div className="field"><label>Precio tachado (opcional, para promo)</label><input type="number" min="0" value={form.originalPriceNum} onChange={(e) => setField('originalPriceNum', e.target.value)} /></div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Etiqueta</label>
              <select value={form.badge} onChange={(e) => setField('badge', e.target.value)}>
                <option value="">Ninguna</option>
                <option value="promo">Promo</option>
                <option value="consultar">Consultar</option>
              </select>
            </div>
            <div className="field" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textTransform: 'none', fontWeight: 600, fontSize: 13 }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setField('featured', e.target.checked)} style={{ width: 'auto' }} />
                Mostrar en "Recién llegados"
              </label>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Foto del producto</label>
              {form.img && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <img src={form.img} alt="" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8, background: 'rgba(255,255,255,0.06)', padding: 4 }} />
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setField('img', '')}>Quitar foto</button>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
              {uploading && <p className="ficha-note" style={{ marginBottom: 0 }}>Subiendo foto…</p>}
              {uploadError && <p className="ficha-note" style={{ color: '#ff8080', marginBottom: 0 }}>{uploadError}</p>}
            </div>
          </div>
          <p className="ficha-note" style={{ marginTop: -8, marginBottom: 18 }}>Si no subís ninguna, se muestra el ícono de la categoría.</p>

          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>Ficha técnica</div>
          {form.specs.map((s, idx) => (
            <div className="field-row" key={idx} style={{ alignItems: 'flex-end' }}>
              <div className="field"><label>Título</label><input value={s.etiqueta} onChange={(e) => setSpec(idx, 'etiqueta', e.target.value)} placeholder="Ej: Sensor" /></div>
              <div className="field"><label>Valor</label><input value={s.valor} onChange={(e) => setSpec(idx, 'valor', e.target.value)} placeholder="Ej: Full Frame 24.2MP" /></div>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => removeSpec(idx)} style={{ marginBottom: 12 }}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-outline" onClick={addSpec} style={{ marginBottom: 24 }}>+ Agregar característica</button>

          <div className="summary-actions">
            <button type="submit" className="btn btn-navy btn-block" disabled={saving || uploading}>{saving ? 'Guardando…' : isNew ? 'Crear producto' : 'Guardar cambios'}</button>
            {!isNew && <button type="button" className="btn btn-ghost btn-block" onClick={handleDelete}>Borrar producto</button>}
          </div>
        </form>
      </div>
    </main>
  );
}
