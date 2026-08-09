drop policy if exists "members can read household settings" on public.parent_settings;
create policy "members can read household settings" on public.parent_settings for select to authenticated using (id = (select auth.uid()) or exists (select 1 from public.children where children.parent_id = parent_settings.id and public.can_access_child(children.id)));

create or replace function public.record_task_completion(p_child_id uuid, p_task_id uuid, p_effective_date date) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_time_zone text; v_today date; v_week_start date; v_points integer; v_event_id uuid;
begin
 if auth.uid() is null or not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode = '42501'; end if;
 select time_zone into v_time_zone from public.parent_settings join public.children on children.parent_id = parent_settings.id where children.id=p_child_id;
 select points into v_points from public.tasks where id=p_task_id and child_id=p_child_id and is_active;
 v_today:=timezone(coalesce(v_time_zone,'UTC'),now())::date; v_week_start:=date_trunc('week',v_today::timestamp)::date;
 if v_points is null then raise exception 'Task not found' using errcode='42501'; end if;
 if p_effective_date<v_week_start or p_effective_date>v_today then raise exception 'Choose a day in the current week that is not in the future' using errcode='22023'; end if;
 if not exists(select 1 from public.weekly_task_plans where child_id=p_child_id and week_start=v_week_start and task_id=p_task_id) then raise exception 'Choose this task in Set Daily tasks before completing it' using errcode='22023'; end if;
 insert into public.point_events(child_id,event_type,point_delta,effective_date,task_id) values(p_child_id,'task_completion',v_points,p_effective_date,p_task_id) returning id into v_event_id; return v_event_id;
end; $$;

create or replace function public.undo_task_completion(p_event_id uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_child_id uuid; v_points integer; v_date date; v_task_id uuid; v_event_id uuid;
begin
 select child_id,point_delta,effective_date,task_id into v_child_id,v_points,v_date,v_task_id from public.point_events where id=p_event_id and event_type='task_completion' for update;
 if v_child_id is null or not public.can_access_child(v_child_id) then raise exception 'Completion not found' using errcode='42501'; end if;
 if exists(select 1 from public.point_events where reversal_of=p_event_id) then raise exception 'Completion was already undone' using errcode='23505'; end if;
 insert into public.point_events(child_id,event_type,point_delta,effective_date,task_id,reversal_of) values(v_child_id,'task_completion_undo',-v_points,v_date,v_task_id,p_event_id) returning id into v_event_id; return v_event_id;
end; $$;

create or replace function public.redeem_reward(p_child_id uuid,p_reward_id uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_cost integer; v_time_zone text; v_event_id uuid;
begin
 if auth.uid() is null or not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode='42501'; end if;
 select cost into v_cost from public.rewards where id=p_reward_id and child_id=p_child_id and is_active; if v_cost is null then raise exception 'Reward not found' using errcode='42501'; end if;
 select time_zone into v_time_zone from public.parent_settings join public.children on children.parent_id=parent_settings.id where children.id=p_child_id;
 insert into public.point_events(child_id,event_type,point_delta,effective_date,reward_id) values(p_child_id,'reward_redemption',-v_cost,timezone(coalesce(v_time_zone,'UTC'),now())::date,p_reward_id) returning id into v_event_id; return v_event_id;
end; $$;
