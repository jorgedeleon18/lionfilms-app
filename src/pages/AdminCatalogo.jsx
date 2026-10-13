import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { money } from '../utils';
import { ICONOS_SUGERIDOS } from '../lib/categorias';

export default function AdminCatalogo() {
  const navigate = useNavigate();
  const {
    gabySession, categories, products, bundles, showToast,
    guardarCategoria, editarCategoria, eliminarCategoria, guardarCombo, eliminarCombo,
  } = useApp();
  const [tab, setTab] = useState('categorias');

  const [catForm, setCatForm] = useState({ id: '', label: '', icon: '', grupo: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ label: '', icon: '', grupo: '' });
  const [comboForm, setComboForm] = useState({ name: '', priceNum: '', from: '', to: '', items: [] });

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

  async function handleAddCategoria(e) {
    e.preventDefault();
    if (!catForm.id.trim() || !catForm.label.trim()) { showToast('Completá el ID y el nombre'); return; }
    try {
      await guardarCategoria(catForm);
      setCatForm({ id: '', label: '', icon: '', grupo: '' });
      showToast('Categoría creada ✅');
    } catch (err) {
      showToast('Error: ' + (err.message || 'no se pudo crear'));
    }
  }

  function abrirEdicion(c) {
    setEditId(c.id);
    setEditForm({ label: c.label, icon: c.icon || '', grupo: c.grupo || '' });
  }

  async function handleGuardarEdicion() {
    if (!editForm.label.trim()) { showToast('El nombre no puede quedar vacío'); return; }
    try {
      await editarCategoria(editId, { ...editForm, label: editForm.label.trim() });
      setEditId(null);
      showToast('Categoría actualizada ✅');
    } catch (err) {
      const falta = /grupo/i.test(err.message || '');
      showToast(falta ? 'Falta correr supabase-categorias-grupos.sql en Supabase' : 'Error: ' + (err.message || 'no se pudo guardar'));
    }
  }

  async function handleDeleteCategoria(id) {
    const enUso = products.some((p) => p.cat === id);
    if (enUso) { showToast('No se puede borrar: hay productos usando esta categoría'); return; }
    const ok = window.confirm('¿Borrar esta categoría?');
    if (!ok) return;
    try {
      await eliminarCategoria(id);
      showToast('Categoría eliminada');
    } catch (err) {
      showToast('Error: ' + (err.message || 'no se pudo borrar'));
    }
  }

  function toggleComboItem(pid) {
    setComboForm((f) => ({
      ...f,
      items: f.items.includes(pid) ? f.items.filter((x) => x !== pid) : [...f.items, pid],
    }));
  }

  async function handleAddCombo(e) {
    e.preventDefault();
    if (!comboForm.name.trim() || !comboForm.priceNum || comboForm.items.length < 2) {
      showToast('Completá nombre, precio y elegí al menos 2 productos');
      return;
    }
    try {
      await guardarCombo(comboForm);
      setComboForm({ name: '', priceNum: '', from: '', to: '', items: [] });
      showToast('Combo creado ✅');
    } catch (err) {
      showToast('Error: ' + (err.message || 'no se pudo crear'));
    }
  }

  async function handleDeleteCombo(id) {
    const ok = window.confirm('¿Borrar este combo?');
    if (!ok) return;
    try {
      await eliminarCombo(id);
      showToast('Combo eliminado');
    } catch (err) {
      showToast('Error: ' + (err.message || 'no se pudo borrar'));
    }
  }

  return (
    <main className="view active">
      <a className="back-link" onClick={() => navigate('/admin')}>← Volver al panel</a>
      <div className="alta-wrap" style={{ maxWidth: 900 }}>
        <div className="listado-head" style={{ marginTop: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>🗂️ Catálogo — Gaby</h2>
          <div className="muted">Productos, categorías y combos</div>
        </div>

        <div className="fichas-tabs">
          <div className={`fichas-tab${tab === 'productos' ? ' active' : ''}`} onClick={() => setTab('productos')}>Productos</div>
          <div className={`fichas-tab${tab === 'categorias' ? ' active' : ''}`} onClick={() => setTab('categorias')}>Categorías</div>
          <div className={`fichas-tab${tab === 'combos' ? ' active' : ''}`} onClick={() => setTab('combos')}>Combos</div>
        </div>

        {tab === 'productos' && (
          <div>
            <p className="cal-admin-note">Cargá un producto nuevo desde acá, o andá al listado de equipos para editar, borrar o gestionar fechas de los que ya existen.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-gradient" onClick={() => navigate('/admin/productos/nuevo')}>+ Nuevo producto</button>
              <button className="btn btn-navy" onClick={() => navigate('/listado/todas')}>Ir al listado de equipos</button>
            </div>
          </div>
        )}

        {tab === 'categorias' && (
          <div>
            <div className="ficha-card">
              {categories.map((c) => (
                editId === c.id ? (
                  <div key={c.id} className="cat-edit">
                    <div className="field-row">
                      <div className="field"><label>Nombre</label><input value={editForm.label} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} /></div>
                      <div className="field">
                        <label>Grupo del menú (ej: Imagen, Sonido)</label>
                        <input list="grupos-existentes" value={editForm.grupo} onChange={(e) => setEditForm({ ...editForm, grupo: e.target.value })} placeholder="Sin grupo" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Ícono</label>
                      <div className="icon-picker">
                        {ICONOS_SUGERIDOS.map((i) => (
                          <button type="button" key={i} className={`icon-opt${editForm.icon === i ? ' active' : ''}`} onClick={() => setEditForm({ ...editForm, icon: i })}>{i}</button>
                        ))}
                        <input className="icon-custom" value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} placeholder="o escribí otro" maxLength={4} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-navy" onClick={handleGuardarEdicion}>Guardar</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditId(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div key={c.id} className="ficha-reserva">
                    <div className="thumb">{c.icon}</div>
                    <div className="r-info"><b>{c.label}</b><span>{c.grupo ? `Grupo: ${c.grupo}` : 'Sin grupo'} · id: {c.id}</span></div>
                    <button className="btn btn-sm btn-ghost" onClick={() => abrirEdicion(c)}>Editar</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleDeleteCategoria(c.id)}>Borrar</button>
                  </div>
                )
              ))}
              <datalist id="grupos-existentes">
                {[...new Set(categories.map((c) => c.grupo).filter(Boolean))].map((g) => <option key={g} value={g} />)}
              </datalist>
            </div>
            <div style={{ marginTop: 20, fontWeight: 700, fontSize: 13 }}>+ Nueva categoría</div>
            <form onSubmit={handleAddCategoria}>
              <div className="field-row">
                <div className="field"><label>ID (sin espacios)</label><input value={catForm.id} onChange={(e) => setCatForm({ ...catForm, id: e.target.value.trim().toLowerCase() })} placeholder="drones" /></div>
                <div className="field"><label>Nombre</label><input value={catForm.label} onChange={(e) => setCatForm({ ...catForm, label: e.target.value })} placeholder="Drones" /></div>
                <div className="field"><label>Ícono (emoji)</label><input value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} placeholder="🚁" /></div>
                <div className="field"><label>Grupo (opcional)</label><input list="grupos-existentes" value={catForm.grupo} onChange={(e) => setCatForm({ ...catForm, grupo: e.target.value })} placeholder="Imagen" /></div>
              </div>
              <button type="submit" className="btn btn-navy">Agregar categoría</button>
            </form>
          </div>
        )}

        {tab === 'combos' && (
          <div>
            <div className="ficha-card">
              {bundles.length === 0 && <p className="muted">Todavía no hay combos creados.</p>}
              {bundles.map((b) => (
                <div key={b.id} className="ficha-reserva">
                  <div className="r-info"><b>{b.name}</b><span>{money(b.priceNum)}/día · {b.items.length} productos</span></div>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleDeleteCombo(b.id)}>Borrar</button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, fontWeight: 700, fontSize: 13 }}>+ Nuevo combo</div>
            <form onSubmit={handleAddCombo}>
              <div className="field-row">
                <div className="field"><label>Nombre</label><input value={comboForm.name} onChange={(e) => setComboForm({ ...comboForm, name: e.target.value })} placeholder="Combo Documental" /></div>
                <div className="field"><label>Precio del combo ($/día)</label><input type="number" min="0" value={comboForm.priceNum} onChange={(e) => setComboForm({ ...comboForm, priceNum: e.target.value })} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Fecha desde (sugerida, opcional)</label><input type="date" value={comboForm.from} onChange={(e) => setComboForm({ ...comboForm, from: e.target.value })} /></div>
                <div className="field"><label>Fecha hasta (sugerida, opcional)</label><input type="date" value={comboForm.to} onChange={(e) => setComboForm({ ...comboForm, to: e.target.value })} /></div>
              </div>
              <div style={{ marginBottom: 8, fontSize: 12.5, color: 'var(--text-mid)', fontWeight: 700 }}>Elegí los productos que incluye (mínimo 2)</div>
              <div className="ficha-card" style={{ maxHeight: 220, overflowY: 'auto' }}>
                {products.map((p) => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={comboForm.items.includes(p.id)} onChange={() => toggleComboItem(p.id)} style={{ width: 'auto' }} />
                    {p.icon} {p.name}
                  </label>
                ))}
              </div>
              <button type="submit" className="btn btn-navy" style={{ marginTop: 14 }}>Crear combo</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
