alter table public.rewards add column if not exists icon text;

update public.rewards set icon = 'Star' where icon is null;

alter table public.rewards alter column icon set default 'Star';
alter table public.rewards alter column icon set not null;
alter table public.rewards drop constraint if exists rewards_icon_check;
alter table public.rewards add constraint rewards_icon_check check (icon in ('Bath', 'BedDouble', 'BookOpen', 'CircleCheck', 'Gamepad2', 'Shirt', 'Sparkles', 'Star', 'ToyBrick', 'Utensils'));
