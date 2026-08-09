create or replace function public.queue_task_completion(
  p_child_id uuid,
  p_task_id uuid,
  p_effective_date date,
  p_points integer,
  p_request_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_id uuid := auth.uid();
  v_event_id uuid;
begin
  if v_parent_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.can_access_child(p_child_id) then
    raise exception 'Child profile not found' using errcode = '42501';
  end if;
  if p_points is null or p_points < 1 then
    raise exception 'Points must be a positive whole number' using errcode = '22023';
  end if;
  if not exists (select 1 from public.tasks where id = p_task_id and child_id = p_child_id) then
    raise exception 'Task not found' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select event_id into v_event_id
  from public.point_action_requests
  where parent_id = v_parent_id and request_id = p_request_id;
  if v_event_id is not null then return v_event_id; end if;

  insert into public.point_events (child_id, event_type, point_delta, effective_date, task_id)
  values (p_child_id, 'task_completion', p_points, p_effective_date, p_task_id)
  returning id into v_event_id;
  insert into public.point_action_requests (parent_id, request_id, event_id)
  values (v_parent_id, p_request_id, v_event_id);
  return v_event_id;
end;
$$;

create or replace function public.queue_task_completion(
  p_child_id uuid,
  p_task_id uuid,
  p_effective_date date,
  p_request_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_points integer;
begin
  select points into v_points from public.tasks where id = p_task_id and child_id = p_child_id;
  if v_points is null then raise exception 'Task not found' using errcode = '22023'; end if;
  return public.queue_task_completion(p_child_id, p_task_id, p_effective_date, v_points, p_request_id);
end;
$$;

create or replace function public.queue_reward_redemption(
  p_child_id uuid,
  p_reward_id uuid,
  p_cost integer,
  p_request_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_id uuid := auth.uid();
  v_event_id uuid;
  v_time_zone text;
begin
  if v_parent_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.can_access_child(p_child_id) then
    raise exception 'Child profile not found' using errcode = '42501';
  end if;
  if p_cost is null or p_cost < 1 then
    raise exception 'Reward cost must be a positive whole number' using errcode = '22023';
  end if;
  if not exists (select 1 from public.rewards where id = p_reward_id and child_id = p_child_id) then
    raise exception 'Reward not found' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select event_id into v_event_id
  from public.point_action_requests
  where parent_id = v_parent_id and request_id = p_request_id;
  if v_event_id is not null then return v_event_id; end if;

  select settings.time_zone into v_time_zone
  from public.parent_settings as settings
  join public.children as child on child.parent_id = settings.id
  where child.id = p_child_id;
  insert into public.point_events (child_id, event_type, point_delta, effective_date, reward_id)
  values (p_child_id, 'reward_redemption', -p_cost, timezone(coalesce(v_time_zone, 'UTC'), now())::date, p_reward_id)
  returning id into v_event_id;
  insert into public.point_action_requests (parent_id, request_id, event_id)
  values (v_parent_id, p_request_id, v_event_id);
  return v_event_id;
end;
$$;

create or replace function public.queue_reward_redemption(
  p_child_id uuid,
  p_reward_id uuid,
  p_request_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cost integer;
begin
  select cost into v_cost from public.rewards where id = p_reward_id and child_id = p_child_id;
  if v_cost is null then raise exception 'Reward not found' using errcode = '22023'; end if;
  return public.queue_reward_redemption(p_child_id, p_reward_id, v_cost, p_request_id);
end;
$$;

create or replace function public.queue_task_undo(p_event_id uuid, p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_id uuid := auth.uid();
  v_child_id uuid;
  v_points integer;
  v_date date;
  v_task_id uuid;
  v_event_id uuid;
begin
  if v_parent_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select event_id into v_event_id
  from public.point_action_requests
  where parent_id = v_parent_id and request_id = p_request_id;
  if v_event_id is not null then return v_event_id; end if;

  select child_id, point_delta, effective_date, task_id
  into v_child_id, v_points, v_date, v_task_id
  from public.point_events
  where id = p_event_id and event_type = 'task_completion';
  if v_child_id is null or not public.can_access_child(v_child_id) then
    raise exception 'Completion not found' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_event_id::text, 1));
  select id into v_event_id from public.point_events where reversal_of = p_event_id;
  if v_event_id is null then
    insert into public.point_events (child_id, event_type, point_delta, effective_date, task_id, reversal_of)
    values (v_child_id, 'task_completion_undo', -v_points, v_date, v_task_id, p_event_id)
    returning id into v_event_id;
  end if;
  insert into public.point_action_requests (parent_id, request_id, event_id)
  values (v_parent_id, p_request_id, v_event_id);
  return v_event_id;
end;
$$;

revoke all on function public.queue_task_completion(uuid, uuid, date, integer, uuid) from public;
revoke all on function public.queue_task_completion(uuid, uuid, date, uuid) from public;
revoke all on function public.queue_reward_redemption(uuid, uuid, integer, uuid) from public;
revoke all on function public.queue_reward_redemption(uuid, uuid, uuid) from public;
revoke all on function public.queue_task_undo(uuid, uuid) from public;
grant execute on function public.queue_task_completion(uuid, uuid, date, integer, uuid) to authenticated;
grant execute on function public.queue_task_completion(uuid, uuid, date, uuid) to authenticated;
grant execute on function public.queue_reward_redemption(uuid, uuid, integer, uuid) to authenticated;
grant execute on function public.queue_reward_redemption(uuid, uuid, uuid) to authenticated;
grant execute on function public.queue_task_undo(uuid, uuid) to authenticated;
