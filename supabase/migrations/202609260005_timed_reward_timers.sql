alter table public.point_events
  add column timer_duration_minutes integer,
  add constraint point_events_timer_duration_minutes_check
    check (timer_duration_minutes is null or timer_duration_minutes between 1 and 1440);

create table public.reward_timers (
  child_id uuid not null references public.children(id) on delete cascade,
  reward_id uuid not null references public.rewards(id) on delete cascade,
  ends_at timestamptz not null,
  primary key (child_id, reward_id)
);

alter table public.reward_timers enable row level security;
grant select on public.reward_timers to authenticated;
create policy "members can read reward timers" on public.reward_timers for select to authenticated using (public.can_access_child(child_id));

create or replace function public.redeem_reward(p_child_id uuid, p_reward_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_cost integer; v_time_zone text; v_event_id uuid; v_duration integer;
begin
 if auth.uid() is null or not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode='42501'; end if;
 select cost, duration_minutes into v_cost, v_duration from public.rewards where id=p_reward_id and child_id=p_child_id and is_active;
 if v_cost is null then raise exception 'Reward not found' using errcode='42501'; end if;
 select time_zone into v_time_zone from public.parent_settings join public.children on children.parent_id=parent_settings.id where children.id=p_child_id;
 insert into public.point_events(child_id,event_type,point_delta,effective_date,reward_id,timer_duration_minutes) values(p_child_id,'reward_redemption',-v_cost,timezone(coalesce(v_time_zone,'UTC'),now())::date,p_reward_id,v_duration) returning id into v_event_id;
 if v_duration is not null then
   insert into public.reward_timers(child_id,reward_id,ends_at) values(p_child_id,p_reward_id,timezone('utc',now()) + make_interval(mins => v_duration))
   on conflict (child_id,reward_id) do update set ends_at = greatest(public.reward_timers.ends_at, timezone('utc',now())) + make_interval(mins => v_duration);
 end if;
 return v_event_id;
end; $$;

create or replace function public.queue_reward_redemption(p_child_id uuid, p_reward_id uuid, p_cost integer, p_timer_duration_minutes integer, p_request_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid(); v_event_id uuid; v_time_zone text;
begin
 if v_parent_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if not public.can_access_child(p_child_id) then raise exception 'Child profile not found' using errcode='42501'; end if;
 if p_cost is null or p_cost < 1 then raise exception 'Reward cost must be a positive whole number' using errcode='22023'; end if;
 if p_timer_duration_minutes is not null and (p_timer_duration_minutes < 1 or p_timer_duration_minutes > 1440) then raise exception 'Reward duration must be between 1 and 1440 minutes' using errcode='22023'; end if;
 if not exists(select 1 from public.rewards where id=p_reward_id and child_id=p_child_id and is_active) then raise exception 'Reward not found' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 select event_id into v_event_id from public.point_action_requests where parent_id=v_parent_id and request_id=p_request_id;
 if v_event_id is not null then return v_event_id; end if;
 select settings.time_zone into v_time_zone from public.parent_settings settings join public.children child on child.parent_id=settings.id where child.id=p_child_id;
 insert into public.point_events(child_id,event_type,point_delta,effective_date,reward_id,timer_duration_minutes) values(p_child_id,'reward_redemption',-p_cost,timezone(coalesce(v_time_zone,'UTC'),now())::date,p_reward_id,p_timer_duration_minutes) returning id into v_event_id;
 if p_timer_duration_minutes is not null then
   insert into public.reward_timers(child_id,reward_id,ends_at) values(p_child_id,p_reward_id,timezone('utc',now()) + make_interval(mins => p_timer_duration_minutes))
   on conflict (child_id,reward_id) do update set ends_at = greatest(public.reward_timers.ends_at, timezone('utc',now())) + make_interval(mins => p_timer_duration_minutes);
 end if;
 insert into public.point_action_requests(parent_id,request_id,event_id) values(v_parent_id,p_request_id,v_event_id);
 return v_event_id;
end; $$;

create or replace function public.queue_reward_redemption(p_child_id uuid, p_reward_id uuid, p_cost integer, p_request_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_duration integer;
begin
 select duration_minutes into v_duration from public.rewards where id=p_reward_id and child_id=p_child_id;
 return public.queue_reward_redemption(p_child_id,p_reward_id,p_cost,v_duration,p_request_id);
end; $$;

create or replace function public.undo_reward_redemption(p_event_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid(); v_child_id uuid; v_cost integer; v_date date; v_reward_id uuid; v_event_id uuid; v_duration integer;
begin
 if v_parent_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
 select child_id,point_delta,effective_date,reward_id,timer_duration_minutes into v_child_id,v_cost,v_date,v_reward_id,v_duration from public.point_events where id=p_event_id and event_type='reward_redemption' for update;
 if v_child_id is null or not public.can_access_child(v_child_id) then raise exception 'Reward redemption not found' using errcode='42501'; end if;
 if exists(select 1 from public.point_events where reversal_of=p_event_id) then raise exception 'Reward redemption was already undone' using errcode='23505'; end if;
 insert into public.point_events(child_id,event_type,point_delta,effective_date,reward_id,reversal_of) values(v_child_id,'reward_redemption_undo',-v_cost,v_date,v_reward_id,p_event_id) returning id into v_event_id;
 if v_duration is not null then
   update public.reward_timers set ends_at = ends_at - make_interval(mins => v_duration) where child_id=v_child_id and reward_id=v_reward_id;
   delete from public.reward_timers where child_id=v_child_id and reward_id=v_reward_id and ends_at <= timezone('utc',now());
 end if;
 return v_event_id;
end; $$;

create or replace function public.queue_reward_undo(p_event_id uuid, p_request_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_parent_id uuid := auth.uid(); v_child_id uuid; v_cost integer; v_date date; v_reward_id uuid; v_event_id uuid; v_duration integer;
begin
 if v_parent_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 select event_id into v_event_id from public.point_action_requests where parent_id=v_parent_id and request_id=p_request_id;
 if v_event_id is not null then return v_event_id; end if;
 select child_id,point_delta,effective_date,reward_id,timer_duration_minutes into v_child_id,v_cost,v_date,v_reward_id,v_duration from public.point_events where id=p_event_id and event_type='reward_redemption';
 if v_child_id is null or not public.can_access_child(v_child_id) then raise exception 'Reward redemption not found' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_event_id::text,1));
 select id into v_event_id from public.point_events where reversal_of=p_event_id;
 if v_event_id is null then
   insert into public.point_events(child_id,event_type,point_delta,effective_date,reward_id,reversal_of) values(v_child_id,'reward_redemption_undo',-v_cost,v_date,v_reward_id,p_event_id) returning id into v_event_id;
   if v_duration is not null then
     update public.reward_timers set ends_at = ends_at - make_interval(mins => v_duration) where child_id=v_child_id and reward_id=v_reward_id;
     delete from public.reward_timers where child_id=v_child_id and reward_id=v_reward_id and ends_at <= timezone('utc',now());
   end if;
 end if;
 insert into public.point_action_requests(parent_id,request_id,event_id) values(v_parent_id,p_request_id,v_event_id);
 return v_event_id;
end; $$;

revoke all on function public.redeem_reward(uuid,uuid) from public;
revoke all on function public.queue_reward_redemption(uuid,uuid,integer,integer,uuid) from public;
revoke all on function public.queue_reward_redemption(uuid,uuid,integer,uuid) from public;
revoke all on function public.undo_reward_redemption(uuid) from public;
revoke all on function public.queue_reward_undo(uuid,uuid) from public;
grant execute on function public.redeem_reward(uuid,uuid) to authenticated;
grant execute on function public.queue_reward_redemption(uuid,uuid,integer,integer,uuid) to authenticated;
grant execute on function public.queue_reward_redemption(uuid,uuid,integer,uuid) to authenticated;
grant execute on function public.undo_reward_redemption(uuid) to authenticated;
grant execute on function public.queue_reward_undo(uuid,uuid) to authenticated;
