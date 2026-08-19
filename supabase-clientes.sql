-- Lion Films — tabla de clientes registrados (alta de clientes).
-- Correr en Supabase: Project > SQL Editor > New query > pegar > Run.
-- Es seguro correr esto de nuevo aunque ya hayas corrido una versión
-- anterior de este archivo — no rompe nada ni duplica datos.
--
-- Antes, los "clientes registrados" que veía Gaby en Fichas eran solo los que
-- ya habían hecho un pedido (se sacaban de las reservas). Con esta tabla, se
-- guarda a TODOS los que completan el formulario de Alta de clientes, aunque
-- todavía no hayan alquilado nada — por ejemplo, para hacer un sorteo entre
-- todos los que se dieron de alta.

create table if not exists clientes (
  dni text primary key,
  nombre text not null,
  apellido text,
  tel text,
  mail text,
  dir text,
  created_at timestamptz not null default now()
);

alter table clientes enable row level security;

-- Si ya habías corrido una versión anterior de este archivo, esto limpia
-- las políticas viejas antes de crear las correctas (evita el error
-- "ya existe una política con ese nombre").
drop policy if exists "cualquiera se puede registrar" on clientes;
drop policy if exists "cualquiera puede actualizar un registro por dni" on clientes;
drop policy if exists "solo logueados pueden ver la lista de clientes" on clientes;
drop policy if exists "solo logueados pueden actualizar clientes" on clientes;

-- Cualquier visitante puede registrarse (no tiene login propio).
-- OJO: el registro se hace con "insert ... on conflict do nothing" desde la
-- app, así que si alguien ya está registrado con ese DNI, un segundo intento
-- de un visitante distinto NO pisa sus datos — se ignora en silencio.
create policy "cualquiera se puede registrar" on clientes for insert
  with check (true);

-- Actualizar un registro existente (corregir datos de un cliente) queda
-- reservado para Gaby logueada — así nadie puede sobrescribir el teléfono o
-- mail de otra persona solo por saber su DNI.
create policy "solo logueados pueden actualizar clientes" on clientes for update
  using (auth.role() = 'authenticated');

-- Solo Gaby (logueada) puede ver el listado completo de clientes.
create policy "solo logueados pueden ver la lista de clientes" on clientes for select
  using (auth.role() = 'authenticated');
