begin;

create extension if not exists pgtap with schema extensions;

select plan(9);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'onboarding-parent@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'template-parent@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select lives_ok(
  $$select public.create_child_profile('New child', 'Europe/Bucharest', false)$$,
  'an authenticated parent can atomically create a child profile'
);

select results_eq(
  $$select count(*) from public.children where display_name = 'New child'$$,
  array[1::bigint],
  'the owner can read the child they just created'
);

select results_eq(
  $$select count(*) from public.child_parent_memberships where role = 'owner'$$,
  array[1::bigint],
  'the new child has exactly one owner membership'
);

select results_eq(
  $$select count(*) from public.parent_settings where id = auth.uid() and time_zone = 'Europe/Bucharest'$$,
  array[1::bigint],
  'the first child creation stores the household time zone'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select lives_ok(
  $$select public.create_child_profile('Template child', 'Europe/Bucharest', true)$$,
  'an authenticated parent can atomically create a child with the starter catalog'
);

select results_eq(
  $$select count(*) from public.tasks where child_id = (select id from public.children where display_name = 'Template child')$$,
  array[6::bigint],
  'the starter catalog creates the approved six task definitions'
);

select results_eq(
  $$select count(*) from public.rewards where child_id = (select id from public.children where display_name = 'Template child')$$,
  array[5::bigint],
  'the starter catalog creates the approved five reward definitions'
);

select results_eq(
  $$select count(*) from public.daily_task_selections where child_id = (select id from public.children where display_name = 'Template child')$$,
  array[6::bigint],
  'every copied task is selected in the persistent daily list'
);

select results_eq(
  $$select count(*) from public.point_events where child_id = (select id from public.children where display_name = 'Template child')$$,
  array[0::bigint],
  'the starter catalog copies no points or redemption history'
);

select * from finish();

rollback;
