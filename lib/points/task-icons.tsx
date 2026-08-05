import { Bath, BedDouble, BookOpen, CircleCheck, Gamepad2, Shirt, Sparkles, Star, ToyBrick, Utensils, type LucideProps } from "lucide-react";
import type { TaskIconName } from "@/lib/points/validation";

const taskIcons = { Bath, BedDouble, BookOpen, CircleCheck, Gamepad2, Shirt, Sparkles, Star, ToyBrick, Utensils } satisfies Record<TaskIconName, typeof CircleCheck>;

export function TaskIcon({ name, ...props }: { name: TaskIconName } & LucideProps) {
  const Icon = taskIcons[name];
  return <Icon {...props}/>;
}
