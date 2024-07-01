import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

export default class SetupSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const count = await dataSource.query(`SELECT COUNT(*) FROM role`);
    if (count[0]['COUNT(*)'] != 0) return;
    await dataSource.query(
      "INSERT INTO folder (id, name, path) VALUES (1, '','/')",
    );

    await dataSource.query(getRequiredEnvVar('SQL_INSERT_ROLE_MEMBER'));
    await dataSource.query(getRequiredEnvVar('SQL_INSERT_ROLE_ADMIN'));

    await dataSource.query(getRequiredEnvVar('SQL_INSERT_SCOPE_SUPER_ADMIN'));
    await dataSource.query(getRequiredEnvVar('SQL_INSERT_SCOPE_USER_MANAGE'));
    await dataSource.query(getRequiredEnvVar('SQL_INSERT_SCOPE_ROLES_MANAGE'));
    await dataSource.query(getRequiredEnvVar('SQL_INSERT_SCOPE_LOCALS_MANAGE'));
    await dataSource.query(
      getRequiredEnvVar('SQL_INSERT_SCOPE_ASSEMBLIES_MANAGE'),
    );

    await dataSource.query(getRequiredEnvVar('SQL_INSERT_ROLE_SCOPES'));

    await dataSource.query(getRequiredEnvVar('SQL_INSERT_USER_1'));
    await dataSource.query(getRequiredEnvVar('SQL_INSERT_USER_2'));
    await dataSource.query(getRequiredEnvVar('SQL_INSERT_USER_3'));
    await dataSource.query(getRequiredEnvVar('SQL_INSERT_USER_4'));

    await dataSource.query(getRequiredEnvVar('SQL_INSERT_USER_ROLES_1'));
    await dataSource.query(getRequiredEnvVar('SQL_INSERT_USER_ROLES_2'));
    await dataSource.query(getRequiredEnvVar('SQL_INSERT_USER_ROLES_3'));
    await dataSource.query(getRequiredEnvVar('SQL_INSERT_USER_ROLES_4'));
  }
}
