drop function public.create_child_profile(text, text);

create function public.create_child_profile(
  p_display_name text,
  p_time_zone text,
  p_use_starter_template boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_id uuid := auth.uid();
  v_child_id uuid;
begin
  if v_parent_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_display_name is null
    or p_display_name <> btrim(p_display_name)
    or char_length(p_display_name) not between 1 and 80 then
    raise exception 'Child display name must be between 1 and 80 characters' using errcode = '22023';
  end if;

  if p_time_zone is null
    or p_time_zone <> btrim(p_time_zone)
    or char_length(p_time_zone) not between 1 and 64 then
    raise exception 'Household time zone is invalid' using errcode = '22023';
  end if;

  if p_use_starter_template is null then
    raise exception 'Starter template choice is required' using errcode = '22023';
  end if;

  insert into public.parent_settings (id, time_zone)
  values (v_parent_id, p_time_zone)
  on conflict (id) do nothing;

  insert into public.children (parent_id, display_name)
  values (v_parent_id, p_display_name)
  returning id into v_child_id;

  insert into public.child_parent_memberships (child_id, parent_id, role)
  values (v_child_id, v_parent_id, 'owner');

  if p_use_starter_template then
    with starter_tasks(name, points, icon) as (
      values
        ('Rutina de dimineata', 1, 'School'),
        ('Go to the bathroom', 1, 'Bath'),
        ('Rutina de seara', 1, 'BedDouble'),
        ('Ma opresc la timp', 1, 'Medal'),
        ('Extra tasks', 1, 'WashingMachine'),
        ('Mers la baie x 3plus bonus', 4, 'Sun')
    ), inserted_tasks as (
      insert into public.tasks (child_id, name, points, icon)
      select v_child_id, name, points, icon from starter_tasks
      returning id
    )
    insert into public.daily_task_selections (child_id, task_id)
    select v_child_id, id from inserted_tasks;

    insert into public.rewards (child_id, name, cost, icon)
    values
      (v_child_id, 'Book', 3, 'Sparkles'),
      (v_child_id, 'Screen time', 1, 'Gamepad2'),
      (v_child_id, 'Jucarie', 2, 'ToyBrick'),
      (v_child_id, 'Joc', 10, 'Palette'),
      (v_child_id, 'Shopping', 1, 'Star');
  end if;

  return v_child_id;
end;
$$;

revoke all on function public.create_child_profile(text, text, boolean) from public;
grant execute on function public.create_child_profile(text, text, boolean) to authenticated;
