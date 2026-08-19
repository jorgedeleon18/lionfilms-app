-- Lion Films — esquema del catálogo (categorías, productos, características, combos)
-- Correr una sola vez en Supabase: Project > SQL Editor > New query > pegar > Run.

create table if not exists categorias (
  id text primary key,           -- slug, ej: 'camaras'
  label text not null,           -- nombre visible, ej: 'Cámaras'
  icon text,                     -- emoji o ícono, ej: '📷'
  orden int not null default 0
);

create table if not exists productos (
  id bigint generated always as identity primary key,
  categoria_id text not null references categorias(id) on delete restrict,
  nombre text not null,
  subtitulo text,
  descripcion text,
  precio_num numeric not null default 0,
  precio_original_num numeric,        -- si tiene descuento (precio tachado), si no: null
  destacado boolean not null default false,   -- aparece en "Recién llegados"
  badge text,                          -- 'promo' | 'consultar' | null
  imagen_url text,                     -- null = usa ícono de categoría
  stock int not null default 1,
  creado_en timestamptz not null default now()
);

create table if not exists producto_specs (
  id bigint generated always as identity primary key,
  producto_id bigint not null references productos(id) on delete cascade,
  etiqueta text not null,     -- ej: 'Sensor', 'Altura', 'Potencia' (lo que Gaby quiera)
  valor text not null,        -- ej: 'Full Frame 24.2MP'
  orden int not null default 0
);

create table if not exists combos (
  id bigint generated always as identity primary key,
  nombre text not null,
  precio_num numeric not null default 0,
  fecha_desde date,
  fecha_hasta date
);

create table if not exists combo_items (
  combo_id bigint not null references combos(id) on delete cascade,
  producto_id bigint not null references productos(id) on delete cascade,
  primary key (combo_id, producto_id)
);

-- Seguridad: cualquiera puede VER el catálogo (sitio público), pero solo
-- Gaby (logueada) puede crear/editar/borrar.
alter table categorias enable row level security;
alter table productos enable row level security;
alter table producto_specs enable row level security;
alter table combos enable row level security;
alter table combo_items enable row level security;

create policy "lectura publica categorias" on categorias for select using (true);
create policy "lectura publica productos" on productos for select using (true);
create policy "lectura publica producto_specs" on producto_specs for select using (true);
create policy "lectura publica combos" on combos for select using (true);
create policy "lectura publica combo_items" on combo_items for select using (true);

create policy "escritura solo logueados categorias" on categorias for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escritura solo logueados productos" on productos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escritura solo logueados producto_specs" on producto_specs for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escritura solo logueados combos" on combos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escritura solo logueados combo_items" on combo_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Categorías iniciales (esto sí lo cargo yo, son fijas de arranque —
-- Gaby después puede agregar/sacar categorías desde el panel igual).
insert into categorias (id, label, icon, orden) values
  ('camaras', 'Cámaras', '📷', 1),
  ('lentes', 'Lentes', '🔍', 2),
  ('tripodes', 'Trípodes / Soporte', '🎚️', 3),
  ('luces', 'Luces', '💡', 4),
  ('audio', 'Audio', '🎙️', 5),
  ('monitores', 'Monitores / Transmisión', '🖥️', 6),
  ('comunicacion', 'Comunicación', '📻', 7),
  ('pilas', 'Pilas / Accesorios', '🔋', 8)
on conflict (id) do nothing;
