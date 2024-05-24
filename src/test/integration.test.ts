import 'reflect-metadata';
import { App } from '@/app';
import { CacheRoute } from '@routes/cache.route';
import { db } from '@repository/db';
import { CacheService } from '@services/cache.service';
import { Container } from 'typedi';
import request from 'supertest';

describe('CacheService Integration Tests', () => {
  const route = new CacheRoute();
  const app = new App([route]);

  beforeAll(async () => {
    // Register the service with typedi container
    Container.set(CacheService, new CacheService());
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
  });

  afterAll(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
  });

  describe('[GET] /cache/:key', () => {
    it('response statusCode 200 /findOne', async () => {
      const key = 'testKey';
      const cacheData = {
        key,
        value: 'testValue',
        ttl: 60000,
      };

      // Insert cache data for testing
      await request(app.getServer()).post(`${route.path}`).send(cacheData).expect(201);

      return request(app.getServer())
        .get(`${route.path}/${key}`)
        .expect(200)
        .then(response => {
          expect(response.body.data).toEqual(cacheData.value);
          expect(response.body.message).toBe('cache retrieved');
        });
    });

    it('response statusCode 404 /findOne', () => {
      const key = 'nonExistentKey';

      return request(app.getServer()).get(`${route.path}/${key}`).expect(404);
    });
  });

  describe('[POST] /cache', () => {
    it('response statusCode 201 /created', () => {
      const cacheData = {
        key: 'newKey',
        value: 'newValue',
        ttl: 60000,
      };

      return request(app.getServer())
        .post(`${route.path}`)
        .send(cacheData)
        .expect(201)
        .then(response => {
          expect(response.body.message).toBe('created');
        });
    });

    it('response statusCode 400 /created', () => {
      const invalidCacheData = {
        key: 'invalidKey',
        // missing value and ttl
      };

      return request(app.getServer()).post(`${route.path}`).send(invalidCacheData).expect(400);
    });
  });

  describe('[GET] /cache/:key/ttl', () => {
    it('response statusCode 200 /get ttl', async () => {
      const key = 'testTtlKey';
      const cacheData = {
        key,
        value: 'testValue',
        ttl: 60000,
      };

      // Insert cache data for testing
      await request(app.getServer()).post(`${route.path}`).send(cacheData).expect(201);

      return request(app.getServer())
        .get(`${route.path}/${key}/ttl`)
        .expect(200)
        .then(response => {
          expect(response.body.data).toBe(cacheData.ttl);
          expect(response.body.message).toBe('get ttl');
        });
    });

    it('response statusCode 404 /get ttl', () => {
      const key = 'nonExistentKey';

      return request(app.getServer()).get(`${route.path}/${key}/ttl`).expect(404);
    });
  });

  describe('[DELETE] /cache/:key', () => {
    it('response statusCode 200 /deleted', async () => {
      const key = 'deleteKey';
      const cacheData = {
        key,
        value: 'deleteValue',
        ttl: 60000,
        lastUpdatedAt: Date.now(),
      };

      // Insert cache data for testing
      await db.create(cacheData.key, cacheData.value, cacheData.lastUpdatedAt, cacheData.ttl);

      return request(app.getServer())
        .delete(`${route.path}/${key}`)
        .expect(200)
        .then(response => {
          expect(response.body.message).toBe('deleted');
        });
    });

    it('response statusCode 200 /deleted', () => {
      const key = 'nonExistentKey';

      return request(app.getServer()).delete(`${route.path}/${key}`).expect(200);
    });
  });

  describe('[PATCH] /cache/:key/expire', () => {
    it('response statusCode 200 /updated', async () => {
      const key = 'expireKey';
      const cacheData = {
        key,
        value: 'expireValue',
        ttl: 60000,
      };

      // Insert cache data for testing
      await request(app.getServer()).post(`${route.path}`).send(cacheData).expect(201);

      return request(app.getServer())
        .patch(`${route.path}/${key}/expire`)
        .send({ ttl: 120000 })
        .expect(200)
        .then(response => {
          expect(response.body.message).toBe('updated');
        });
    });

    it('response statusCode 404 /updated', () => {
      const key = 'nonExistentKey';

      return request(app.getServer()).patch(`${route.path}/${key}/expire`).send({ ttl: 120000 }).expect(404);
    });
  });
});
