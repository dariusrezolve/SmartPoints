import { shiftWeek } from "../points/validation";

export type StatisticsEvent = {
  effective_date: string;
  event_type: string;
  point_delta: number;
  reward_id: string | null;
  task_id: string | null;
};

export type TrendMetric = {
  current: number;
  previous: number;
  delta: number;
  percentChange: number | null;
};

export type BreakdownTrend = TrendMetric & {
  id: string;
  share: number;
  currentDaily: number[];
  previousDaily: number[];
};

export type WeeklyStatistics = {
  received: TrendMetric;
  spent: TrendMetric;
  net: TrendMetric;
  taskTrends: BreakdownTrend[];
  rewardTrends: BreakdownTrend[];
  currentReceivedDaily: number[];
  previousReceivedDaily: number[];
};

export function percentageChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function metric(current: number, previous: number): TrendMetric {
  return { current, previous, delta: current - previous, percentChange: percentageChange(current, previous) };
}

function dayIndex(date: string, weekStart: string): number {
  const dateValue = Date.parse(`${date}T00:00:00Z`);
  const weekValue = Date.parse(`${weekStart}T00:00:00Z`);
  return Math.floor((dateValue - weekValue) / 86_400_000);
}

function add(map: Map<string, number>, id: string, points: number) {
  map.set(id, (map.get(id) ?? 0) + points);
}

function addDaily(map: Map<string, number[]>, id: string, index: number, points: number) {
  const daily = map.get(id) ?? Array<number>(7).fill(0);
  daily[index] += points;
  map.set(id, daily);
}

function breakdown(
  current: Map<string, number>,
  previous: Map<string, number>,
  currentDaily: Map<string, number[]>,
  previousDaily: Map<string, number[]>,
  total: number,
): BreakdownTrend[] {
  return [...new Set([...current.keys(), ...previous.keys()])]
    .map((id) => {
      const trend = metric(current.get(id) ?? 0, previous.get(id) ?? 0);
      return {
        id,
        ...trend,
        share: total > 0 ? Math.round((trend.current / total) * 100) : 0,
        currentDaily: currentDaily.get(id) ?? Array<number>(7).fill(0),
        previousDaily: previousDaily.get(id) ?? Array<number>(7).fill(0),
      };
    })
    .sort((a, b) => b.delta - a.delta || b.current - a.current || a.id.localeCompare(b.id));
}

export function buildWeeklyStatistics(events: StatisticsEvent[], currentWeekStart: string): WeeklyStatistics {
  const previousWeekStart = shiftWeek(currentWeekStart, -1);
  const currentWeekEnd = shiftWeek(currentWeekStart, 1);
  const currentTasks = new Map<string, number>();
  const previousTasks = new Map<string, number>();
  const currentRewards = new Map<string, number>();
  const previousRewards = new Map<string, number>();
  const currentTaskDaily = new Map<string, number[]>();
  const previousTaskDaily = new Map<string, number[]>();
  const currentRewardDaily = new Map<string, number[]>();
  const previousRewardDaily = new Map<string, number[]>();
  const currentReceivedDaily = Array<number>(7).fill(0);
  const previousReceivedDaily = Array<number>(7).fill(0);

  for (const event of events) {
    const isCurrent = event.effective_date >= currentWeekStart && event.effective_date < currentWeekEnd;
    const isPrevious = event.effective_date >= previousWeekStart && event.effective_date < currentWeekStart;
    if (!isCurrent && !isPrevious) continue;
    const start = isCurrent ? currentWeekStart : previousWeekStart;
    const index = dayIndex(event.effective_date, start);
    if (index < 0 || index > 6) continue;

    if ((event.event_type === "task_completion" || event.event_type === "task_completion_undo") && event.task_id) {
      const totals = isCurrent ? currentTasks : previousTasks;
      const daily = isCurrent ? currentTaskDaily : previousTaskDaily;
      const overallDaily = isCurrent ? currentReceivedDaily : previousReceivedDaily;
      add(totals, event.task_id, event.point_delta);
      addDaily(daily, event.task_id, index, event.point_delta);
      overallDaily[index] += event.point_delta;
    }

    if (event.event_type === "reward_redemption" && event.reward_id) {
      const spent = Math.abs(event.point_delta);
      add(isCurrent ? currentRewards : previousRewards, event.reward_id, spent);
      addDaily(isCurrent ? currentRewardDaily : previousRewardDaily, event.reward_id, index, spent);
    }
  }

  const currentReceived = [...currentTasks.values()].reduce((sum, points) => sum + points, 0);
  const previousReceived = [...previousTasks.values()].reduce((sum, points) => sum + points, 0);
  const currentSpent = [...currentRewards.values()].reduce((sum, points) => sum + points, 0);
  const previousSpent = [...previousRewards.values()].reduce((sum, points) => sum + points, 0);

  return {
    received: metric(currentReceived, previousReceived),
    spent: metric(currentSpent, previousSpent),
    net: metric(currentReceived - currentSpent, previousReceived - previousSpent),
    taskTrends: breakdown(currentTasks, previousTasks, currentTaskDaily, previousTaskDaily, currentReceived),
    rewardTrends: breakdown(currentRewards, previousRewards, currentRewardDaily, previousRewardDaily, currentSpent),
    currentReceivedDaily,
    previousReceivedDaily,
  };
}
