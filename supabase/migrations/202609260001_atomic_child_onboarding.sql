insert into public.child_parent_memberships (child_id, parent_id, role)
select id, parent_id, 'owner'
from public.children
on conflict (child_id, parent_id) do nothing;

create or replace function public.create_child_profile(
  p_display_name text,
  p_time_zone text
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

  insert into public.parent_settings (id, time_zone)
  values (v_parent_id, p_time_zone)
  on conflict (id) do nothing;

  insert into public.children (parent_id, display_name)
  values (v_parent_id, p_display_name)
  returning id into v_child_id;

  insert into public.child_parent_memberships (child_id, parent_id, role)
  values (v_child_id, v_parent_id, 'owner');

  return v_child_id;
end;
$$;

revoke all on function public.create_child_profile(text, text) from public;
grant execute on function public.create_child_profile(text, text) to authenticated;
