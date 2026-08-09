create table public.daily_task_selections (
  child_id uuid not null references public.children(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (child_id, task_id)
);
insert into public.daily_task_selections (child_id, task_id)
select child_id, task_id from public.weekly_task_plans
on conflict do nothing;
alter table public.daily_task_selections enable row level security;
create policy "members can read daily task selections" on public.daily_task_selections for select to authenticated using (public.can_access_child(child_id));
grant select on public.daily_task_selections to authenticated;
create or replace function public.replace_daily_task_selection(p_child_id uuid, p_task_ids uuid[]) returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null or not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode='42501'; end if;
 if exists(select 1 from unnest(coalesce(p_task_ids,array[]::uuid[])) id left join public.tasks on tasks.id=id and tasks.child_id=p_child_id and tasks.is_active where tasks.id is null) then raise exception 'A selected task was not found' using errcode='42501'; end if;
 delete from public.daily_task_selections where child_id=p_child_id;
 insert into public.daily_task_selections(child_id,task_id) select p_child_id,id from unnest(coalesce(p_task_ids,array[]::uuid[])) id group by id;
end; $$;
revoke all on function public.replace_daily_task_selection(uuid,uuid[]) from public; grant execute on function public.replace_daily_task_selection(uuid,uuid[]) to authenticated;
