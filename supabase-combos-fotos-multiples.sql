-- Lion Films — hasta 6 fotos por combo.
-- Correr en Supabase: Project > SQL Editor > New query > pegar > Run.
-- Es seguro correrlo de nuevo. Hay que haber corrido antes supabase-combos-foto.sql.

-- 1) Lista de fotos del combo (la primera es la portada).
alter table combos add column if not exists imagenes text[] not null default '{}';

-- 2) Las fotos únicas que ya estaban cargadas pasan a la lista nueva.
update combos
   set imagenes = array[imagen_url]
 where imagen_url is not null
   and coalesce(array_length(imagenes, 1), 0) = 0;
