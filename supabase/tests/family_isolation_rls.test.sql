begin;

create extension if not exists pgtap with schema extensions;

select plan(11);

insert into auth.users (id, email)
values
  ('33333333-3333-3333-3333-333333333333', 'family-a@example.test'),
  ('44444444-4444-4444-4444-444444444444', 'family-b@example.test'),
  ('55555555-5555-5555-5555-555555555555', 'shared-parent@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select lives_ok(
  $$select public.create_child_profile('Family A child', 'Europe/Bucharest', true)$$,
  'the first family can create its templated child'
);

set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

select lives_ok(
  $$select public.create_child_profile('Family B child', 'Europe/Bucharest', true)$$,
  'the second family can create its templated child'
);

select results_eq(
  $$select count(*) from public.children where display_name = 'Family A child'$$,
  array[0::bigint],
  'an unrelated parent cannot read another family child'
);

select results_eq(
  $$select count(*) from public.tasks where child_id = (select id from public.children where display_name = 'Family A child')$$,
  array[0::bigint],
  'an unrelated parent cannot read another family tasks'
);

select results_eq(
  $$select count(*) from public.rewards where child_id = (select id from public.children where display_name = 'Family A child')$$,
  array[0::bigint],
  'an unrelated parent cannot read another family rewards'
);

select throws_ok(
  $$select public.record_task_completion(
      (select id from public.children where parent_id = '33333333-3333-3333-3333-333333333333'),
      (select id from public.tasks where child_id = (select id from public.children where parent_id = '33333333-3333-3333-3333-333333333333') limit 1),
      timezone('Europe/Bucharest', now())::date
    )$$,
  '42501',
  'Child profile not found',
  'an unrelated parent cannot add points by supplying another family IDs'
);

reset role;
insert into public.child_parent_memberships (child_id, parent_id, role)
select id, '55555555-5555-5555-5555-555555555555', 'shared'
from public.children
where parent_id = '33333333-3333-3333-3333-333333333333';

set local role authenticated;
set local request.jwt.claim.sub = '55555555-5555-5555-5555-555555555555';

select results_eq(
  $$select count(*) from public.children where display_name = 'Family A child'$$,
  array[1::bigint],
  'an invited parent can read the explicitly shared child'
);

select results_eq(
  $$select count(*) from public.children where display_name = 'Family B child'$$,
  array[0::bigint],
  'an invited parent cannot read an unshared child'
);

select lives_ok(
  $$select public.record_task_completion(
      (select id from public.children where display_name = 'Family A child'),
      (select id from public.tasks where child_id = (select id from public.children where display_name = 'Family A child') limit 1),
      timezone('Europe/Bucharest', now())::date
    )$$,
  'an invited parent can add points only to the shared child'
);

select lives_ok(
  $$select public.reset_weekly_points((select id from public.children where display_name = 'Family A child'), 4, 4, 0)$$,
  'an invited parent can reset points only for the shared child'
);

select results_eq(
  $$select count(*) from public.point_events where child_id = (select id from public.children where display_name = 'Family A child')$$,
  array[1::bigint],
  'the shared point change remains on the explicitly shared child'
);

select * from finish();

rollback;
