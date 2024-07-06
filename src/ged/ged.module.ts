import { Module } from '@nestjs/common';
import { GedController } from './ged.controller';
import { GedService } from './ged.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './folder.entity';
import { Permission } from './permission.entity';
import { File } from './file.entity';
import { User } from '../user/user.entity';
import { Role } from '../roles/role.entity';
import { UserService } from '../user/user.service';
import { ManageAccessGuard } from './guard/ged.guard';
import { Membership } from '../membership/membership.entity';
import { RolesService } from '../roles/roles.service';
import { ScopeService } from '../scope/scope.service';
import { Scope } from '../scope/scope.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      File,
      Folder,
      User,
      Role,
      Membership,
      Scope,
    ]),
  ],
  controllers: [GedController],
  providers: [
    GedService,
    UserService,
    ManageAccessGuard,
    RolesService,
    ScopeService,
  ],
})
export class GedModule {}
