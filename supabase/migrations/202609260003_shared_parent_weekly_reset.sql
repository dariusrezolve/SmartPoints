create or replace function public.reset_weekly_points(
  p_child_id uuid,
  p_remaining_points integer,
  p_received_points integer,
  p_redeemed_points integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_time_zone text;
  v_week_start date;
begin
  if auth.uid() is null or not public.can_access_child(p_child_id) then
    raise exception 'Child profile not found' using errcode = '42501';
  end if;

  if p_received_points < 0 or p_redeemed_points < 0 then
    raise exception 'Received and redeemed points cannot be negative' using errcode = '22023';
  end if;

  select parent_settings.time_zone into v_time_zone
  from public.children
  join public.parent_settings on parent_settings.id = children.parent_id
  where children.id = p_child_id
    and children.archived_at is null;

  if v_time_zone is null then
    raise exception 'Child profile not found' using errcode = '42501';
  end if;

  v_week_start := date_trunc('week', timezone(v_time_zone, now())::date::timestamp)::date;

  insert into public.weekly_point_resets (
    child_id,
    week_start,
    remaining_points,
    received_points,
    redeemed_points
  )
  values (
    p_child_id,
    v_week_start,
    p_remaining_points,
    p_received_points,
    p_redeemed_points
  )
  on conflict (child_id, week_start) do update
  set remaining_points = excluded.remaining_points,
      received_points = excluded.received_points,
      redeemed_points = excluded.redeemed_points,
      reset_at = timezone('utc', now());
end;
$$;

revoke all on function public.reset_weekly_points(uuid, integer, integer, integer) from public;
grant execute on function public.reset_weekly_points(uuid, integer, integer, integer) to authenticated;
