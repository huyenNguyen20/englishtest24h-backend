import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbconfig = config.get('db');
export const TypeORMConfig: TypeOrmModuleOptions = {
  type: dbconfig.get('type'),
  host: dbconfig.get('host'),
  port: dbconfig.get('port'),
  username: dbconfig.get('username'),
  password: dbconfig.get('password'),
  database: dbconfig.get('database'),
  autoLoadEntities: true,
  synchronize: process.env.SYNCHRONIZE || dbconfig.get('synchronize'),
};
