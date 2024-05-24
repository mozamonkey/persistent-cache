import { CacheService } from '@services/cache.service';
import { HttpException } from '@exceptions/HttpException';
import { db } from '@repository/db';

jest.mock('@repository/db');

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  describe('findCacheByKey', () => {
    it('should return cache value if it exists and is not expired', async () => {
      const key = 'existingKey';
      const cacheValue = { value: 'testValue', ttl: 60000, lastUpdatedAt: Date.now() };
      cacheService['cache'][key] = cacheValue;

      const result = await cacheService.findCacheByKey(key);
      expect(result).toEqual(cacheValue);
    });

    it('should throw HttpException if cache does not exist', async () => {
      const key = 'nonExistingKey';

      await expect(cacheService.findCacheByKey(key)).rejects.toThrow(HttpException);
      await expect(cacheService.findCacheByKey(key)).rejects.toThrow("Cache doesn't exist");
    });

    it('should throw HttpException if cache is expired', async () => {
      const key = 'expiredKey';
      const cacheValue = { value: 'testValue', ttl: 1000, lastUpdatedAt: Date.now() - 2000 };
      cacheService['cache'][key] = cacheValue;

      await expect(cacheService.findCacheByKey(key)).rejects.toThrow(HttpException);
      await expect(cacheService.findCacheByKey(key)).rejects.toThrow("Cache doesn't exist");
    });
  });

  describe('createCache', () => {
    it('should create a new cache entry', async () => {
      const cacheData: CacheObject = { key: 'newKey', value: 'newValue', ttl: 60000, lastUpdatedAt: Date.now() };
      await cacheService.createCache(cacheData);

      expect(cacheService['cache'][cacheData.key]).toBeDefined();
      expect(cacheService['cache'][cacheData.key].value).toBe(cacheData.value);
      expect(db.create).toHaveBeenCalledWith(cacheData.key, cacheData.value, cacheData.ttl);
    });
  });

  describe('setExpireIn', () => {
    it('should set a new TTL for an existing cache entry', async () => {
      const key = 'existingKey';
      const cacheValue = { value: 'testValue', ttl: 60000, lastUpdatedAt: Date.now() };
      cacheService['cache'][key] = cacheValue;
      const newTTL = 120000;

      await cacheService.setExpireIn(key, newTTL);

      expect(cacheService['cache'][key].ttl).toBe(newTTL);
      expect(db.setExpire).toHaveBeenCalledWith(key, newTTL);
    });

    it('should throw HttpException if cache does not exist', async () => {
      const key = 'nonExistingKey';
      const newTTL = 120000;

      await expect(cacheService.setExpireIn(key, newTTL)).rejects.toThrow(HttpException);
      await expect(cacheService.setExpireIn(key, newTTL)).rejects.toThrow("Cache doesn't exist");
    });

    it('should throw HttpException if cache is expired', async () => {
      const key = 'expiredKey';
      const cacheValue = { value: 'testValue', ttl: 1000, lastUpdatedAt: Date.now() - 2000 };
      cacheService['cache'][key] = cacheValue;
      const newTTL = 120000;

      await expect(cacheService.setExpireIn(key, newTTL)).rejects.toThrow(HttpException);
      await expect(cacheService.setExpireIn(key, newTTL)).rejects.toThrow("Cache doesn't exist");
    });
  });

  describe('deleteCache', () => {
    it('should delete an existing cache entry', async () => {
      const key = 'existingKey';
      const cacheValue = { value: 'testValue', ttl: 60000, lastUpdatedAt: Date.now() };
      cacheService['cache'][key] = cacheValue;

      await cacheService.deleteCache(key);

      expect(cacheService['cache'][key]).toBeUndefined();
      expect(db.delete).toHaveBeenCalledWith(key);
    });
  });

  describe('getTtl', () => {
    it('should return the TTL of an existing cache entry', async () => {
      const key = 'existingKey';
      const cacheValue = { value: 'testValue', ttl: 60000, lastUpdatedAt: Date.now() };
      cacheService['cache'][key] = cacheValue;

      const ttl = await cacheService.getTtl(key);
      expect(ttl).toBe(cacheValue.ttl);
    });

    it('should throw HttpException if cache does not exist', async () => {
      const key = 'nonExistingKey';

      await expect(cacheService.getTtl(key)).rejects.toThrow(HttpException);
      await expect(cacheService.getTtl(key)).rejects.toThrow("Cache doesn't exist");
    });
  });
});
