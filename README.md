<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Nest.js. A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


# FIVLY-API
## Description

Ce projet comprend l'API complète pour gérer votre association loi 1901. 
Il est basé sur le framework NestJS et utilise une base de données PostgreSQL, un Object Storage S3 Minio, et comprend un PHPMyAdmin en cas de besoin.

## Installation

### Ajouter un fichier .env à la racine du projet
```dotenv
MYSQL_ROOT_PASSWORD=mysql_root_password # Mot de passe root de la base de données
MYSQL_DATABASE=mysql_database # Nom de la base de données
MYSQL_USER=mysql_user # Nom d'utilisateur de la base de données
MYSQL_PASSWORD=mysql_password # Mot de passe de l'utilisateur de la base de données
MYSQL_PORT=3306 # Port de la base de données
PMA_PORT=8047 # Port de PHPMyAdmin
API_PORT=3000 # Port de l'API
JWT_SECRET=jwt_secret # Clé secrète pour les tokens JWT
SYNCHRONIZED_DATABASE=true # Synchroniser la base de données à chaque démarrage
LOGGING_DATABASE=true # Afficher les logs de la base de données
MINIO_ROOT_USER=root # Nom de l'utilisateur root de Minio
MINIO_ROOT_PASSWORD=password # Mot de passe de l'utilisateur root de Minio
MINIO_BUCKET_NAME=fivly # Nom du bucket interne Minio
MINIO_FIRST_PORT=9000 # Port de Minio pour l'interface web
MINIO_SECOND_PORT=9001 # Port de Minio pour l'API
MINIO_ENDPOINT=fivly-minio # Nom du service Minio

# Scripts d'initialisation de la base de données
SQL_INSERT_ROLE_MEMBER="INSERT INTO role (name, description) VALUES ('member', 'Utilisateur par défaut');"
SQL_INSERT_ROLE_ADMIN="INSERT INTO role (name, description) VALUES ('admin', 'Administrateur');"
SQL_INSERT_SCOPE_SUPER_ADMIN="INSERT INTO scope (name, description) VALUES ('super:admin', 'Donne tous les droits');"
SQL_INSERT_SCOPE_USER_MANAGE="INSERT INTO scope (name, description) VALUES ('user:manage', 'Gérer les utilisateurs');"
SQL_INSERT_SCOPE_ROLES_MANAGE="INSERT INTO scope (name, description) VALUES ('roles:manage', 'Gérer les rôles');"
SQL_INSERT_SCOPE_LOCALS_MANAGE="INSERT INTO scope (name, description) VALUES ('locals:manage', 'Gérer les locaux');"
SQL_INSERT_SCOPE_ASSEMBLIES_MANAGE="INSERT INTO scope (name, description) VALUES ('assemblies:manage', 'Gérer les assemblées');"
SQL_INSERT_ROLE_SCOPES="INSERT INTO role_scopes_scope VALUES ('admin', 'super:admin');"
```

### Lancer le projet avec Docker Compose

```bash
$ docker compose up --env-file .env -d
```

Et voilà, tout est prêt, lancez maintenant votre website pour initialiser le projet.


