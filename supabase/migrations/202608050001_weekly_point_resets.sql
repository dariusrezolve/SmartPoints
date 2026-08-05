create table if not exists public.weekly_point_resets (
  child_id uuid not null references public.children (id) on delete restrict,
  week_start date not null,
  remaining_points integer not null,
  received_points integer not null check (received_points >= 0),
  redeemed_points integer not null check (redeemed_points >= 0),
  reset_at timestamptz not null default timezone('utc', now()),
  primary key (child_id, week_start),
  check (date_trunc('week', week_start::timestamp)::date = week_start)
);

create index if not exists weekly_point_resets_child_reset_at_idx on public.weekly_point_resets (child_id, reset_at desc);

alter table public.weekly_point_resets enable row level security;

drop policy if exists "parents can read weekly point resets" on public.weekly_point_resets;
create policy "parents can read weekly point resets" on public.weekly_point_resets for select to authenticated
  using (exists (select 1 from public.children where children.id = weekly_point_resets.child_id and children.parent_id = (select auth.uid()) and children.archived_at is null));

grant select on public.weekly_point_resets to authenticated;

create or replace function public.reset_weekly_points(p_child_id uuid, p_remaining_points integer, p_received_points integer, p_redeemed_points integer)
returns void language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid(); v_time_zone text; v_week_start date;
begin
  if v_parent_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_received_points < 0 or p_redeemed_points < 0 then raise exception 'Received and redeemed points cannot be negative' using errcode = '22023'; end if;
  select time_zone into v_time_zone from public.parent_settings where id = v_parent_id;
  if not exists (select 1 from public.children where id = p_child_id and parent_id = v_parent_id and archived_at is null) then raise exception 'Child profile not found' using errcode = '42501'; end if;
  v_week_start := date_trunc('week', timezone(coalesce(v_time_zone, 'UTC'), now())::date::timestamp)::date;
  insert into public.weekly_point_resets (child_id, week_start, remaining_points, received_points, redeemed_points)
  values (p_child_id, v_week_start, p_remaining_points, p_received_points, p_redeemed_points)
  on conflict (child_id, week_start) do update set remaining_points = excluded.remaining_points, received_points = excluded.received_points, redeemed_points = excluded.redeemed_points, reset_at = timezone('utc', now());
end;
$$;

revoke all on function public.reset_weekly_points(uuid, integer, integer, integer) from public;
grant execute on function public.reset_weekly_points(uuid, integer, integer, integer) to authenticated;
