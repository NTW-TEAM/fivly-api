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

    await dataSource.query(
      "INSERT INTO role (name, description) VALUES ('member', 'Utilisateur par défaut');",
    );
    await dataSource.query(
      "INSERT INTO role (name, description) VALUES ('admin', 'Administrateur');",
    );

    await dataSource.query(
      "INSERT INTO scope (name, description) VALUES ('super:admin', 'Donne tous les droits');",
    );
    await dataSource.query(
      "INSERT INTO scope (name, description) VALUES ('user:manage', 'Gérer les utilisateurs');",
    );
    await dataSource.query(
      "INSERT INTO scope (name, description) VALUES ('roles:manage', 'Gérer les rôles');",
    );
    await dataSource.query(
      "INSERT INTO scope (name, description) VALUES ('locals:manage', 'Gérer les locaux');",
    );
    await dataSource.query(
      "INSERT INTO scope (name, description) VALUES ('assemblies:manage', 'Gérer les assemblées');",
    );

    await dataSource.query(
      "INSERT INTO role_scopes_scope VALUES ('admin', 'super:admin');",
    );
  }
}
