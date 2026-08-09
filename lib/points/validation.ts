export function normalizeTitle(value: string | undefined, label: string): string {
  const title = value?.trim() ?? "";

  if (title.length < 1 || title.length > 80) {
    throw new Error(`${label} must be between 1 and 80 characters.`);
  }

  return title;
}

export function normalizePointValue(value: string | undefined, label: string): number {
  const points = Number(value);

  if (!Number.isSafeInteger(points) || points < 1) {
    throw new Error(`${label} must be a positive whole number.`);
  }

  return points;
}

export const taskIconNames = [
  "Apple", "Backpack", "Bath", "BedDouble", "Bike", "BookOpen", "BrushCleaning", "CakeSlice",
  "Cat", "CircleCheck", "Dog", "Dumbbell", "Footprints", "Gamepad2", "Heart", "House", "Medal",
  "MoonStar", "Music2", "Palette", "PartyPopper", "School", "Shirt", "Smile", "Sparkles", "Star",
  "Sun", "ToyBrick", "Trees", "Trophy", "Utensils", "WashingMachine",
] as const;
export type TaskIconName = (typeof taskIconNames)[number];

export function isTaskIcon(value: string): value is TaskIconName {
  return taskIconNames.includes(value as TaskIconName);
}

export function getCurrentLocalDate(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getWeekStart(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00Z`);
  const day = parsedDate.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  parsedDate.setUTCDate(parsedDate.getUTCDate() - daysSinceMonday);
  return parsedDate.toISOString().slice(0, 10);
}

export function shiftWeek(weekStart: string, offset: number): string {
  const value = new Date(`${weekStart}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + offset * 7);
  return value.toISOString().slice(0, 10);
}

type PointEventSummaryInput = { effective_date: string; event_type: string; point_delta: number };

export function getPointSummary(events: PointEventSummaryInput[], currentDate: string) {
  return events.reduce((summary, event) => ({
    balance: summary.balance + event.point_delta,
    receivedToday: summary.receivedToday + (event.effective_date === currentDate && event.point_delta > 0 ? event.point_delta : 0),
    redeemedToday: summary.redeemedToday + (event.effective_date === currentDate && event.event_type === "reward_redemption" ? Math.abs(event.point_delta) : 0),
  }), { balance: 0, receivedToday: 0, redeemedToday: 0 });
}

type ResetPointEvent = PointEventSummaryInput & { created_at: string };
type WeeklyPointReset = { remaining_points: number; received_points: number; redeemed_points: number; reset_at: string; week_start: string };

export function getWeeklyPointSummary(events: PointEventSummaryInput[], currentWeekStart: string) {
  return events.reduce((summary, event) => ({
    balance: summary.balance + event.point_delta,
    receivedThisWeek: summary.receivedThisWeek + (event.effective_date >= currentWeekStart && event.event_type === "task_completion" ? event.point_delta : 0),
    redeemedThisWeek: summary.redeemedThisWeek + (event.effective_date >= currentWeekStart && event.event_type === "reward_redemption" ? Math.abs(event.point_delta) : 0),
  }), { balance: 0, receivedThisWeek: 0, redeemedThisWeek: 0 });
}

export function getResetPointSummary(events: ResetPointEvent[], currentWeekStart: string, reset: WeeklyPointReset) {
  const newWeekEvents = events.filter((event) => event.created_at > reset.reset_at && event.effective_date >= currentWeekStart);
  return newWeekEvents.reduce((summary, event) => ({
    balance: summary.balance + event.point_delta,
    receivedThisWeek: summary.receivedThisWeek + (event.event_type === "task_completion" ? event.point_delta : 0),
    redeemedThisWeek: summary.redeemedThisWeek + (event.event_type === "reward_redemption" ? Math.abs(event.point_delta) : 0),
  }), { balance: reset.remaining_points, receivedThisWeek: reset.received_points, redeemedThisWeek: reset.redeemed_points });
}

export const starterTasks = [
  { name: "Brush teeth", points: 2, icon: "Sparkles" },
  { name: "Go to the bathroom", points: 1, icon: "Bath" },
  { name: "Put toys away", points: 3, icon: "ToyBrick" },
  { name: "Get dressed", points: 2, icon: "Shirt" },
] as const;
