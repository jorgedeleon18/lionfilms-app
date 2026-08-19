-- Lion Films — tabla de clientes registrados (alta de clientes).
-- Correr una sola vez en Supabase: Project > SQL Editor > New query > pegar > Run.
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

-- Cualquier visitante puede registrarse (no tiene login propio).
create policy "cualquiera se puede registrar" on clientes for insert
  with check (true);

-- Si se registra de nuevo con el mismo DNI (por ej. para actualizar sus
-- datos), se actualiza su propia fila.
create policy "cualquiera puede actualizar un registro por dni" on clientes for update
  using (true) with check (true);

-- Solo Gaby (logueada) puede ver el listado completo de clientes.
create policy "solo logueados pueden ver la lista de clientes" on clientes for select
  using (auth.role() = 'authenticated');
