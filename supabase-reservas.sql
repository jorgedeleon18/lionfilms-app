-- Lion Films — reservas y fechas bloqueadas en Supabase.
-- Correr en Supabase: Project > SQL Editor > New query > pegar > Run.
-- Es seguro correrlo de nuevo: no rompe ni duplica nada.
--
-- Antes, los pedidos y las fechas bloqueadas se guardaban solo en el
-- navegador de cada persona. Con estas tablas, todos ven las mismas fechas
-- bloqueadas y Gaby ve todos los pedidos desde cualquier dispositivo.

-- ---------- Fechas bloqueadas (las ve cualquiera, las cambia solo Gaby) ----------
create table if not exists bloqueos (
  producto_id bigint not null,
  fecha date not null,
  primary key (producto_id, fecha)
);

alter table bloqueos enable row level security;

drop policy if exists "todos ven los bloqueos" on bloqueos;
drop policy if exists "solo logueados bloquean" on bloqueos;
drop policy if exists "solo logueados liberan" on bloqueos;

create policy "todos ven los bloqueos" on bloqueos for select
  using (true);
create policy "solo logueados bloquean" on bloqueos for insert
  with check (auth.role() = 'authenticated');
create policy "solo logueados liberan" on bloqueos for delete
  using (auth.role() = 'authenticated');

-- ---------- Pedidos ----------
create table if not exists reservas (
  id uuid primary key,
  cliente_dni text not null,
  cliente_nombre text not null,
  cliente_apellido text,
  cliente_tel text,
  cliente_mail text,
  cliente_dir text,
  created_at timestamptz not null default now()
);

create table if not exists reserva_items (
  id uuid primary key default gen_random_uuid(),
  reserva_id uuid not null references reservas(id) on delete cascade,
  producto_id bigint not null,
  cantidad integer not null default 1 check (cantidad > 0),
  desde date not null,
  hasta date not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'entregado', 'no_disponible')),
  created_at timestamptz not null default now()
);

alter table reservas enable row level security;
alter table reserva_items enable row level security;

drop policy if exists "cualquiera envia un pedido" on reservas;
drop policy if exists "solo logueados ven pedidos" on reservas;
drop policy if exists "solo logueados editan pedidos" on reservas;
drop policy if exists "solo logueados borran pedidos" on reservas;
drop policy if exists "cualquiera envia items" on reserva_items;
drop policy if exists "solo logueados ven items" on reserva_items;
drop policy if exists "solo logueados editan items" on reserva_items;
drop policy if exists "solo logueados borran items" on reserva_items;

-- Cualquier visitante puede ENVIAR un pedido, pero no leerlos (así nadie ve
-- los datos de otros clientes). Los items solo se pueden crear "pendientes".
create policy "cualquiera envia un pedido" on reservas for insert
  with check (true);
create policy "solo logueados ven pedidos" on reservas for select
  using (auth.role() = 'authenticated');
create policy "solo logueados editan pedidos" on reservas for update
  using (auth.role() = 'authenticated');
create policy "solo logueados borran pedidos" on reservas for delete
  using (auth.role() = 'authenticated');

create policy "cualquiera envia items" on reserva_items for insert
  with check (estado = 'pendiente');
create policy "solo logueados ven items" on reserva_items for select
  using (auth.role() = 'authenticated');
create policy "solo logueados editan items" on reserva_items for update
  using (auth.role() = 'authenticated');
create policy "solo logueados borran items" on reserva_items for delete
  using (auth.role() = 'authenticated');
