import {
  Apple, Backpack, Bath, BedDouble, Bike, BookOpen, BrushCleaning, CakeSlice, Cat, CircleCheck,
  Dog, Dumbbell, Footprints, Gamepad2, Heart, House, Medal, MoonStar, Music2, Palette, PartyPopper,
  School, Shirt, Smile, Sparkles, Star, Sun, ToyBrick, Trees, Trophy, Utensils, WashingMachine,
  type LucideProps,
} from "lucide-react";
import type { TaskIconName } from "@/lib/points/validation";

const taskIcons = {
  Apple, Backpack, Bath, BedDouble, Bike, BookOpen, BrushCleaning, CakeSlice, Cat, CircleCheck,
  Dog, Dumbbell, Footprints, Gamepad2, Heart, House, Medal, MoonStar, Music2, Palette, PartyPopper,
  School, Shirt, Smile, Sparkles, Star, Sun, ToyBrick, Trees, Trophy, Utensils, WashingMachine,
} satisfies Record<TaskIconName, typeof CircleCheck>;

export function TaskIcon({ name, ...props }: { name: TaskIconName } & LucideProps) {
  const Icon = taskIcons[name];
  return <Icon {...props}/>;
}
