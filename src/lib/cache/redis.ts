import { REDIS_HOST, REDIS_PORT } from '$env/static/private';
import { Redis } from 'ioredis';

const redis = new Redis(Number(REDIS_PORT), REDIS_HOST, {});

/**
 * @param key 
 * @param value 
 * @param ttl - in seconds
 */
export const setKeyValueWithExpiration = (key: string, value: string, ttl: number) => {
  redis.set(key, value, 'EX', ttl);
};


