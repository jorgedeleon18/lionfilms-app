-- Lion Films — grupos de categorías (Imagen, Luz, Sonido…) y edición desde el panel.
-- Correr en Supabase: Project > SQL Editor > New query > pegar > Run.
-- Es seguro correrlo de nuevo: no pisa lo que Gaby ya haya cambiado.

-- 1) Nueva columna "grupo" para armar el menú por bloques.
alter table categorias add column if not exists grupo text;

-- 2) Permite que Gaby (logueada) edite nombre, ícono y grupo de una categoría.
drop policy if exists "solo logueados editan categorias" on categorias;
create policy "solo logueados editan categorias" on categorias for update
  using (auth.role() = 'authenticated');

-- 3) Grupos iniciales sugeridos (solo para las que todavía no tienen grupo).
--    Gaby los puede cambiar después desde Staff > Catálogo > Categorías > Editar.
update categorias set grupo = 'Imagen'
  where grupo is null and lower(label) in ('cámaras', 'camaras', 'lentes', 'monitores / transmisión', 'monitores / transmision');
update categorias set grupo = 'Luz'
  where grupo is null and lower(label) in ('luces', 'modificadores de iluminacion', 'modificadores de iluminación');
update categorias set grupo = 'Sonido y comunicación'
  where grupo is null and lower(label) in ('audio', 'comunicación', 'comunicacion');
update categorias set grupo = 'Soporte y movimiento'
  where grupo is null and lower(label) in ('trípodes / soporte', 'tripodes / soporte', 'slider', 'carro max ox grip', 'brazo magico', 'brazo mágico');
update categorias set grupo = 'Accesorios'
  where grupo is null and lower(label) in ('pilas / accesorios', 'tarjetas sd', 'adaptadores', 'baterias', 'baterías', 'accesorios de camara', 'accesorios de cámara');

-- 4) Íconos propios para las que hoy tienen la cajita genérica 📦.
update categorias set icon = '🔦' where icon = '📦' and lower(label) like 'modificadores de iluminaci%';
update categorias set icon = '💾' where icon = '📦' and lower(label) = 'tarjetas sd';
update categorias set icon = '🔌' where icon = '📦' and lower(label) = 'adaptadores';
update categorias set icon = '🎞️' where icon = '📦' and lower(label) = 'slider';
update categorias set icon = '🛠️' where icon = '📦' and lower(label) = 'carro max ox grip';
update categorias set icon = '🦾' where icon = '📦' and lower(label) in ('brazo magico', 'brazo mágico');
update categorias set icon = '⚡' where icon = '📦' and lower(label) in ('baterias', 'baterías');
update categorias set icon = '🎒' where icon = '📦' and lower(label) in ('accesorios de camara', 'accesorios de cámara');
