import { Module } from '@nestjs/common';
import { GedController } from './ged.controller';
import { GedService } from './ged.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Folder } from "./folder.entity";
import { Permission } from "./permission.entity";
import { File } from "./file.entity";
import { User } from "../user/user.entity";
import { Role } from "../roles/role.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Permission, File, Folder, User, Role])],
  controllers: [GedController],
  providers: [GedService]
})
export class GedModule {}
