import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbdatasource: DataSourceOptions = {
  type: 'postgres',
  port: process.env.NODE_ENV === 'prod' ? Number(process.env.DATABASE_PORT) : 5432,
  database: process.env.NODE_ENV === 'prod' ? process.env.DATABASE : "vinted_db",
  username: process.env.NODE_ENV === 'prod' ? process.env.DB_USER_NAME : "webdevuser",
  password: process.env.NODE_ENV === 'prod' ? process.env.DB_USER_PASSWORD : "qRaCp4l4c",
  host: process.env.NODE_ENV === 'prod' ? process.env.DATABASE_IP : "10.5.0.10",
  logger: 'file',
  maxQueryExecutionTime: 1000, //will log slow queries
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/migrations/*{.ts,.js}'],
  subscribers: [],
  logging: process.env.NODE_ENV !== 'prod',
};

const dataSource = new DataSource(dbdatasource);
export default dataSource;