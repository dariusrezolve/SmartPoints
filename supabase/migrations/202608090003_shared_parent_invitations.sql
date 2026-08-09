create table public.child_parent_memberships (
  child_id uuid not null references public.children(id) on delete cascade,
  parent_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'shared')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (child_id, parent_id)
);

insert into public.child_parent_memberships (child_id, parent_id, role)
select id, parent_id, 'owner' from public.children
on conflict (child_id, parent_id) do nothing;

create table public.child_parent_invitations (
  id uuid primary key default extensions.gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  invited_email text not null check (invited_email = lower(btrim(invited_email))),
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.child_parent_memberships enable row level security;
alter table public.child_parent_invitations enable row level security;
grant select, insert, update on public.child_parent_memberships, public.child_parent_invitations to authenticated;

create or replace function public.can_access_child(p_child_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.child_parent_memberships where child_id = p_child_id and parent_id = (select auth.uid()))
$$;
revoke all on function public.can_access_child(uuid) from public;
grant execute on function public.can_access_child(uuid) to authenticated;

create policy "members can read memberships" on public.child_parent_memberships for select to authenticated using (public.can_access_child(child_id));
create policy "owners can create invitations" on public.child_parent_invitations for insert to authenticated with check (created_by = (select auth.uid()) and exists (select 1 from public.children where id = child_id and parent_id = (select auth.uid())));
create policy "owners can read invitations" on public.child_parent_invitations for select to authenticated using (exists (select 1 from public.children where id = child_id and parent_id = (select auth.uid())));

drop policy if exists "parents can read their active children" on public.children;
create policy "members can read active children" on public.children for select to authenticated using (archived_at is null and public.can_access_child(id));

drop policy if exists "parents can read active tasks" on public.tasks;
drop policy if exists "parents can create tasks" on public.tasks;
drop policy if exists "parents can update active tasks" on public.tasks;
create policy "members can manage active tasks" on public.tasks for all to authenticated using (is_active and public.can_access_child(child_id)) with check (public.can_access_child(child_id));
drop policy if exists "parents can read active rewards" on public.rewards;
drop policy if exists "parents can create rewards" on public.rewards;
drop policy if exists "parents can update active rewards" on public.rewards;
create policy "members can manage active rewards" on public.rewards for all to authenticated using (is_active and public.can_access_child(child_id)) with check (public.can_access_child(child_id));
drop policy if exists "parents can read point events" on public.point_events;
create policy "members can read point events" on public.point_events for select to authenticated using (public.can_access_child(child_id));
drop policy if exists "parents can read weekly task plans" on public.weekly_task_plans;
create policy "members can read weekly task plans" on public.weekly_task_plans for select to authenticated using (public.can_access_child(child_id));
drop policy if exists "parents can read weekly point resets" on public.weekly_point_resets;
create policy "members can read weekly point resets" on public.weekly_point_resets for select to authenticated using (public.can_access_child(child_id));

create or replace function public.accept_child_parent_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_invite public.child_parent_invitations; v_email text;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  select * into v_invite from public.child_parent_invitations where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') and accepted_at is null and expires_at > timezone('utc', now()) for update;
  if v_invite.id is null or v_invite.invited_email <> v_email then raise exception 'This invitation is invalid, expired, or for a different email address' using errcode = '42501'; end if;
  insert into public.child_parent_memberships (child_id, parent_id, role) values (v_invite.child_id, auth.uid(), 'shared') on conflict (child_id, parent_id) do nothing;
  update public.child_parent_invitations set accepted_at = timezone('utc', now()) where id = v_invite.id;
  return v_invite.child_id;
end;
$$;
revoke all on function public.accept_child_parent_invitation(text) from public;
grant execute on function public.accept_child_parent_invitation(text) to authenticated;
