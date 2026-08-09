create or replace function public.archive_reward(
  p_child_id uuid,
  p_reward_id uuid
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
  from public.rewards
  where id = p_reward_id
    and child_id = p_child_id
    and is_active = true
  for update;

  if not found then
    raise exception 'Reward not found' using errcode = '22023';
  end if;

  update public.rewards
  set is_active = false
  where id = p_reward_id
    and child_id = p_child_id;
end;
$$;

revoke all on function public.archive_reward(uuid, uuid) from public;
grant execute on function public.archive_reward(uuid, uuid) to authenticated;
