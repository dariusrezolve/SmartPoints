begin;
create extension if not exists pgtap with schema extensions;
select plan(13);
insert into auth.users(id, email) values ('99999999-9999-9999-9999-999999999993', 'timer-enforcement@example.test');
set local role authenticated;
set local request.jwt.claim.sub = '99999999-9999-9999-9999-999999999993';

select public.create_child_profile('Active timer child', 'Europe/Bucharest', false);
insert into public.rewards(child_id, name, cost, icon, duration_minutes) values
  ((select id from public.children where display_name = 'Active timer child'), 'Screen time', 1, 'Gamepad2', 30);
select public.set_child_timer_limits((select id from public.children where display_name = 'Active timer child'), 60, 120);
select lives_ok($$select public.queue_reward_redemption((select id from public.children where display_name = 'Active timer child'), (select id from public.rewards where name = 'Screen time'), 1, 30, '20000000-0000-0000-0000-000000000001')$$, 'first timed redemption is allowed');
select lives_ok($$select public.queue_reward_redemption((select id from public.children where display_name = 'Active timer child'), (select id from public.rewards where name = 'Screen time'), 1, 30, '20000000-0000-0000-0000-000000000002')$$, 'second timed redemption fills the active allowance');
select throws_ok($$select public.queue_reward_redemption((select id from public.children where display_name = 'Active timer child'), (select id from public.rewards where name = 'Screen time'), 1, 30, '20000000-0000-0000-0000-000000000003')$$, '22023', 'Active timer limit of 60 minutes reached', 'queued redemption rejects an over-limit active timer');
select throws_ok($$select public.redeem_reward((select id from public.children where display_name = 'Active timer child'), (select id from public.rewards where name = 'Screen time'))$$, '22023', 'Active timer limit of 60 minutes reached', 'direct redemption rejects an over-limit active timer');
select lives_ok($$select public.queue_reward_undo((select id from public.point_events where event_type = 'reward_redemption' and child_id = (select id from public.children where display_name = 'Active timer child') order by created_at limit 1), '20000000-0000-0000-0000-000000000004')$$, 'undo restores active timer capacity');
select lives_ok($$select public.queue_reward_redemption((select id from public.children where display_name = 'Active timer child'), (select id from public.rewards where name = 'Screen time'), 1, 30, '20000000-0000-0000-0000-000000000005')$$, 'a redemption fits after undo');

select public.create_child_profile('Daily timer child', 'Europe/Bucharest', false);
insert into public.rewards(child_id, name, cost, icon, duration_minutes) values
  ((select id from public.children where display_name = 'Daily timer child'), 'Daily screen time', 1, 'Gamepad2', 30);
select public.set_child_timer_limits((select id from public.children where display_name = 'Daily timer child'), 120, 120);
select lives_ok($$select public.queue_reward_redemption((select id from public.children where display_name = 'Daily timer child'), (select id from public.rewards where name = 'Daily screen time'), 1, 30, '20000000-0000-0000-0000-000000000006')$$, 'daily redemption one is allowed');
select lives_ok($$select public.queue_reward_redemption((select id from public.children where display_name = 'Daily timer child'), (select id from public.rewards where name = 'Daily screen time'), 1, 30, '20000000-0000-0000-0000-000000000007')$$, 'daily redemption two is allowed');
select lives_ok($$select public.queue_reward_redemption((select id from public.children where display_name = 'Daily timer child'), (select id from public.rewards where name = 'Daily screen time'), 1, 30, '20000000-0000-0000-0000-000000000008')$$, 'daily redemption three is allowed');
select lives_ok($$select public.queue_reward_redemption((select id from public.children where display_name = 'Daily timer child'), (select id from public.rewards where name = 'Daily screen time'), 1, 30, '20000000-0000-0000-0000-000000000009')$$, 'daily redemption four reaches the daily limit');
set local role postgres;
update public.reward_timers set ends_at = timezone('utc', now()) - interval '1 second' where child_id = (select id from public.children where display_name = 'Daily timer child');
set local role authenticated;
select throws_ok($$select public.queue_reward_redemption((select id from public.children where display_name = 'Daily timer child'), (select id from public.rewards where name = 'Daily screen time'), 1, 30, '20000000-0000-0000-0000-000000000010')$$, '22023', 'Daily timer limit of 120 minutes reached', 'the fifth daily redemption is rejected');
select lives_ok($$select public.queue_reward_undo((select id from public.point_events where event_type = 'reward_redemption' and child_id = (select id from public.children where display_name = 'Daily timer child') order by created_at limit 1), '20000000-0000-0000-0000-000000000011')$$, 'undo restores daily timer capacity');
select lives_ok($$select public.queue_reward_redemption((select id from public.children where display_name = 'Daily timer child'), (select id from public.rewards where name = 'Daily screen time'), 1, 30, '20000000-0000-0000-0000-000000000012')$$, 'a redemption fits after daily undo');
select * from finish();
rollback;
