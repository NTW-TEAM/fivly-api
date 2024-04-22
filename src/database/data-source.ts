import { DataSource } from 'typeorm';
import { User } from "../user/user.entity";
import { Scope } from "../scope/scope.entity";
import { Role } from "../roles/role.entity";
import { Membership } from "../membership/membership.entity";
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'), // Le "+" convertit le port en nombre
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [User, Scope, Role, Membership],
  synchronize: process.env.SYNCHRONIZED_DATABASE === 'true',
  logging: process.env.LOGGING_DATABASE === 'true',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });