import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScopesDTO {
  @ApiProperty({
    example: ['user:read', 'user:write'],
    description: 'The scopes to update',
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  scopes: string[];
}
