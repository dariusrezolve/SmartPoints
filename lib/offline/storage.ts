export type OfflineTask = { id: string; name: string; points: number; icon: string };
export type OfflineReward = { id: string; name: string; cost: number };
export type OfflineEvent = { id: string; eventType: string; pointDelta: number; effectiveDate: string; taskId: string | null; rewardId: string | null; taskName?: string; rewardName?: string; icon?: string };
export type OfflineSnapshot = { key: string; parentId: string; childId: string; childName: string; currentDate: string; balance: number; receivedThisWeek: number; redeemedThisWeek: number; tasks: OfflineTask[]; rewards: OfflineReward[]; events: OfflineEvent[]; savedAt: string };

const databaseName = "smartpoints-offline";
const databaseVersion = 3;
const storeName = "snapshots";
const actionStoreName = "actions";
export type OfflineAction = { id: string; parentId: string; childId: string; kind: "complete" | "undo" | "redeem"; taskId?: string; rewardId?: string; eventId?: string; effectiveDate?: string; pointDelta?: number; createdAt: string; status: "queued" | "needs_attention"; reason?: string };

export function offlineSnapshotKey(parentId: string, childId: string) { return `${parentId}:${childId}`; }

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = (event) => {
      if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName, { keyPath: "key" });
      if (!request.result.objectStoreNames.contains(actionStoreName)) request.result.createObjectStore(actionStoreName, { keyPath: "id" });
      if (event.oldVersion > 0 && event.oldVersion < databaseVersion) {
        const transaction = request.transaction;
        if (!transaction) return;
        transaction.objectStore(storeName).clear();
        transaction.objectStore(actionStoreName).clear();
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveOfflineSnapshot(snapshot: OfflineSnapshot) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => { const transaction = database.transaction(storeName, "readwrite"); transaction.objectStore(storeName).put(snapshot); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
  database.close();
}

export async function loadLatestOfflineSnapshot(): Promise<OfflineSnapshot | null> {
  const database = await openDatabase();
  const records = await new Promise<OfflineSnapshot[]>((resolve, reject) => { const request = database.transaction(storeName, "readonly").objectStore(storeName).getAll(); request.onsuccess = () => resolve(request.result as OfflineSnapshot[]); request.onerror = () => reject(request.error); });
  database.close();
  return records.sort((left, right) => right.savedAt.localeCompare(left.savedAt))[0] ?? null;
}

export async function clearOfflineSnapshots() {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => { const transaction = database.transaction(storeName, "readwrite"); transaction.objectStore(storeName).clear(); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
  database.close();
}

export async function enqueueOfflineAction(action: OfflineAction) { const database = await openDatabase(); await new Promise<void>((resolve, reject) => { const transaction = database.transaction(actionStoreName, "readwrite"); transaction.objectStore(actionStoreName).put(action); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); }); database.close(); }
export async function listOfflineActions(): Promise<OfflineAction[]> { const database = await openDatabase(); const actions = await new Promise<OfflineAction[]>((resolve, reject) => { const request = database.transaction(actionStoreName, "readonly").objectStore(actionStoreName).getAll(); request.onsuccess = () => resolve(request.result as OfflineAction[]); request.onerror = () => reject(request.error); }); database.close(); return actions.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); }
export async function removeOfflineAction(id: string) { const database = await openDatabase(); await new Promise<void>((resolve, reject) => { const transaction = database.transaction(actionStoreName, "readwrite"); transaction.objectStore(actionStoreName).delete(id); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); }); database.close(); }
