alter table public.point_events drop constraint if exists point_events_event_type_check;
alter table public.point_events drop constraint if exists point_events_task_reference_check;
alter table public.point_events drop constraint if exists point_events_reward_reference_check;
alter table public.point_events drop constraint if exists point_events_reversal_reference_check;
alter table public.point_events add constraint point_events_event_type_check check (event_type in ('task_completion','task_completion_undo','reward_redemption','reward_redemption_undo','achievement_bonus','achievement_bonus_undo'));
alter table public.point_events add constraint point_events_task_reference_check check ((event_type in ('task_completion','task_completion_undo')) = (task_id is not null));
alter table public.point_events add constraint point_events_reward_reference_check check ((event_type in ('reward_redemption','reward_redemption_undo')) = (reward_id is not null));
alter table public.point_events add constraint point_events_reversal_reference_check check ((event_type in ('task_completion_undo','reward_redemption_undo','achievement_bonus_undo')) = (reversal_of is not null));

create table public.achievement_awards (
  id uuid primary key default extensions.gen_random_uuid(), child_id uuid not null references public.children(id) on delete cascade,
  trail_started_at timestamptz not null, milestone_stars integer not null check (milestone_stars in (5,10,20,35)),
  badge_name text not null, earned_at timestamptz not null default timezone('utc',now()),
  bonus_event_id uuid references public.point_events(id), bonus_reversal_event_id uuid references public.point_events(id),
  unique(child_id, trail_started_at, milestone_stars)
);
alter table public.achievement_awards enable row level security;
grant select on public.achievement_awards to authenticated;
create policy "members can read achievement awards" on public.achievement_awards for select to authenticated using (public.can_access_child(child_id));

create or replace function public.apply_star_trail_awards(p_child_id uuid, p_time_zone text)
returns void language plpgsql security definer set search_path='' as $$
declare v_week date:=date_trunc('week',timezone(coalesce(p_time_zone,'UTC'),now())::date::timestamp)::date; v_start timestamptz; v_task_points integer; v_stars integer; r record; v_award_id uuid; v_bonus_event uuid; v_reverse_event uuid;
begin
 select reset_at into v_start from public.weekly_point_resets where child_id=p_child_id and week_start=v_week;
 v_start:=coalesce(v_start,v_week::timestamptz);
 select coalesce(sum(event.point_delta),0) into v_task_points from public.point_events event where event.child_id=p_child_id and event.event_type='task_completion' and event.effective_date>=v_week and event.created_at>v_start and not exists(select 1 from public.point_events undo where undo.reversal_of=event.id);
 v_stars:=v_task_points;
 for r in select * from (values (5,2,'Rainbow Knight'),(10,3,'Unicorn Guardian'),(20,5,'Dragon Friend'),(35,8,'Star Champion')) as milestones(stars,bonus,badge) loop
   if v_stars >= r.stars then
     insert into public.achievement_awards(child_id,trail_started_at,milestone_stars,badge_name) values(p_child_id,v_start,r.stars,r.badge) on conflict do nothing returning id into v_award_id;
     if v_award_id is not null then insert into public.point_events(child_id,event_type,point_delta,effective_date) values(p_child_id,'achievement_bonus',r.bonus,timezone(coalesce(p_time_zone,'UTC'),now())::date) returning id into v_bonus_event; update public.achievement_awards set bonus_event_id=v_bonus_event where id=v_award_id; end if;
   else
     select id,bonus_event_id into v_award_id,v_bonus_event from public.achievement_awards where child_id=p_child_id and trail_started_at=v_start and milestone_stars=r.stars and bonus_reversal_event_id is null;
     if v_award_id is not null and v_bonus_event is not null then insert into public.point_events(child_id,event_type,point_delta,effective_date,reversal_of) values(p_child_id,'achievement_bonus_undo',-r.bonus,timezone(coalesce(p_time_zone,'UTC'),now())::date,v_bonus_event) returning id into v_reverse_event; update public.achievement_awards set bonus_reversal_event_id=v_reverse_event where id=v_award_id; end if;
   end if;
   v_award_id:=null; v_bonus_event:=null;
 end loop;
end; $$;

create or replace function public.record_task_completion(p_child_id uuid,p_task_id uuid,p_effective_date date) returns uuid language plpgsql security definer set search_path='' as $$
declare v_time_zone text; v_today date; v_week date; v_points integer; v_event uuid;
begin
 if auth.uid() is null or not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode='42501'; end if;
 select settings.time_zone into v_time_zone from public.parent_settings settings join public.children child on child.parent_id=settings.id where child.id=p_child_id;
 select points into v_points from public.tasks where id=p_task_id and child_id=p_child_id and is_active; if v_points is null then raise exception 'Task not found' using errcode='42501'; end if;
 v_today:=timezone(coalesce(v_time_zone,'UTC'),now())::date; v_week:=date_trunc('week',v_today::timestamp)::date;
 if p_effective_date<v_week or p_effective_date>v_today then raise exception 'Choose a day in the current week that is not in the future' using errcode='22023'; end if;
 if not exists(select 1 from public.daily_task_selections where child_id=p_child_id and task_id=p_task_id) then raise exception 'Choose this task in Set Daily tasks before completing it' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_child_id::text,3));
 insert into public.point_events(child_id,event_type,point_delta,effective_date,task_id) values(p_child_id,'task_completion',v_points,p_effective_date,p_task_id) returning id into v_event;
 perform public.apply_star_trail_awards(p_child_id,v_time_zone); return v_event;
end; $$;

create or replace function public.queue_task_completion(p_child_id uuid,p_task_id uuid,p_effective_date date,p_points integer,p_request_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_parent uuid:=auth.uid(); v_event uuid; v_time_zone text;
begin
 if v_parent is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode='42501'; end if;
 if p_points is null or p_points<1 then raise exception 'Points must be a positive whole number' using errcode='22023'; end if;
 if not exists(select 1 from public.tasks where id=p_task_id and child_id=p_child_id and is_active) then raise exception 'Task not found' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0)); select event_id into v_event from public.point_action_requests where parent_id=v_parent and request_id=p_request_id; if v_event is not null then return v_event; end if;
 select settings.time_zone into v_time_zone from public.parent_settings settings join public.children child on child.parent_id=settings.id where child.id=p_child_id;
 perform pg_advisory_xact_lock(hashtextextended(p_child_id::text,3)); insert into public.point_events(child_id,event_type,point_delta,effective_date,task_id) values(p_child_id,'task_completion',p_points,p_effective_date,p_task_id) returning id into v_event;
 perform public.apply_star_trail_awards(p_child_id,v_time_zone); insert into public.point_action_requests(parent_id,request_id,event_id) values(v_parent,p_request_id,v_event); return v_event;
end; $$;

create or replace function public.queue_task_completion(p_child_id uuid,p_task_id uuid,p_effective_date date,p_request_id uuid) returns uuid language plpgsql security definer set search_path='' as $$ declare v_points integer; begin select points into v_points from public.tasks where id=p_task_id and child_id=p_child_id; return public.queue_task_completion(p_child_id,p_task_id,p_effective_date,v_points,p_request_id); end; $$;

create or replace function public.undo_task_completion(p_event_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_child uuid; v_points integer; v_date date; v_task uuid; v_event uuid; v_time_zone text;
begin
 select child_id,point_delta,effective_date,task_id into v_child,v_points,v_date,v_task from public.point_events where id=p_event_id and event_type='task_completion' for update;
 if v_child is null or not public.can_access_child(v_child) then raise exception 'Completion not found' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_child::text,3)); if exists(select 1 from public.point_events where reversal_of=p_event_id) then raise exception 'Completion was already undone' using errcode='23505'; end if;
 insert into public.point_events(child_id,event_type,point_delta,effective_date,task_id,reversal_of) values(v_child,'task_completion_undo',-v_points,v_date,v_task,p_event_id) returning id into v_event;
 select settings.time_zone into v_time_zone from public.parent_settings settings join public.children child on child.parent_id=settings.id where child.id=v_child; perform public.apply_star_trail_awards(v_child,v_time_zone); return v_event;
end; $$;

create or replace function public.queue_task_undo(p_event_id uuid,p_request_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_parent uuid:=auth.uid(); v_child uuid; v_points integer; v_date date; v_task uuid; v_event uuid; v_time_zone text;
begin
 if v_parent is null then raise exception 'Authentication required' using errcode='28000'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0)); select event_id into v_event from public.point_action_requests where parent_id=v_parent and request_id=p_request_id; if v_event is not null then return v_event; end if;
 select child_id,point_delta,effective_date,task_id into v_child,v_points,v_date,v_task from public.point_events where id=p_event_id and event_type='task_completion'; if v_child is null or not public.can_access_child(v_child) then raise exception 'Completion not found' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_child::text,3)); perform pg_advisory_xact_lock(hashtextextended(p_event_id::text,1)); select id into v_event from public.point_events where reversal_of=p_event_id;
 if v_event is null then insert into public.point_events(child_id,event_type,point_delta,effective_date,task_id,reversal_of) values(v_child,'task_completion_undo',-v_points,v_date,v_task,p_event_id) returning id into v_event; select settings.time_zone into v_time_zone from public.parent_settings settings join public.children child on child.parent_id=settings.id where child.id=v_child; perform public.apply_star_trail_awards(v_child,v_time_zone); end if;
 insert into public.point_action_requests(parent_id,request_id,event_id) values(v_parent,p_request_id,v_event); return v_event;
end; $$;

revoke all on function public.apply_star_trail_awards(uuid,text) from public;
revoke all on function public.record_task_completion(uuid,uuid,date) from public;
revoke all on function public.undo_task_completion(uuid) from public;
revoke all on function public.queue_task_completion(uuid,uuid,date,integer,uuid) from public;
revoke all on function public.queue_task_completion(uuid,uuid,date,uuid) from public;
revoke all on function public.queue_task_undo(uuid,uuid) from public;
grant execute on function public.record_task_completion(uuid,uuid,date), public.undo_task_completion(uuid), public.queue_task_completion(uuid,uuid,date,integer,uuid), public.queue_task_completion(uuid,uuid,date,uuid), public.queue_task_undo(uuid,uuid) to authenticated;
