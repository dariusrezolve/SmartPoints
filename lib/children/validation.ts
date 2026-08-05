const CHILD_NAME_MAX_LENGTH = 80;
const DEFAULT_TIME_ZONE = "UTC";

export function normalizeChildName(value: string): string {
  const displayName = value.trim();

  if (displayName.length === 0 || displayName.length > CHILD_NAME_MAX_LENGTH) {
    throw new Error("Child display name must be between 1 and 80 characters.");
  }

  return displayName;
}

export function resolveHouseholdTimeZone(value: string | undefined): string {
  if (!value) {
    return DEFAULT_TIME_ZONE;
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return value;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}
