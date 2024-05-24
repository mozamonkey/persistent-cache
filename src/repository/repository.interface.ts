/**
 * Interface defining the contract for database operations.
 */
interface Repository {
  /**
   * Creates a new cache entry.
   * @param key - The key of the cache entry.
   * @param value - The value of the cache entry.
   * @param createdAt - The timestamp when the cache entry was created.
   * @param ttl - The time-to-live (TTL) of the cache entry in milliseconds.
   * @returns A promise that resolves when the operation is complete.
   */
  create(key: string, value: string, createdAt: number, ttl?: number): Promise<any>;
  /**
   * Deletes a cache entry by key.
   * @param key - The key of the cache entry to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  delete(key: string): Promise<any>;
  /**
   * Sets the expiration time (TTL) for a cache entry.
   * @param key - The key of the cache entry.
   * @param ttl - The new TTL value in milliseconds.
   * @returns A promise that resolves when the operation is complete.
   */
  setExpire(key: string, ttl: number): Promise<any>;
  /**
   * Retrieves all cache entries.
   * @returns A promise that resolves with an array of cache objects.
   */
  getAll(): Promise<CacheObject[]>;
}
