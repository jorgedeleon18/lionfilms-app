-- Lion Films — foto para los combos (promociones).
-- Correr en Supabase: Project > SQL Editor > New query > pegar > Run.
-- Es seguro correrlo de nuevo.

-- 1) Columna para guardar la dirección de la foto del combo.
alter table combos add column if not exists imagen_url text;

-- 2) Permite que Gaby (logueada) agregue o cambie la foto de un combo ya creado.
drop policy if exists "solo logueados editan combos" on combos;
create policy "solo logueados editan combos" on combos for update
  using (auth.role() = 'authenticated');
