-- Lion Films — bucket de almacenamiento para fotos de producto.
-- Correr una sola vez en Supabase: Project > SQL Editor > New query > pegar > Run.

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

-- Cualquiera puede VER las fotos (así se ven en el sitio público),
-- pero solo Gaby (logueada) puede subir, reemplazar o borrar.
create policy "lectura publica fotos productos" on storage.objects for select
  using (bucket_id = 'productos');

create policy "subir fotos solo logueados" on storage.objects for insert
  with check (bucket_id = 'productos' and auth.role() = 'authenticated');

create policy "actualizar fotos solo logueados" on storage.objects for update
  using (bucket_id = 'productos' and auth.role() = 'authenticated');

create policy "borrar fotos solo logueados" on storage.objects for delete
  using (bucket_id = 'productos' and auth.role() = 'authenticated');
