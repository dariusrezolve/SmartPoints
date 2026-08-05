create table if not exists public.weekly_task_plans (
  child_id uuid not null references public.children (id) on delete restrict,
  week_start date not null,
  task_id uuid not null references public.tasks (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (child_id, week_start, task_id),
  check (date_trunc('week', week_start::timestamp)::date = week_start)
);

create index if not exists weekly_task_plans_child_week_idx on public.weekly_task_plans (child_id, week_start);

alter table public.weekly_task_plans enable row level security;

drop policy if exists "parents can read weekly task plans" on public.weekly_task_plans;
create policy "parents can read weekly task plans" on public.weekly_task_plans for select to authenticated
  using (exists (select 1 from public.children where children.id = weekly_task_plans.child_id and children.parent_id = (select auth.uid()) and children.archived_at is null));

grant select on public.weekly_task_plans to authenticated;

create or replace function public.replace_weekly_task_plan(p_child_id uuid, p_week_start date, p_task_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid();
begin
  if v_parent_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_week_start <> date_trunc('week', p_week_start::timestamp)::date then raise exception 'Week must start on Monday' using errcode = '22023'; end if;
  if not exists (select 1 from public.children where id = p_child_id and parent_id = v_parent_id and archived_at is null) then raise exception 'Child profile not found' using errcode = '42501'; end if;
  if exists (
    select 1
    from unnest(coalesce(p_task_ids, array[]::uuid[])) as selected_task(id)
    left join public.tasks on tasks.id = selected_task.id and tasks.child_id = p_child_id and tasks.is_active
    where tasks.id is null
  ) then raise exception 'A selected task was not found' using errcode = '42501'; end if;

  delete from public.weekly_task_plans where child_id = p_child_id and week_start = p_week_start;
  insert into public.weekly_task_plans (child_id, week_start, task_id)
  select p_child_id, p_week_start, selected_task.id
  from unnest(coalesce(p_task_ids, array[]::uuid[])) as selected_task(id)
  group by selected_task.id;
end;
$$;

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
  if not exists (select 1 from public.weekly_task_plans where child_id = p_child_id and week_start = v_week_start and task_id = p_task_id) then raise exception 'Choose this task in Set Daily tasks before completing it' using errcode = '22023'; end if;
  insert into public.point_events (child_id, event_type, point_delta, effective_date, task_id) values (p_child_id, 'task_completion', v_points, p_effective_date, p_task_id) returning id into v_event_id;
  return v_event_id;
end;
$$;

revoke all on function public.replace_weekly_task_plan(uuid, date, uuid[]) from public;
grant execute on function public.replace_weekly_task_plan(uuid, date, uuid[]) to authenticated;
