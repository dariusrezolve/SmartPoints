alter table public.achievement_awards add column theme_key text not null default 'magic_kingdom'
  constraint achievement_awards_theme_key_check check (theme_key in ('magic_kingdom','hogwarts_adventure','middle_earth'));

create or replace function public.apply_star_trail_awards(p_child_id uuid, p_time_zone text)
returns void language plpgsql security definer set search_path='' as $$
declare v_week date:=date_trunc('week',timezone(coalesce(p_time_zone,'UTC'),now())::date::timestamp)::date; v_start timestamptz; v_task_points integer; v_stars integer; r record; v_award_id uuid; v_bonus_event uuid; v_reverse_event uuid; v_theme text;
begin
 select reset_at into v_start from public.weekly_point_resets where child_id=p_child_id and week_start=v_week;
 v_start:=coalesce(v_start,v_week::timestamptz);
 select coalesce(sum(event.point_delta),0) into v_task_points from public.point_events event where event.child_id=p_child_id and event.event_type='task_completion' and event.effective_date>=v_week and event.created_at>v_start and not exists(select 1 from public.point_events undo where undo.reversal_of=event.id);
 select coalesce(preferences.theme_key,'magic_kingdom') into v_theme from public.child_dashboard_preferences preferences where preferences.child_id=p_child_id;
 v_theme:=coalesce(v_theme,'magic_kingdom');
 v_stars:=v_task_points;
 for r in select * from (values (5,2,'Rainbow Knight'),(10,3,'Unicorn Guardian'),(20,5,'Dragon Friend'),(35,8,'Star Champion')) as milestones(stars,bonus,badge) loop
   if v_stars >= r.stars then
     insert into public.achievement_awards(child_id,trail_started_at,milestone_stars,badge_name,theme_key) values(p_child_id,v_start,r.stars,case v_theme when 'hogwarts_adventure' then case r.stars when 5 then 'House Star' when 10 then 'Spell Scholar' when 20 then 'Phoenix Friend' else 'Hogwarts Champion' end when 'middle_earth' then case r.stars when 5 then 'Rivendell Scout' when 10 then 'Fellowship Friend' when 20 then 'Mithril Guardian' else 'Light of the West' end else r.badge end,v_theme) on conflict do nothing returning id into v_award_id;
     if v_award_id is not null then insert into public.point_events(child_id,event_type,point_delta,effective_date) values(p_child_id,'achievement_bonus',r.bonus,timezone(coalesce(p_time_zone,'UTC'),now())::date) returning id into v_bonus_event; update public.achievement_awards set bonus_event_id=v_bonus_event where id=v_award_id; end if;
   else
     select id,bonus_event_id into v_award_id,v_bonus_event from public.achievement_awards where child_id=p_child_id and trail_started_at=v_start and milestone_stars=r.stars and bonus_reversal_event_id is null;
     if v_award_id is not null and v_bonus_event is not null then insert into public.point_events(child_id,event_type,point_delta,effective_date,reversal_of) values(p_child_id,'achievement_bonus_undo',-r.bonus,timezone(coalesce(p_time_zone,'UTC'),now())::date,v_bonus_event) returning id into v_reverse_event; update public.achievement_awards set bonus_reversal_event_id=v_reverse_event where id=v_award_id; end if;
   end if;
   v_award_id:=null; v_bonus_event:=null;
 end loop;
end; $$;
