-- Lion Films — avisos por mail a Gaby (cliente nuevo / pedido nuevo).
-- Correr en Supabase: Project > SQL Editor > New query > pegar > Run.
--
-- ANTES de correrlo, reemplazar PEGAR_EL_SECRETO por la misma contraseña que
-- guardaste como WEBHOOK_SECRET en Edge Functions > Secrets (sin comillas extra:
-- el texto va entre las comillas simples que ya están).
-- La dirección de la función ya está puesta; verificá que coincida con la que
-- muestra Supabase en Edge Functions > notificar (la de arriba, con ícono de copiar).
--
-- Es seguro correrlo de nuevo (por ejemplo, para cambiar el secreto).

create extension if not exists pg_net with schema extensions;

create or replace function public.notificar_evento()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform net.http_post(
    url := 'https://fauzynceuyoxeafsiqai.supabase.co/functions/v1/notificar',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'PEGAR_EL_SECRETO'
    ),
    body := jsonb_build_object('tabla', TG_TABLE_NAME, 'registro', to_jsonb(NEW))
  );
  return NEW;
exception when others then
  -- Si el aviso falla, el registro o el pedido del cliente se guarda igual.
  return NEW;
end;
$$;

drop trigger if exists aviso_nuevo_cliente on clientes;
create trigger aviso_nuevo_cliente
  after insert on clientes
  for each row execute function public.notificar_evento();

drop trigger if exists aviso_nuevo_pedido on reservas;
create trigger aviso_nuevo_pedido
  after insert on reservas
  for each row execute function public.notificar_evento();
