begin;

create extension if not exists pgtap with schema extensions;

select plan(6);

insert into auth.users (id, email)
values ('77777777-7777-7777-7777-777777777777', 'timer-parent@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '77777777-7777-7777-7777-777777777777';

select public.create_child_profile('Timer child', 'Europe/Bucharest', false);
insert into public.rewards (child_id, name, cost, icon, duration_minutes)
values ((select id from public.children where display_name = 'Timer child'), 'Screen Time', 1, 'Gamepad2', 30);

select lives_ok(
  $$select public.queue_reward_redemption(
    (select id from public.children where display_name = 'Timer child'),
    (select id from public.rewards where name = 'Screen Time'), 1, 30,
    '10000000-0000-0000-0000-000000000001')$$,
  'a timed redemption creates a timer'
);

select results_eq(
  $$select timer_duration_minutes from public.point_events where event_type = 'reward_redemption'$$,
  array[30],
  'the redemption snapshots its configured duration'
);

select lives_ok(
  $$select public.queue_reward_redemption(
    (select id from public.children where display_name = 'Timer child'),
    (select id from public.rewards where name = 'Screen Time'), 1, 30,
    '10000000-0000-0000-0000-000000000002')$$,
  'a second redemption extends the active timer'
);

select ok(
  (select ends_at > timezone('utc', now()) + interval '59 minutes' from public.reward_timers),
  'two redemptions create one timer with about sixty minutes remaining'
);

select lives_ok(
  $$select public.queue_reward_undo(
    (select id from public.point_events where event_type = 'reward_redemption' order by created_at limit 1),
    '10000000-0000-0000-0000-000000000003')$$,
  'undo subtracts the redemption duration from the timer'
);

select ok(
  (select ends_at > timezone('utc', now()) + interval '29 minutes' and ends_at < timezone('utc', now()) + interval '31 minutes' from public.reward_timers),
  'undo removes thirty minutes from the active timer'
);

select * from finish();

rollback;
