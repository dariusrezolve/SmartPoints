create table public.tasks (
  id uuid primary key default extensions.gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete restrict,
  name text not null,
  points integer not null,
  starter_key text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (char_length(name) between 1 and 80),
  check (name = btrim(name)),
  check (points > 0)
);

create table public.rewards (
  id uuid primary key default extensions.gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete restrict,
  name text not null,
  cost integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (char_length(name) between 1 and 80),
  check (name = btrim(name)),
  check (cost > 0)
);

create table public.point_events (
  id uuid primary key default extensions.gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete restrict,
  event_type text not null,
  point_delta integer not null,
  effective_date date not null,
  task_id uuid references public.tasks (id) on delete restrict,
  reward_id uuid references public.rewards (id) on delete restrict,
  reversal_of uuid references public.point_events (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  check (event_type in ('task_completion', 'task_completion_undo', 'reward_redemption')),
  check (point_delta <> 0),
  check ((event_type in ('task_completion', 'task_completion_undo')) = (task_id is not null)),
  check ((event_type = 'reward_redemption') = (reward_id is not null)),
  check ((event_type = 'task_completion_undo') = (reversal_of is not null))
);

create unique index point_events_one_undo_per_completion_idx
  on public.point_events (reversal_of)
  where reversal_of is not null;

create index tasks_child_active_created_at_idx on public.tasks (child_id, created_at) where is_active;
create index rewards_child_active_created_at_idx on public.rewards (child_id, created_at) where is_active;
create index point_events_child_effective_date_created_at_idx on public.point_events (child_id, effective_date desc, created_at desc);

create trigger set_tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger set_rewards_updated_at before update on public.rewards for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.rewards enable row level security;
alter table public.point_events enable row level security;

create policy "parents can read active tasks" on public.tasks for select to authenticated
  using (is_active and exists (select 1 from public.children where children.id = tasks.child_id and children.parent_id = (select auth.uid()) and children.archived_at is null));
create policy "parents can create tasks" on public.tasks for insert to authenticated
  with check (exists (select 1 from public.children where children.id = tasks.child_id and children.parent_id = (select auth.uid()) and children.archived_at is null));
create policy "parents can update active tasks" on public.tasks for update to authenticated
  using (is_active and exists (select 1 from public.children where children.id = tasks.child_id and children.parent_id = (select auth.uid()) and children.archived_at is null))
  with check (exists (select 1 from public.children where children.id = tasks.child_id and children.parent_id = (select auth.uid()) and children.archived_at is null));

create policy "parents can read active rewards" on public.rewards for select to authenticated
  using (is_active and exists (select 1 from public.children where children.id = rewards.child_id and children.parent_id = (select auth.uid()) and children.archived_at is null));
create policy "parents can create rewards" on public.rewards for insert to authenticated
  with check (exists (select 1 from public.children where children.id = rewards.child_id and children.parent_id = (select auth.uid()) and children.archived_at is null));
create policy "parents can update active rewards" on public.rewards for update to authenticated
  using (is_active and exists (select 1 from public.children where children.id = rewards.child_id and children.parent_id = (select auth.uid()) and children.archived_at is null))
  with check (exists (select 1 from public.children where children.id = rewards.child_id and children.parent_id = (select auth.uid()) and children.archived_at is null));

create policy "parents can read point events" on public.point_events for select to authenticated
  using (exists (select 1 from public.children where children.id = point_events.child_id and children.parent_id = (select auth.uid())));

grant select, insert, update on public.tasks to authenticated;
grant select, insert, update on public.rewards to authenticated;
grant select on public.point_events to authenticated;

create or replace function public.record_task_completion(p_child_id uuid, p_task_id uuid, p_effective_date date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid(); v_time_zone text; v_today date; v_week_start date; v_points integer; v_event_id uuid;
begin
  if v_parent_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select time_zone into v_time_zone from public.parent_settings where id = v_parent_id;
  if not exists (select 1 from public.children where id = p_child_id and parent_id = v_parent_id and archived_at is null) then raise exception 'Child profile not found' using errcode = '42501'; end if;
  select points into v_points from public.tasks where id = p_task_id and child_id = p_child_id and is_active;
  if v_points is null then raise exception 'Task not found' using errcode = '42501'; end if;
  v_today := timezone(coalesce(v_time_zone, 'UTC'), now())::date;
  v_week_start := date_trunc('week', v_today::timestamp)::date;
  if p_effective_date < v_week_start or p_effective_date > v_today then raise exception 'Choose a day in the current week that is not in the future' using errcode = '22023'; end if;
  insert into public.point_events (child_id, event_type, point_delta, effective_date, task_id) values (p_child_id, 'task_completion', v_points, p_effective_date, p_task_id) returning id into v_event_id;
  return v_event_id;
end;
$$;

create or replace function public.undo_task_completion(p_event_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid(); v_child_id uuid; v_points integer; v_date date; v_task_id uuid; v_event_id uuid;
begin
  if v_parent_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select child_id, point_delta, effective_date, task_id into v_child_id, v_points, v_date, v_task_id from public.point_events where id = p_event_id and event_type = 'task_completion' for update;
  if v_child_id is null or not exists (select 1 from public.children where id = v_child_id and parent_id = v_parent_id and archived_at is null) then raise exception 'Completion not found' using errcode = '42501'; end if;
  if exists (select 1 from public.point_events where reversal_of = p_event_id) then raise exception 'Completion was already undone' using errcode = '23505'; end if;
  insert into public.point_events (child_id, event_type, point_delta, effective_date, task_id, reversal_of) values (v_child_id, 'task_completion_undo', -v_points, v_date, v_task_id, p_event_id) returning id into v_event_id;
  return v_event_id;
end;
$$;

create or replace function public.redeem_reward(p_child_id uuid, p_reward_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid(); v_time_zone text; v_cost integer; v_event_id uuid;
begin
  if v_parent_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select time_zone into v_time_zone from public.parent_settings where id = v_parent_id;
  if not exists (select 1 from public.children where id = p_child_id and parent_id = v_parent_id and archived_at is null) then raise exception 'Child profile not found' using errcode = '42501'; end if;
  select cost into v_cost from public.rewards where id = p_reward_id and child_id = p_child_id and is_active;
  if v_cost is null then raise exception 'Reward not found' using errcode = '42501'; end if;
  insert into public.point_events (child_id, event_type, point_delta, effective_date, reward_id) values (p_child_id, 'reward_redemption', -v_cost, timezone(coalesce(v_time_zone, 'UTC'), now())::date, p_reward_id) returning id into v_event_id;
  return v_event_id;
end;
$$;

revoke all on function public.record_task_completion(uuid, uuid, date) from public;
revoke all on function public.undo_task_completion(uuid) from public;
revoke all on function public.redeem_reward(uuid, uuid) from public;
grant execute on function public.record_task_completion(uuid, uuid, date) to authenticated;
grant execute on function public.undo_task_completion(uuid) to authenticated;
grant execute on function public.redeem_reward(uuid, uuid) to authenticated;
