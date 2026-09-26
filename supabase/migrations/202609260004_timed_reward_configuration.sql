alter table public.rewards
  add column duration_minutes integer;

alter table public.rewards
  add constraint rewards_duration_minutes_check
  check (duration_minutes is null or duration_minutes between 1 and 1440);
