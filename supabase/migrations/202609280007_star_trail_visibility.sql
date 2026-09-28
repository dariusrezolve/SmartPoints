create table public.child_dashboard_preferences (child_id uuid primary key references public.children(id) on delete cascade, show_star_trail boolean not null default true);
alter table public.child_dashboard_preferences enable row level security;
grant select on public.child_dashboard_preferences to authenticated;
create policy "members can read child dashboard preferences" on public.child_dashboard_preferences for select to authenticated using (public.can_access_child(child_id));
create or replace function public.set_star_trail_visibility(p_child_id uuid,p_show_star_trail boolean) returns void language plpgsql security definer set search_path='' as $$ begin if auth.uid() is null or not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode='42501'; end if; insert into public.child_dashboard_preferences(child_id,show_star_trail) values(p_child_id,p_show_star_trail) on conflict(child_id) do update set show_star_trail=excluded.show_star_trail; end; $$;
revoke all on function public.set_star_trail_visibility(uuid,boolean) from public;
grant execute on function public.set_star_trail_visibility(uuid,boolean) to authenticated;
