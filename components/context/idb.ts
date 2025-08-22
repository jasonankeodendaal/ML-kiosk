import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'KioskStateDB';
const STORE_NAME = 'KeyValueStore';
const DB_VERSION = 1;

interface StateDB extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<StateDB>>;

const getDB = (): Promise<IDBPDatabase<StateDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<StateDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

export const idbGet = async <T>(key: string): Promise<T | undefined> => {
  const db = await getDB();
  return db.get(STORE_NAME, key);
};

export const idbSet = async (key: string, value: any): Promise<IDBValidKey> => {
  const db = await getDB();
  return db.put(STORE_NAME, value, key);
};
