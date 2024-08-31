import { DataSource } from 'typeorm';
// import { config } from 'dotenv';
// import { dev } from '$app/environment';
import { entities } from './entities';

// config({
//   path: dev ? '.env.local' : '.env',
// });

class DataBaseManager {
  private source: DataSource | undefined;
  private sourceConfig = new DataSource({
    type: 'postgres',
    database: import.meta.env.VITE_DB_NAME,
    username: import.meta.env.VITE_DB_USER,
    password: import.meta.env.VITE_DB_PASSWORD,
    host: import.meta.env.VITE_DB_HOST,
    port: Number(import.meta.env.VITE_DB_PORT),
    entities: entities,
  });

  async initSource() {
    this.source = await this.sourceConfig.initialize();
  }

  async getDatabaseConnection(): Promise<DataSource> {
    if (!this.source) {
      await this.initSource();
    }

    return this.source as DataSource;
  }
}

export const dbManager = new DataBaseManager();

