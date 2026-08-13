alter table public.point_events drop constraint if exists point_events_event_type_check;
alter table public.point_events drop constraint if exists point_events_check;
alter table public.point_events drop constraint if exists point_events_check1;
alter table public.point_events drop constraint if exists point_events_check2;

alter table public.point_events
  add constraint point_events_event_type_check check (event_type in ('task_completion', 'task_completion_undo', 'reward_redemption', 'reward_redemption_undo')),
  add constraint point_events_task_reference_check check ((event_type in ('task_completion', 'task_completion_undo')) = (task_id is not null)),
  add constraint point_events_reward_reference_check check ((event_type in ('reward_redemption', 'reward_redemption_undo')) = (reward_id is not null)),
  add constraint point_events_reversal_reference_check check ((event_type in ('task_completion_undo', 'reward_redemption_undo')) = (reversal_of is not null));

create or replace function public.undo_reward_redemption(p_event_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_id uuid := auth.uid();
  v_child_id uuid;
  v_cost integer;
  v_date date;
  v_reward_id uuid;
  v_event_id uuid;
begin
  if v_parent_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select child_id, point_delta, effective_date, reward_id into v_child_id, v_cost, v_date, v_reward_id
  from public.point_events where id = p_event_id and event_type = 'reward_redemption' for update;
  if v_child_id is null or not public.can_access_child(v_child_id) then raise exception 'Reward redemption not found' using errcode = '42501'; end if;
  if exists (select 1 from public.point_events where reversal_of = p_event_id) then raise exception 'Reward redemption was already undone' using errcode = '23505'; end if;
  insert into public.point_events (child_id, event_type, point_delta, effective_date, reward_id, reversal_of)
  values (v_child_id, 'reward_redemption_undo', -v_cost, v_date, v_reward_id, p_event_id)
  returning id into v_event_id;
  return v_event_id;
end;
$$;

create or replace function public.queue_reward_undo(p_event_id uuid, p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_id uuid := auth.uid();
  v_child_id uuid;
  v_cost integer;
  v_date date;
  v_reward_id uuid;
  v_event_id uuid;
begin
  if v_parent_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select event_id into v_event_id from public.point_action_requests where parent_id = v_parent_id and request_id = p_request_id;
  if v_event_id is not null then return v_event_id; end if;

  select child_id, point_delta, effective_date, reward_id into v_child_id, v_cost, v_date, v_reward_id
  from public.point_events where id = p_event_id and event_type = 'reward_redemption';
  if v_child_id is null or not public.can_access_child(v_child_id) then raise exception 'Reward redemption not found' using errcode = '42501'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_event_id::text, 1));
  select id into v_event_id from public.point_events where reversal_of = p_event_id;
  if v_event_id is null then
    insert into public.point_events (child_id, event_type, point_delta, effective_date, reward_id, reversal_of)
    values (v_child_id, 'reward_redemption_undo', -v_cost, v_date, v_reward_id, p_event_id)
    returning id into v_event_id;
  end if;
  insert into public.point_action_requests (parent_id, request_id, event_id) values (v_parent_id, p_request_id, v_event_id);
  return v_event_id;
end;
$$;

revoke all on function public.undo_reward_redemption(uuid) from public;
revoke all on function public.queue_reward_undo(uuid, uuid) from public;
grant execute on function public.undo_reward_redemption(uuid) to authenticated;
grant execute on function public.queue_reward_undo(uuid, uuid) to authenticated;
