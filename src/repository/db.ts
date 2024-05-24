import sqlite3 from 'sqlite3';

/**
 * DB class implementing the Repository interface for SQLite database operations.
 */
class DB implements Repository {
  private db: sqlite3.Database;

  /**
   * Constructor initializing the SQLite database and creating the cache table if it doesn't exist.
   */
  constructor(storage = 'cache.db') {
    this.db = new sqlite3.Database(storage);
  }

  public async init(): Promise<void> {
    // Create the cache table if it doesn't exist
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT, ttl INTEGER, last_updated_at INTEGER)', err => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    });
  }
  /**
   * Creates a new cache entry.
   * @param key - The key of the cache entry.
   * @param value - The value of the cache entry.
   * @param createdAt - The timestamp when the cache entry was created.
   * @param ttl - The time-to-live (TTL) of the cache entry in milliseconds.
   * @returns A promise that resolves when the operation is complete.
   */
  public create(key: string, value: string, createdAt: number, ttl?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO cache (key, value, ttl, last_updated_at) VALUES (?, ?, ?, ?)', [key, value, ttl, createdAt], err => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  /**
   * Deletes a cache entry by key.
   * @param key - The key of the cache entry to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  public delete(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM cache WHERE key = ?', [key], err => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  /**
   * Sets the expiration time (TTL) for a cache entry.
   * @param key - The key of the cache entry.
   * @param ttl - The new TTL value in milliseconds.
   * @returns A promise that resolves when the operation is complete.
   */
  public setExpire(key: string, ttl: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE cache SET ttl = ?, last_updated_at = ? WHERE key = ?', [ttl, Date.now(), key], err => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  /**
   * Retrieves all cache entries.
   * @returns A promise that resolves with an array of cache objects.
   */
  public getAll(): Promise<CacheObject[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM cache', (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows as CacheObject[]);
      });
    });
  }
}

export const db = new DB(process.env.NODE_ENV === 'test' ? ':memory:' : 'cache.db');
