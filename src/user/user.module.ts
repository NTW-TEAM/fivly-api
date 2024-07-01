import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { DoesMailExist } from './validator/email.validator';
import { RolesModule } from '../roles/roles.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScopeModule } from '../scope/scope.module';
import { Membership } from '../membership/membership.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Membership]),
    RolesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2d' },
      }),
    }),
    ScopeModule,
  ],
  providers: [UserService, DoesMailExist],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
