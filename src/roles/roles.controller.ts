import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards
} from "@nestjs/common";
import { CreateRoleDto } from "./dto/createrole.dto";
import { RolesService } from "./roles.service";
import { ApiResponse } from "@nestjs/swagger";
import { Scope, Scopes } from "../authorization/scope.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { UpdateScopesDTO } from "../user/dto/update.scopes.dto";
import { Role } from "./role.entity";

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get all roles',
  })
  async getAllRoles() {
    return await this.rolesService.getAllRoles();
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created.',
  })
  @Scopes(Scope.ROLES_MANAGE)
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.createRole(createRoleDto);
  }

  @Delete(":name")
  @ApiResponse({
    status: 204,
    description: 'The role has been deleted.'
  })
  @Scopes(Scope.ROLES_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param("name") name: string) : Promise<void> {
    await this.rolesService.deleteRole(name);
  }

  @Put(":roleName/scopes")
  @ApiResponse({
    status: 200,
    description: 'The role scopes have been updated.'
  })
  @Scopes(Scope.ROLES_MANAGE)
  async updateRoleScopes(@Param("roleName") roleName: string, @Body() updateRoleScopesDto: UpdateScopesDTO): Promise<Role> {
    return await this.rolesService.updateRoleScopes(roleName, updateRoleScopesDto);
  }



}
