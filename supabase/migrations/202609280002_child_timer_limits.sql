create table public.child_timer_limits (
  child_id uuid primary key references public.children(id) on delete cascade,
  max_concurrent_minutes integer not null default 60,
  max_daily_minutes integer not null default 120,
  updated_at timestamptz not null default timezone('utc', now()),
  check (max_concurrent_minutes between 1 and 1440),
  check (max_daily_minutes between 1 and 1440)
);

create trigger set_child_timer_limits_updated_at before update on public.child_timer_limits
  for each row execute function public.set_updated_at();

alter table public.child_timer_limits enable row level security;
grant select on public.child_timer_limits to authenticated;
create policy "members can read child timer limits" on public.child_timer_limits for select to authenticated
  using (public.can_access_child(child_id));

create or replace function public.set_child_timer_limits(p_child_id uuid, p_max_concurrent_minutes integer, p_max_daily_minutes integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode = '42501'; end if;
  if p_max_concurrent_minutes not between 1 and 1440 then raise exception 'Concurrent timer limit must be between 1 and 1440 minutes' using errcode = '22023'; end if;
  if p_max_daily_minutes not between 1 and 1440 then raise exception 'Daily timer limit must be between 1 and 1440 minutes' using errcode = '22023'; end if;
  insert into public.child_timer_limits(child_id, max_concurrent_minutes, max_daily_minutes)
  values (p_child_id, p_max_concurrent_minutes, p_max_daily_minutes)
  on conflict (child_id) do update set max_concurrent_minutes = excluded.max_concurrent_minutes, max_daily_minutes = excluded.max_daily_minutes;
end;
$$;

revoke all on function public.set_child_timer_limits(uuid, integer, integer) from public;
grant execute on function public.set_child_timer_limits(uuid, integer, integer) to authenticated;
