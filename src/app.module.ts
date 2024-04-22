import { Module, OnModuleInit } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { InjectConnection, InjectDataSource, TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/user.entity';
import { DoesMailExist } from "./user/validator/email.validator";
import { AuthModule } from './auth/auth.module';
import { ScopeModule } from './scope/scope.module';
import { Scope } from "./scope/scope.entity";
import { ScopesGuard } from "./authorization/scope.guard";
import { APP_GUARD } from "@nestjs/core";
import { RolesModule } from './roles/roles.module';
import { Role } from "./roles/role.entity";
import { AuthGuard } from "./auth/auth.guard";
import { JwtModule } from "@nestjs/jwt";
import { MembershipModule } from './membership/membership.module';
import { Membership } from "./membership/membership.entity";
import { DataSource } from "typeorm";
import { runSeeder } from "typeorm-extension";
import SetupSeeder from "../seeders/setup.seed";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2d' },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Rend le module disponible globalement
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('MYSQL_HOST'),
        port: +config.get('MYSQL_PORT'), // Le "+" convertit le port en nombre
        username: config.get('MYSQL_USER'),
        password: config.get('MYSQL_PASSWORD'),
        database: config.get('MYSQL_DATABASE'),
        entities: [User, Scope, Role, Membership],
        synchronize: config.get('SYNCHRONIZED_DATABASE'),
        logging: config.get('LOGGING_DATABASE'),
        seeds: ['seeders/*.seed.ts'],
      }),
    }),
    UserModule,
    AuthModule,
    ScopeModule,
    RolesModule,
    MembershipModule,
  ],
  controllers: [AppController],
  providers: [AppService, DoesMailExist,
    {provide: APP_GUARD,useClass:AuthGuard}
    ,{
    provide: APP_GUARD,
    useClass: ScopesGuard,
  }],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async onModuleInit() {
    await runSeeder(this.dataSource, SetupSeeder);
  }

}