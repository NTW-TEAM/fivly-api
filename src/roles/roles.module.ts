import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { DoesRoleNameExist } from './validator/rolename.validator';
import { Scope } from '../scope/scope.entity';
import { ScopeModule } from '../scope/scope.module';
import { Permission } from '../ged/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    TypeOrmModule.forFeature([Scope]),
    TypeOrmModule.forFeature([Permission]),
    ScopeModule,
  ],
  providers: [RolesService, DoesRoleNameExist],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
