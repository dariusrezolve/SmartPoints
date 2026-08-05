alter table public.tasks add column if not exists icon text;
update public.tasks set icon = 'CircleCheck' where icon is null;
alter table public.tasks alter column icon set default 'CircleCheck';
alter table public.tasks alter column icon set not null;
alter table public.tasks drop constraint if exists tasks_icon_check;
alter table public.tasks add constraint tasks_icon_check check (icon in ('Bath', 'BedDouble', 'BookOpen', 'CircleCheck', 'Gamepad2', 'Shirt', 'Sparkles', 'Star', 'ToyBrick', 'Utensils'));
