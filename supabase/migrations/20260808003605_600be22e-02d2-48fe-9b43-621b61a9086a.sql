revoke execute on function public.log_action(text, text, uuid, jsonb) from public;
grant execute on function public.log_action(text, text, uuid, jsonb) to authenticated, service_role;