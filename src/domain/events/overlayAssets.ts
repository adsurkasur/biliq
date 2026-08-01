import type { OverlayLayer } from "@/domain/events/types";
import { isBrowser } from "@/shared/lib/browser";
import { createEntityId } from "@/shared/lib/id";

const OVERLAY_DB_NAME = "biliq.event-assets";
const OVERLAY_STORE_NAME = "overlay-assets";

interface OverlayAssetRecord {
  id: string;
  eventId: string;
  dataUrl: string;
  updatedAt: string;
}

export async function hydrateOverlayLayers(
  layers: OverlayLayer[] = []
): Promise<OverlayLayer[]> {
  if (!layers.length) {
    return [];
  }

  const db = await openOverlayDb();

  try {
    const transaction = db.transaction(OVERLAY_STORE_NAME, "readonly");
    const done = transactionDone(transaction);
    const store = transaction.objectStore(OVERLAY_STORE_NAME);
    const hydrated = await Promise.all(
      layers.map(async (layer) => {
        if (layer.imageDataUrl) {
          return layer;
        }

        if (!layer.assetId) {
          return null;
        }

        const asset = await requestResult<OverlayAssetRecord | undefined>(
          store.get(layer.assetId)
        );

        return asset ? { ...layer, imageDataUrl: asset.dataUrl } : null;
      })
    );

    await done;
    return hydrated.filter((layer): layer is OverlayLayer => Boolean(layer));
  } finally {
    db.close();
  }
}

export async function persistOverlayLayers(
  eventId: string,
  layers: OverlayLayer[]
): Promise<OverlayLayer[]> {
  const preparedLayers = layers.map((layer) => ({
    ...layer,
    assetId: layer.assetId || createEntityId("overlay-asset")
  }));
  const activeAssetIds = new Set(
    preparedLayers.map((layer) => layer.assetId).filter(Boolean)
  );
  const db = await openOverlayDb();

  try {
    const transaction = db.transaction(OVERLAY_STORE_NAME, "readwrite");
    const done = transactionDone(transaction);
    const store = transaction.objectStore(OVERLAY_STORE_NAME);
    const index = store.index("eventId");
    const cursorRequest = index.openCursor(IDBKeyRange.only(eventId));

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) {
        return;
      }

      if (!activeAssetIds.has(String(cursor.primaryKey))) {
        cursor.delete();
      }
      cursor.continue();
    };

    preparedLayers.forEach((layer) => {
      if (!layer.assetId || !layer.imageDataUrl) {
        return;
      }

      store.put({
        id: layer.assetId,
        eventId,
        dataUrl: layer.imageDataUrl,
        updatedAt: new Date().toISOString()
      } satisfies OverlayAssetRecord);
    });

    await done;
    return preparedLayers;
  } finally {
    db.close();
  }
}

export async function deleteOverlayAssetsByEventId(eventId: string): Promise<void> {
  const db = await openOverlayDb();

  try {
    const transaction = db.transaction(OVERLAY_STORE_NAME, "readwrite");
    const done = transactionDone(transaction);
    const index = transaction.objectStore(OVERLAY_STORE_NAME).index("eventId");
    const cursorRequest = index.openCursor(IDBKeyRange.only(eventId));

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) {
        return;
      }
      cursor.delete();
      cursor.continue();
    };

    await done;
  } finally {
    db.close();
  }
}

export function stripOverlayPayloads(layers: OverlayLayer[]): OverlayLayer[] {
  return layers.map((layer) => ({ ...layer, imageDataUrl: "" }));
}

function openOverlayDb(): Promise<IDBDatabase> {
  if (!isBrowser() || !("indexedDB" in window)) {
    return Promise.reject(
      new Error("Local asset storage is not available in this browser.")
    );
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(OVERLAY_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OVERLAY_STORE_NAME)) {
        const store = db.createObjectStore(OVERLAY_STORE_NAME, { keyPath: "id" });
        store.createIndex("eventId", "eventId", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
