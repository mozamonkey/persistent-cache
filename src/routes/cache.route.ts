import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { CacheController } from '@controllers/cache.controller';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { CreateCacheDto, UpdateExpireDto } from '@dtos/cache.dto';

export class CacheRoute implements Routes {
  public path = '/cache';
  public router = Router();
  public cache = new CacheController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:key`, this.cache.get);
    this.router.post(`${this.path}`, ValidationMiddleware(CreateCacheDto), this.cache.set);
    this.router.get(`${this.path}/:key/ttl`, this.cache.ttl);
    this.router.delete(`${this.path}/:key`, this.cache.delete);
    this.router.patch(`${this.path}/:key/expire`, ValidationMiddleware(UpdateExpireDto), this.cache.expire);
  }
}
