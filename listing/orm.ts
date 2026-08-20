import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbdatasource: DataSourceOptions = {
  type: 'postgres',
  port: Number(process.env.DATABASE_PORT),
  database: process.env.NODE_ENV,
  username: process.env.NODE_ENV,
  password: process.env.NODE_ENV,
  host: process.env.NODE_ENV,
  logger: 'file',
  maxQueryExecutionTime: 1000, //will log slow queries
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/migrations/*{.ts,.js}'],
  subscribers: [],
  logging: process.env.NODE_ENV !== 'prod',
};

const dataSource = new DataSource(dbdatasource);
export default dataSource;