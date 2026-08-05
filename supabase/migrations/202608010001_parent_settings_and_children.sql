create extension if not exists pgcrypto with schema extensions;

create table public.parent_settings (
  id uuid primary key references auth.users (id) on delete cascade,
  time_zone text not null default 'UTC',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (char_length(btrim(time_zone)) between 1 and 64),
  check (time_zone = btrim(time_zone))
);

create table public.children (
  id uuid primary key default extensions.gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (char_length(display_name) between 1 and 80),
  check (display_name = btrim(display_name)),
  check (archived_at is null or archived_at >= created_at)
);

create unique index children_active_parent_display_name_idx
  on public.children (parent_id, lower(display_name))
  where archived_at is null;

create index children_parent_active_created_at_idx
  on public.children (parent_id, created_at)
  where archived_at is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_parent_settings_updated_at
  before update on public.parent_settings
  for each row execute function public.set_updated_at();

create trigger set_children_updated_at
  before update on public.children
  for each row execute function public.set_updated_at();

alter table public.parent_settings enable row level security;
alter table public.children enable row level security;

create policy "parents can read their settings"
  on public.parent_settings for select to authenticated
  using ((select auth.uid()) = id);

create policy "parents can create their settings"
  on public.parent_settings for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "parents can update their settings"
  on public.parent_settings for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "parents can read their children"
  on public.children for select to authenticated
  using ((select auth.uid()) = parent_id);

create policy "parents can create their children"
  on public.children for insert to authenticated
  with check ((select auth.uid()) = parent_id);

create policy "parents can update active children"
  on public.children for update to authenticated
  using ((select auth.uid()) = parent_id and archived_at is null)
  with check ((select auth.uid()) = parent_id);
