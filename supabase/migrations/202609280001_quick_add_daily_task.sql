create or replace function public.create_task_and_select_daily(p_child_id uuid, p_name text, p_points integer, p_icon text, p_starter_key text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_task_id uuid;
begin
 if auth.uid() is null or not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode='42501'; end if;
 insert into public.tasks(child_id,name,points,icon,starter_key) values(p_child_id,p_name,p_points,p_icon,p_starter_key) returning id into v_task_id;
 insert into public.daily_task_selections(child_id,task_id) values(p_child_id,v_task_id) on conflict (child_id, task_id) do nothing;
 return v_task_id;
end; $$;

revoke all on function public.create_task_and_select_daily(uuid,text,integer,text,text) from public;
grant execute on function public.create_task_and_select_daily(uuid,text,integer,text,text) to authenticated;
