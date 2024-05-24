import request from 'supertest';
import { App } from '@/app';
import { CacheRoute } from '@routes/cache.route';
import { CreateCacheDto } from '@dtos/cache.dto';
import { CacheService } from '@services/cache.service';
import { Container } from 'typedi';
import { HttpException, HttpStatusCode } from '@exceptions/HttpException';

jest.mock('@services/cache.service');

const mockCacheService = new CacheService();

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('TEST Cache API', () => {
  Container.set(CacheService, mockCacheService);
  const route = new CacheRoute();
  const app = new App([route]);

  describe('[GET] /cache/:key', () => {
    it('response statusCode 404 /findOne', () => {
      const key = 'nonExistentKey';

      mockCacheService.findCacheByKey = jest.fn().mockRejectedValue(new HttpException(HttpStatusCode.NOT_FOUND, 'Cache not found'));

      return request(app.getServer()).get(`${route.path}/${key}`).expect(404);
    });
  });

  describe('[POST] /cache', () => {
    it('response statusCode 201 /created', () => {
      const cacheData: CreateCacheDto = {
        key: 'newKey',
        value: 'newValue',
        ttl: 60000,
      };

      mockCacheService.createCache = jest.fn().mockResolvedValue(true);

      return request(app.getServer()).post(`${route.path}`).send(cacheData).expect(201);
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
      const ttl = 60000;

      mockCacheService.getTtl = jest.fn().mockResolvedValue(ttl);

      return request(app.getServer())
        .get(`${route.path}/${key}/ttl`)
        .expect(200)
        .then(response => {
          expect(response.body.data).toBe(ttl);
          expect(response.body.message).toBe('get ttl');
        });
    });

    it('response statusCode 404 /get ttl', () => {
      const key = 'nonExistentKey';

      mockCacheService.getTtl = jest.fn().mockRejectedValue(new HttpException(HttpStatusCode.NOT_FOUND, 'Cache not found'));

      return request(app.getServer()).get(`${route.path}/${key}/ttl`).expect(404);
    });
  });

  describe('[DELETE] /cache/:key', () => {
    it('response statusCode 200 /deleted', async () => {
      const key = 'deleteKey';

      mockCacheService.deleteCache = jest.fn().mockResolvedValue(true);

      return request(app.getServer())
        .delete(`${route.path}/${key}`)
        .expect(200)
        .then(response => {
          expect(response.body.message).toBe('deleted');
        });
    });

    it('response statusCode 400 /deleted', () => {
      const key = 'nonExistentKey';

      mockCacheService.deleteCache = jest.fn().mockRejectedValue(new HttpException(HttpStatusCode.NOT_FOUND, 'Invalid Key'));

      return request(app.getServer()).delete(`${route.path}/${key}`).expect(404);
    });
  });

  describe('[PATCH] /cache/:key/expire', () => {
    it('response statusCode 200 /updated', async () => {
      const key = 'expireKey';
      const ttl = 120000;

      mockCacheService.setExpireIn = jest.fn().mockResolvedValue(true);

      return request(app.getServer())
        .patch(`${route.path}/${key}/expire`)
        .send({ ttl })
        .expect(200)
        .then(response => {
          expect(response.body.message).toBe('updated');
        });
    });

    it('response statusCode 404 /updated', () => {
      const key = 'nonExistentKey';

      mockCacheService.setExpireIn = jest.fn().mockRejectedValue(new HttpException(HttpStatusCode.NOT_FOUND, 'Cache not found'));

      return request(app.getServer()).patch(`${route.path}/${key}/expire`).send({ ttl: 120000 }).expect(404);
    });
  });
});
