create table public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    action text not null,
    resource_type text not null,
    resource_id uuid,
    details jsonb default '{}'::jsonb,
    ip_address text,
    created_at timestamptz default now() not null
);

grant insert, select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;

alter table public.audit_logs enable row level security;

create policy "Users can view their own logs"
on public.audit_logs
for select
to authenticated
using (auth.uid() = user_id);

-- Função helper para registrar logs
create or replace function public.log_action(
    _action text,
    _resource_type text,
    _resource_id uuid default null,
    _details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (user_id, action, resource_type, resource_id, details)
  values (auth.uid(), _action, _resource_type, _resource_id, _details);
end;
$$;