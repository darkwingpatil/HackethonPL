import { DataSource } from 'typeorm';
import config from './orm-config';

export const appDataSource = new DataSource(config);
