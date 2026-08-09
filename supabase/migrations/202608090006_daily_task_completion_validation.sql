create or replace function public.record_task_completion(p_child_id uuid, p_task_id uuid, p_effective_date date) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_time_zone text; v_today date; v_week_start date; v_points integer; v_event_id uuid;
begin
 if auth.uid() is null or not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode='42501'; end if;
 select time_zone into v_time_zone from public.parent_settings join public.children on children.parent_id=parent_settings.id where children.id=p_child_id;
 select points into v_points from public.tasks where id=p_task_id and child_id=p_child_id and is_active; if v_points is null then raise exception 'Task not found' using errcode='42501'; end if;
 v_today:=timezone(coalesce(v_time_zone,'UTC'),now())::date; v_week_start:=date_trunc('week',v_today::timestamp)::date;
 if p_effective_date<v_week_start or p_effective_date>v_today then raise exception 'Choose a day in the current week that is not in the future' using errcode='22023'; end if;
 if not exists(select 1 from public.daily_task_selections where child_id=p_child_id and task_id=p_task_id) then raise exception 'Choose this task in Set Daily tasks before completing it' using errcode='22023'; end if;
 insert into public.point_events(child_id,event_type,point_delta,effective_date,task_id) values(p_child_id,'task_completion',v_points,p_effective_date,p_task_id) returning id into v_event_id; return v_event_id;
end; $$;
