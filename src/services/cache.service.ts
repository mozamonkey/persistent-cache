import { Service } from 'typedi';
import { HttpException, HttpStatusCode } from '@exceptions/HttpException';
import { db } from '@repository/db';

/**
 * Cache service class for managing cache operations.
 */
@Service()
export class CacheService {
  private readonly cache: Record<string, CacheValue> = {};
  /**
   * Constructor initializes the cache from the database for persistent storage.
   */
  constructor() {
    this.cache = {};
    try {
      db.getAll().then((cacheData: CacheObject[]) => {
        cacheData.forEach(cache => {
          this.cache[cache.key] = cache;
        });
      });
    } catch (error) {
      // console.error(error);
    }
  }
  /**
   * Finds a cache entry by key.
   * @param key - The key of the cache entry to find.
   * @returns A promise that resolves with the cache value.
   * @throws {HttpException} If the cache entry does not exist or is expired.
   */
  public async findCacheByKey(key: string): Promise<CacheValue> {
    const findCache: CacheValue = this.cache[key];
    if (!findCache) throw new HttpException(HttpStatusCode.NOT_FOUND, "Cache doesn't exist");
    if (findCache.ttl !== undefined && findCache.lastUpdatedAt + findCache.ttl < Date.now()) {
      delete this.cache[key];
      db.delete(key);
      throw new HttpException(HttpStatusCode.NOT_FOUND, 'Cache is expired');
    }
    return findCache;
  }

  /**
   * Creates a new cache entry.
   * @param cacheData - The data for the new cache entry.
   * @returns A promise that resolves when the operation is complete.
   */
  public async createCache(cacheData: CacheObject): Promise<any> {
    this.cache[cacheData.key] = {
      value: cacheData.value,
      ttl: cacheData.ttl,
      lastUpdatedAt: Date.now(),
    };
    db.create(cacheData.key, cacheData.value, cacheData.ttl);
    return true;
  }

  /**
   * Sets the expiration time (TTL) for a cache entry.
   * @param key - The key of the cache entry to update.
   * @param ttl - The new TTL value in milliseconds.
   * @returns A promise that resolves when the operation is complete.
   * @throws {HttpException} If the cache entry does not exist.
   */
  public async setExpireIn(key: string, ttl: number): Promise<any> {
    const cachedValue = this.cache[key];
    if (!cachedValue) throw new HttpException(HttpStatusCode.NOT_FOUND, "Cache doesn't exist");
    if (cachedValue.ttl !== undefined && cachedValue.lastUpdatedAt + cachedValue.ttl < Date.now()) {
      delete this.cache[key];
      db.delete(key);
      throw new HttpException(HttpStatusCode.NOT_FOUND, 'Cache is expired');
    }
    cachedValue.ttl = ttl;
    db.setExpire(key, ttl);
    return true;
  }

  /**
   * Deletes a cache entry by key.
   * @param key - The key of the cache entry to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  public async deleteCache(key: string): Promise<any> {
    delete this.cache[key];
    db.delete(key);
    return true;
  }

  /**
   * Gets the TTL (time-to-live) for a cache entry.
   * @param key - The key of the cache entry.
   * @returns A promise that resolves with the TTL value in milliseconds.
   * @throws {HttpException} If the cache entry does not exist.
   */
  public async getTtl(key: string): Promise<number> {
    const cachedValue = this.cache[key];
    if (!cachedValue) throw new HttpException(HttpStatusCode.NOT_FOUND, "Cache doesn't exist");
    return cachedValue.ttl;
  }
}
