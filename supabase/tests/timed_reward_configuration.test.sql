begin;

create extension if not exists pgtap with schema extensions;

select plan(3);

insert into auth.users (id, email)
values ('66666666-6666-6666-6666-666666666666', 'timed-reward-parent@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';

select public.create_child_profile('Timed reward child', 'Europe/Bucharest', false);

select lives_ok(
  $$insert into public.rewards (child_id, name, cost, icon, duration_minutes)
    values ((select id from public.children where display_name = 'Timed reward child'), 'Screen Time', 1, 'Gamepad2', 30)$$,
  'a timed reward accepts a configured duration'
);

select results_eq(
  $$select duration_minutes from public.rewards where name = 'Screen Time'$$,
  array[30],
  'the configured duration remains child-owned with the reward'
);

select throws_ok(
  $$insert into public.rewards (child_id, name, cost, icon, duration_minutes)
    values ((select id from public.children where display_name = 'Timed reward child'), 'Too long', 1, 'Gamepad2', 1441)$$,
  '23514',
  'new row for relation "rewards" violates check constraint "rewards_duration_minutes_check"',
  'duration cannot exceed one day'
);

select * from finish();

rollback;
