import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { CacheService } from '@services/cache.service';
import { CreateCacheDto } from '@dtos/cache.dto';
import { HttpException, HttpStatusCode } from '@exceptions/HttpException';
import { logger } from "@utils/logger";

/**
 * Cache controller class for handling cache-related HTTP requests.
 */
export class CacheController {
  public cache = Container.get(CacheService);

  /**
   * Handles the GET request to retrieve a cache entry by key.
   * @param req - The request object. `key` is extracted from params.
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.params.key;
      if (!key) {
        next(new HttpException(HttpStatusCode.NOT_FOUND, "Key doesn't exist"));
        return;
      }
      const findCacheData: CacheValue = await this.cache.findCacheByKey(key);
      res.status(200).json({ data: findCacheData.value, message: 'cache retrieved' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles the POST request to create a new cache entry.
   * @param req - The request object.
   *  - body
   *    - key: string
   *    - value: string
   *    - ttl: number in milliseconds (optional)
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  public set = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateCacheDto = req.body;
      const createCacheData: any = await this.cache.createCache(data as CacheObject);
      res.status(201).json({ data: createCacheData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles the DELETE request to delete a cache entry by key.
   * @param req - The request object. `key` is extracted from params.
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.params.key;
      if (!key) {
        next(new HttpException(HttpStatusCode.BAD_REQUEST, 'Invalid key'));
        return;
      }
      const deleteCacheData = await this.cache.deleteCache(key);
      res.status(200).json({ data: deleteCacheData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles the PATCH request to set the expiration time (TTL) for a cache entry.
   * @param req - The request object. `key` is extracted from params.
   *  - body
   *    - ttl: number in milliseconds
   * @param res - The response object.
   * @param next - The next middleware function.
   */
  public expire = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.params.key;
      if (!key) {
        next(new HttpException(HttpStatusCode.BAD_REQUEST, 'Invalid key'));
        return;
      }
      const ttl = req.body.ttl;
      const setExpireData = await this.cache.setExpireIn(key, ttl);
      res.status(200).json({ data: setExpireData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles the GET request to retrieve the TTL (time-to-live) for a cache entry.
   * @param req - The request object. `key` is extracted from params.
   * @param res - The response object.
   * @param next - The next error middleware function.
   */
  public ttl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.params.key;
      if (!key) {
        next(new HttpException(HttpStatusCode.BAD_REQUEST, 'Invalid key'));
        return;
      }
      const ttl = await this.cache.getTtl(key);
      res.status(200).json({ data: ttl, message: 'get ttl' });
    } catch (error) {
      next(error);
    }
  };
}
