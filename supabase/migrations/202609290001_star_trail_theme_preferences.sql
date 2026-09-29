alter table public.child_dashboard_preferences add column theme_key text not null default 'magic_kingdom'
  constraint child_dashboard_preferences_theme_key_check check (theme_key in ('magic_kingdom','hogwarts_adventure','middle_earth'));

create function public.set_star_trail_preferences(p_child_id uuid, p_theme_key text, p_show_star_trail boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null or not public.can_access_child(p_child_id) then
    raise exception 'Child profile not found' using errcode='42501';
  end if;
  if p_theme_key is null or p_theme_key not in ('magic_kingdom','hogwarts_adventure','middle_earth') then
    raise exception 'Invalid Star Trail theme' using errcode='22023';
  end if;
  if p_show_star_trail is null then raise exception 'Invalid Star Trail visibility' using errcode='22023'; end if;
  insert into public.child_dashboard_preferences(child_id,theme_key,show_star_trail)
    values(p_child_id,p_theme_key,p_show_star_trail)
    on conflict(child_id) do update set theme_key=excluded.theme_key,show_star_trail=excluded.show_star_trail;
end; $$;
revoke all on function public.set_star_trail_preferences(uuid,text,boolean) from public;
grant execute on function public.set_star_trail_preferences(uuid,text,boolean) to authenticated;
