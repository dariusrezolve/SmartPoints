create table public.point_action_requests (
  parent_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  event_id uuid not null references public.point_events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, request_id)
);

alter table public.point_action_requests enable row level security;
revoke all on public.point_action_requests from public, authenticated;

create or replace function public.queue_task_completion(p_child_id uuid, p_task_id uuid, p_effective_date date, p_request_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid(); v_event_id uuid;
begin
  if v_parent_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select event_id into v_event_id from public.point_action_requests where parent_id = v_parent_id and request_id = p_request_id;
  if v_event_id is not null then return v_event_id; end if;
  v_event_id := public.record_task_completion(p_child_id, p_task_id, p_effective_date);
  insert into public.point_action_requests(parent_id, request_id, event_id) values (v_parent_id, p_request_id, v_event_id);
  return v_event_id;
end;
$$;

revoke all on function public.queue_task_completion(uuid, uuid, date, uuid) from public;
grant execute on function public.queue_task_completion(uuid, uuid, date, uuid) to authenticated;

create or replace function public.queue_task_undo(p_event_id uuid, p_request_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid(); v_event_id uuid;
begin
  if v_parent_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select event_id into v_event_id from public.point_action_requests where parent_id = v_parent_id and request_id = p_request_id;
  if v_event_id is not null then return v_event_id; end if;
  v_event_id := public.undo_task_completion(p_event_id);
  insert into public.point_action_requests(parent_id, request_id, event_id) values (v_parent_id, p_request_id, v_event_id);
  return v_event_id;
end;
$$;

create or replace function public.queue_reward_redemption(p_child_id uuid, p_reward_id uuid, p_request_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid(); v_event_id uuid;
begin
  if v_parent_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select event_id into v_event_id from public.point_action_requests where parent_id = v_parent_id and request_id = p_request_id;
  if v_event_id is not null then return v_event_id; end if;
  v_event_id := public.redeem_reward(p_child_id, p_reward_id);
  insert into public.point_action_requests(parent_id, request_id, event_id) values (v_parent_id, p_request_id, v_event_id);
  return v_event_id;
end;
$$;

revoke all on function public.queue_task_undo(uuid, uuid) from public;
revoke all on function public.queue_reward_redemption(uuid, uuid, uuid) from public;
grant execute on function public.queue_task_undo(uuid, uuid) to authenticated;
grant execute on function public.queue_reward_redemption(uuid, uuid, uuid) to authenticated;
