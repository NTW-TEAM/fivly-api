import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Validate } from "class-validator";
import { DoesRoleNameExist } from "../validator/rolename.validator";

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Role name' })
  @IsNotEmpty({ message: 'Role name is required.' })
  @IsString({ message: 'Role name must be a string.' })
  @Validate(DoesRoleNameExist)
  name: string;
  @ApiProperty({ example: 'This is the role that manage everything.', description: 'Role description' })
  @IsNotEmpty({ message: 'Role description is required.' })
  @IsString({ message: 'Role description must be a string.' })
  description: string;
  @ApiProperty({ example: ['scope1', 'scope2'], description: 'Scopes' })
  @IsNotEmpty({ message: 'Scopes are required.' })
  @IsString({ each: true, message: 'Scopes must be strings.' })
  scopes: string[];
}