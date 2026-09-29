begin;
create extension if not exists pgtap with schema extensions;
select plan(11);
insert into auth.users(id,email) values
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa31','trail-one@example.test'),
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa32','trail-two@example.test');
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa31';
select public.create_child_profile('Theme child','UTC',false);
select results_eq($$select theme_key from public.child_dashboard_preferences where child_id=(select id from public.children where display_name='Theme child')$$,array[]::text[],'missing preference defaults in app');
select lives_ok($$select public.set_star_trail_preferences((select id from public.children where display_name='Theme child'),'hogwarts_adventure',false)$$,'save theme and visibility together');
select results_eq($$select theme_key from public.child_dashboard_preferences where child_id=(select id from public.children where display_name='Theme child')$$,array['hogwarts_adventure'],'theme saved');
select results_eq($$select show_star_trail from public.child_dashboard_preferences where child_id=(select id from public.children where display_name='Theme child')$$,array[false],'visibility saved');
select throws_ok($$select public.set_star_trail_preferences((select id from public.children where display_name='Theme child'),'invalid',true)$$,'22023','Invalid Star Trail theme','invalid theme rejected');
insert into public.tasks(child_id,name,points,icon) values((select id from public.children where display_name='Theme child'),'Theme help',10,'Star');
select public.queue_task_completion((select id from public.children where display_name='Theme child'),(select id from public.tasks where name='Theme help'),current_date,10,'30000000-0000-0000-0000-000000000031');
select results_eq($$select badge_name from public.achievement_awards order by milestone_stars$$,array['House Star','Spell Scholar'],'new badges use selected theme');
select results_eq($$select theme_key from public.achievement_awards order by milestone_stars$$,array['hogwarts_adventure','hogwarts_adventure'],'awards snapshot theme');
select public.set_star_trail_preferences((select id from public.children where display_name='Theme child'),'middle_earth',true);
select results_eq($$select badge_name from public.achievement_awards order by milestone_stars$$,array['House Star','Spell Scholar'],'switch leaves earned names unchanged');
select public.queue_task_completion((select id from public.children where display_name='Theme child'),(select id from public.tasks where name='Theme help'),current_date,10,'30000000-0000-0000-0000-000000000032');
select results_eq($$select badge_name from public.achievement_awards order by milestone_stars$$,array['House Star','Spell Scholar','Mithril Guardian'],'later milestone uses new theme');
select results_eq($$select point_delta from public.point_events where event_type='achievement_bonus' order by point_delta$$,array[2,3,5],'bonus amounts are unchanged');
select public.create_child_profile('Other child','UTC',false);
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa32';
select throws_ok($$select public.set_star_trail_preferences((select id from public.children where display_name='Theme child'),'middle_earth',true)$$,'42501','Child profile not found','unrelated parent cannot change theme');
select * from finish();
rollback;
