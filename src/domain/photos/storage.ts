import type { PhotoRecord } from "@/domain/photos/types";
import { storageKeys } from "@/shared/config/storageKeys";
import { isBrowser } from "@/shared/lib/browser";

export async function savePhotoRecord(photo: PhotoRecord): Promise<PhotoRecord> {
  const db = await openPhotoDb();

  await withStore(db, "readwrite", (store) => store.put(photo));
  db.close();

  return photo;
}

export async function getPhotoById(id: string): Promise<PhotoRecord | undefined> {
  const db = await openPhotoDb();
  const photo = await withStore<PhotoRecord | undefined>(db, "readonly", (store) =>
    store.get(id)
  );
  db.close();

  return photo;
}

export async function getPhotosByEventSlug(
  eventSlug: string
): Promise<PhotoRecord[]> {
  const db = await openPhotoDb();
  const photos = await new Promise<PhotoRecord[]>((resolve, reject) => {
    const transaction = db.transaction(storageKeys.photoStoreName, "readonly");
    const store = transaction.objectStore(storageKeys.photoStoreName);
    const index = store.index("eventSlug");
    const request = index.getAll(eventSlug);

    request.onsuccess = () => resolve(request.result as PhotoRecord[]);
    request.onerror = () => reject(request.error);
  });
  db.close();

  return photos.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openPhotoDb();
  await withStore(db, "readwrite", (store) => store.delete(id));
  db.close();
}

function openPhotoDb(): Promise<IDBDatabase> {
  if (!isBrowser() || !("indexedDB" in window)) {
    return Promise.reject(
      new Error("IndexedDB is not available in this browser.")
    );
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(storageKeys.photoDbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(storageKeys.photoStoreName)) {
        const store = db.createObjectStore(storageKeys.photoStoreName, {
          keyPath: "id"
        });
        store.createIndex("eventSlug", "eventSlug", { unique: false });
        store.createIndex("eventId", "eventId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storageKeys.photoStoreName, mode);
    const store = transaction.objectStore(storageKeys.photoStoreName);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
