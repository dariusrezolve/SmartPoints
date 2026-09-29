export function classifyPointSyncError(error: { code?: string; message: string }) {
  return {
    status: error.code === "22023" ? "rejected" as const : "queued" as const,
    reason: error.message,
  };
}
