interface CacheObject extends CacheValue {
  key: string;
}

interface CacheValue {
  value: string;
  ttl: number;
  lastUpdatedAt: number;
}
