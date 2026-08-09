create or replace function public.replace_daily_task_selection(
  p_child_id uuid,
  p_task_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.can_access_child(p_child_id) then
    raise exception 'Child profile not found' using errcode = '42501';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_task_ids, array[]::uuid[])) as selected(task_id)
    left join public.tasks as task
      on task.id = selected.task_id
      and task.child_id = p_child_id
      and task.is_active = true
    where task.id is null
  ) then
    raise exception 'A selected task was not found' using errcode = '22023';
  end if;

  delete from public.daily_task_selections
  where child_id = p_child_id;

  insert into public.daily_task_selections (child_id, task_id)
  select p_child_id, selected.task_id
  from unnest(coalesce(p_task_ids, array[]::uuid[])) as selected(task_id)
  group by selected.task_id;
end;
$$;

revoke all on function public.replace_daily_task_selection(uuid, uuid[]) from public;
grant execute on function public.replace_daily_task_selection(uuid, uuid[]) to authenticated;
