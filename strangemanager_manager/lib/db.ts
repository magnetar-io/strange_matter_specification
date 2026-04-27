import Dexie, { type Table } from "dexie";

export interface SchemaVersionRow {
  id?: number;
  parentId: number | null;
  label: string;
  schema: unknown;
  createdAt: number;
}

export interface InstanceRow {
  id?: number;
  versionId: number;
  label: string;
  data: unknown;
  createdAt: number;
}

class SchemaGraphDB extends Dexie {
  schemaVersions!: Table<SchemaVersionRow, number>;
  instances!: Table<InstanceRow, number>;

  constructor() {
    super("strangemanager_schemagraph");
    this.version(1).stores({
      schemaVersions: "++id, parentId, createdAt, label",
      instances: "++id, versionId, createdAt, label",
    });
  }
}

let _db: SchemaGraphDB | null = null;

export function getDB(): SchemaGraphDB {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  if (!_db) {
    _db = new SchemaGraphDB();
  }
  return _db;
}
