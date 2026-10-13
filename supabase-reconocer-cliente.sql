-- Lion Films — "Ya alquilé antes": reconocer a un cliente que ya se registró.
-- Correr en Supabase: Project > SQL Editor > New query > pegar > Run.
-- Es seguro correrlo de nuevo.
--
-- La tabla clientes sigue cerrada al público (nadie puede leerla). Esta
-- función es la única puerta: devuelve los datos de UN cliente solo si quien
-- consulta acierta el DNI *y* el teléfono o el email con el que se registró.
-- Con el DNI solo no alcanza (el DNI no es un secreto).

create or replace function reconocer_cliente(p_dni text, p_contacto text)
returns table (dni text, nombre text, apellido text, tel text, mail text, dir text)
language sql
security definer
set search_path = public
as $$
  select c.dni, c.nombre, c.apellido, c.tel, c.mail, c.dir
  from clientes c
  where c.dni = regexp_replace(coalesce(p_dni, ''), '\D', '', 'g')
    and (
      (c.tel is not null
        and length(regexp_replace(coalesce(p_contacto, ''), '\D', '', 'g')) > 0
        and c.tel = regexp_replace(coalesce(p_contacto, ''), '\D', '', 'g'))
      or
      (c.mail is not null
        and length(trim(coalesce(p_contacto, ''))) > 0
        and lower(trim(c.mail)) = lower(trim(p_contacto)))
    )
  limit 1;
$$;

revoke all on function reconocer_cliente(text, text) from public;
grant execute on function reconocer_cliente(text, text) to anon, authenticated;
