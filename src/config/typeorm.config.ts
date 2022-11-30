import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';
const dbconfig = config.get('db');

require('dotenv').config();
export const TypeORMConfig: TypeOrmModuleOptions = {
  type: dbconfig.get('type'),
  host: process.env.DATABASE_HOST,
  port: dbconfig.get('port'),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
  synchronize: dbconfig.get('synchronize'),
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  cli: {
    migrationsDir: 'src/db/migrations'
  }
};
