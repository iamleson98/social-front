import { DataSource } from 'typeorm';
import { entities } from './entities';
import {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
} from '$env/static/private';

class DataBaseManager {
  private source: DataSource | undefined;
  private sourceConfig = new DataSource({
    type: 'postgres',
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: Number(DB_PORT),
    entities: entities,
    connectTimeoutMS: 60000,
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

