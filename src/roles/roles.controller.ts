import { Body, Controller, Post } from "@nestjs/common";
import { CreateRoleDto } from "./dto/createrole.dto";
import { RolesService } from "./roles.service";
import { ApiResponse } from "@nestjs/swagger";
import { Scope, Scopes } from "../authorization/scope.decorator";

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created.',
  })
  @Scopes(Scope.ROLES_CREATE)
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.createRole(createRoleDto);
  }
}
