begin;
create extension if not exists pgtap with schema extensions;
select plan(3);
insert into auth.users(id, email) values
  ('99999999-9999-9999-9999-999999999991', 'timer-limits-owner@example.test'),
  ('99999999-9999-9999-9999-999999999992', 'timer-limits-other@example.test');
set local role authenticated;
set local request.jwt.claim.sub = '99999999-9999-9999-9999-999999999991';
select public.create_child_profile('Timer limits child', 'Europe/Bucharest', false);
select lives_ok(
  $$select public.set_child_timer_limits((select id from public.children where display_name = 'Timer limits child'), 75, 180)$$,
  'a parent can save timer limits for their child'
);
select results_eq(
  $$select max_concurrent_minutes, max_daily_minutes from public.child_timer_limits where child_id = (select id from public.children where display_name = 'Timer limits child')$$,
  $$values (75, 180)$$,
  'saved limits belong to the selected child'
);
set local request.jwt.claim.sub = '99999999-9999-9999-9999-999999999992';
select throws_ok(
  $$select public.set_child_timer_limits((select id from public.children where display_name = 'Timer limits child'), 60, 120)$$,
  '42501', 'Child profile not found',
  'another parent cannot change the child limits'
);
select * from finish();
rollback;
