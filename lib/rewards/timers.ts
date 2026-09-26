export function formatTimerRemaining(endsAt: string, now = new Date()): string {
  const remainingSeconds = Math.max(0, Math.ceil((new Date(endsAt).getTime() - now.getTime()) / 1000));
  if (remainingSeconds === 0) return "Time is up";
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const time = hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
  return `${time} remaining`;
}
