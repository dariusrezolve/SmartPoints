create or replace function public.archive_task(
  p_child_id uuid,
  p_task_id uuid
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

  perform 1
  from public.tasks
  where id = p_task_id
    and child_id = p_child_id
    and is_active = true
  for update;

  if not found then
    raise exception 'Task not found' using errcode = '22023';
  end if;

  delete from public.daily_task_selections
  where child_id = p_child_id
    and task_id = p_task_id;

  update public.tasks
  set is_active = false
  where id = p_task_id
    and child_id = p_child_id;
end;
$$;

revoke all on function public.archive_task(uuid, uuid) from public;
grant execute on function public.archive_task(uuid, uuid) to authenticated;
