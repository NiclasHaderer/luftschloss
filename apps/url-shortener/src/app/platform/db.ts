import { Database } from "sqlite3";
import { environment } from "../../environments/environment";

const DBConfig = {
  name: environment.db.name,
};

let _db: Database;

const getDb = async () => {
  if (!_db) {
    _db = new Database(DBConfig.name);
    await db.run(`
      CREATE TABLE IF NOT EXISTS urls
      (
        id
          char(5)
          PRIMARY
            KEY,
        url
          TEXT
          NOT
            NULL,
        user
          CHARACTER(20)
      );
    `);
  }
  return _db;
};

export const db = {
  get: async <T extends object | unknown = unknown>(query: string, params?: any[]): Promise<T | undefined> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, data) => {
        if (err) reject(err);
        resolve(data as T);
      });
    });
  },

  getAll: async <T extends [] | unknown = unknown>(query: string, params?: any[]): Promise<T[]> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, data) => {
        if (err) reject(err);
        resolve(data as T[]);
      });
    });
  },

  run: async (query: string, params?: any[]) => {
    const db = await getDb();
    return new Promise<void>((resolve, reject) => {
      db.run(query, params, err => {
        if (err) reject(err);
        resolve();
      });
    });
  },
};
