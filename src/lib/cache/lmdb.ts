import { open } from 'lmdb'; // Use `require('lmdb')` if you're not using ES modules

const DB_NAME = "cacheDb";

export const Cache = open({
  path: `./${DB_NAME}`,       // Directory where the database will be stored
  compression: true,    // Optional: enables LZ4 compression
});
