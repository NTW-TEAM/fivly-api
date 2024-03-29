import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { DoesMailExist } from './validator/email.validator';
import { RolesModule } from "../roles/roles.module";

@Module({
  imports: [TypeOrmModule.forFeature([User])
  ,RolesModule],
  providers: [UserService, DoesMailExist],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
