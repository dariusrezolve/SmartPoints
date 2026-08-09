alter table public.tasks drop constraint if exists tasks_icon_check;
alter table public.tasks add constraint tasks_icon_check check (icon in (
  'Apple', 'Backpack', 'Bath', 'BedDouble', 'Bike', 'BookOpen', 'BrushCleaning', 'CakeSlice',
  'Cat', 'CircleCheck', 'Dog', 'Dumbbell', 'Footprints', 'Gamepad2', 'Heart', 'House', 'Medal',
  'MoonStar', 'Music2', 'Palette', 'PartyPopper', 'School', 'Shirt', 'Smile', 'Sparkles', 'Star',
  'Sun', 'ToyBrick', 'Trees', 'Trophy', 'Utensils', 'WashingMachine'
));

alter table public.rewards drop constraint if exists rewards_icon_check;
alter table public.rewards add constraint rewards_icon_check check (icon in (
  'Apple', 'Backpack', 'Bath', 'BedDouble', 'Bike', 'BookOpen', 'BrushCleaning', 'CakeSlice',
  'Cat', 'CircleCheck', 'Dog', 'Dumbbell', 'Footprints', 'Gamepad2', 'Heart', 'House', 'Medal',
  'MoonStar', 'Music2', 'Palette', 'PartyPopper', 'School', 'Shirt', 'Smile', 'Sparkles', 'Star',
  'Sun', 'ToyBrick', 'Trees', 'Trophy', 'Utensils', 'WashingMachine'
));
