import { format, addMinutes, startOfDay, endOfDay, differenceInSeconds, parseISO } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const DEFAULT_TIMEZONE = "Asia/Kolkata";

export function getUserTimezone(): string {
  return DEFAULT_TIMEZONE;
}

export function toUserTimezone(date: Date | string, timezone?: string): Date {
  const tz = timezone || DEFAULT_TIMEZONE;
  const d = typeof date === "string" ? parseISO(date) : date;
  return toZonedTime(d, tz);
}

export function fromUserTimezone(date: Date | string, timezone?: string): Date {
  const tz = timezone || DEFAULT_TIMEZONE;
  const d = typeof date === "string" ? parseISO(date) : date;
  return fromZonedTime(d, tz);
}

export function formatDuration(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

export function formatDurationShort(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatDurationCompact(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getStartOfDayInTimezone(date: Date, timezone?: string): Date {
  const tz = timezone || DEFAULT_TIMEZONE;
  const zoned = toUserTimezone(date, tz);
  const startLocal = startOfDay(zoned);
  return fromUserTimezone(startLocal, tz);
}

export function getEndOfDayInTimezone(date: Date, timezone?: string): Date {
  const tz = timezone || DEFAULT_TIMEZONE;
  const zoned = toUserTimezone(date, tz);
  const endLocal = endOfDay(zoned);
  return fromUserTimezone(endLocal, tz);
}

export function calculateDuration(startedAt: Date | string, endedAt: Date | string): number {
  const start = typeof startedAt === "string" ? parseISO(startedAt) : startedAt;
  const end = typeof endedAt === "string" ? parseISO(endedAt) : endedAt;
  return Math.max(0, differenceInSeconds(end, start));
}

export function splitSessionAcrossMidnight(
  startedAt: Date,
  endedAt: Date,
  timezone?: string
): Array<{ date: string; durationSeconds: number }> {
  const tz = timezone || DEFAULT_TIMEZONE;
  const results: Array<{ date: string; durationSeconds: number }> = [];

  let current = new Date(startedAt);
  const end = new Date(endedAt);

  while (current < end) {
    const dayEnd = getEndOfDayInTimezone(current, tz);
    const segmentEnd = dayEnd < end ? dayEnd : end;
    const segmentDuration = calculateDuration(current, segmentEnd);

    if (segmentDuration > 0) {
      const zonedDate = toUserTimezone(current, tz);
      const dateStr = format(zonedDate, "yyyy-MM-dd");
      results.push({ date: dateStr, durationSeconds: segmentDuration });
    }

    if (dayEnd < end) {
      current = new Date(dayEnd);
      current = new Date(current.getTime() + 1000);
    } else {
      break;
    }
  }

  return results;
}

export function getDateRange(
  dateStr: string,
  timezone?: string
): { start: Date; end: Date } {
  const tz = timezone || DEFAULT_TIMEZONE;
  const date = parseISO(dateStr);
  const zonedStart = startOfDay(toUserTimezone(date, tz));
  const zonedEnd = endOfDay(toUserTimezone(date, tz));
  return {
    start: fromUserTimezone(zonedStart, tz),
    end: fromUserTimezone(zonedEnd, tz),
  };
}

export function formatTime(date: Date | string, timezone?: string): string {
  const tz = timezone || DEFAULT_TIMEZONE;
  const d = typeof date === "string" ? parseISO(date) : date;
  const zoned = toUserTimezone(d, tz);
  return format(zoned, "hh:mm a");
}

export function formatDate(date: Date | string, timezone?: string): string {
  const tz = timezone || DEFAULT_TIMEZONE;
  const d = typeof date === "string" ? parseISO(date) : date;
  const zoned = toUserTimezone(d, tz);
  return format(zoned, "dd MMMM yyyy");
}

export function formatDateShort(date: Date | string, timezone?: string): string {
  const tz = timezone || DEFAULT_TIMEZONE;
  const d = typeof date === "string" ? parseISO(date) : date;
  const zoned = toUserTimezone(d, tz);
  return format(zoned, "dd MMM");
}

export function getTodayString(timezone?: string): string {
  const tz = timezone || DEFAULT_TIMEZONE;
  const now = new Date();
  const zoned = toUserTimezone(now, tz);
  return format(zoned, "yyyy-MM-dd");
}

export function getCurrentServerTime(): Date {
  return new Date();
}
