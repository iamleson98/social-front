import TTLCache from '@isaacs/ttlcache';


export const Cache = new TTLCache({ max: 10000, ttl: 300000 });
