import TTLCache from '@isaacs/ttlcache';
import { decode, encode } from '@msgpack/msgpack';
import { inflateSync, deflateSync } from 'fflate';

export const Cache = new TTLCache({ max: 10000, ttl: 300000 });

export const writeCache = async (key: string, obj: object) => {
  const mspEncodeData = encode(obj);
  const compressData = deflateSync(mspEncodeData);

  return Cache.set(key, compressData);
};

export const readCache = async <T>(key: string) => {
  const cacheData: Uint8Array<ArrayBufferLike> | undefined = Cache.get(key);
  if (!cacheData) return null;

  const uncompressData = inflateSync(cacheData);
  return decode(uncompressData) as T;
};
