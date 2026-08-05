drop policy "parents can read their children" on public.children;

create policy "parents can read their active children"
  on public.children for select to authenticated
  using ((select auth.uid()) = parent_id and archived_at is null);
