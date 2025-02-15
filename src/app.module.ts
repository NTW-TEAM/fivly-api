import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/user.entity';
import { DoesMailExist } from './user/validator/email.validator';
import { AuthModule } from './auth/auth.module';
import { ScopeModule } from './scope/scope.module';
import { Scope } from './scope/scope.entity';
import { ScopesGuard } from './authorization/scope.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/role.entity';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { MembershipModule } from './membership/membership.module';
import { Membership } from './membership/membership.entity';
import { DataSource } from 'typeorm';
import { runSeeder } from 'typeorm-extension';
import { ActivityModule } from './activity/activity.module';
import SetupSeeder from '../seeders/setup.seed';
import { ActivityType } from './activitytypes/activitytype.entity';
import { Activity } from './activity/activity.entity';
import { ActivityTypesModule } from './activitytypes/activitytypes.module';
import { LocalsModule } from './locals/locals.module';
import { Local } from './locals/local.entity';
import { AssemblyModule } from './assembly/assembly.module';
import { Assembly } from './assembly/assembly.entity';
import { VoteSession } from './assembly/votesession.entity';
import { Vote } from './assembly/vote.entity';
import { MaterialModule } from './material/material.module';
import { MaterialModel } from './material/materialmodel.entity';
import { Material } from './material/material.entity';
import { GedModule } from './ged/ged.module';
import { Permission } from './ged/permission.entity';
import { File } from './ged/file.entity';
import { Folder } from './ged/folder.entity';
import { AssociationModule } from './association/association.module';
import { Association } from './association/association.entity';
import { StripeModule } from './stripe/stripe.module';
import { Donation } from './stripe/donation.entity';
import { Give } from './stripe/give.entity';
import { Crowdfunding } from './stripe/crowdfunding.entity';

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
        timezone: 'Z',
        host: config.get('MYSQL_HOST'),
        port: 3306, // Le "+" convertit le port en nombre
        username: config.get('MYSQL_USER'),
        password: config.get('MYSQL_PASSWORD'),
        database: config.get('MYSQL_DATABASE'),
        entities: [
          Association,
          User,
          Scope,
          Role,
          Membership,
          ActivityType,
          Activity,
          Local,
          Assembly,
          VoteSession,
          Vote,
          Material,
          MaterialModel,
          Donation,
          Give,
          Crowdfunding,
          Permission,
          File,
          Folder,
        ],
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
    ActivityTypesModule,
    ActivityModule,
    LocalsModule,
    AssemblyModule,
    MaterialModule,
    GedModule,
    AssociationModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DoesMailExist,
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: APP_GUARD,
      useClass: ScopesGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async onModuleInit() {
    await runSeeder(this.dataSource, SetupSeeder);
  }
}
