import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLocalDTO {
  @ApiPropertyOptional({
    example: 'Local name',
    description: 'The name of the local',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string.' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Local number and street',
    description: 'The number and street of the local',
  })
  @IsOptional()
  @IsString({ message: 'Number and street must be a string.' })
  numberAndStreet?: string;

  @ApiPropertyOptional({
    example: 'Local postal code',
    description: 'The postal code of the local',
  })
  @IsOptional()
  @IsString({ message: 'Postal code must be a string.' })
  postalCode?: string;

  @ApiPropertyOptional({
    example: 'Local city',
    description: 'The city of the local',
  })
  @IsOptional()
  @IsString({ message: 'City must be a string.' })
  city?: string;

  @ApiPropertyOptional({
    example: 'Local country',
    description: 'The country of the local',
  })
  @IsOptional()
  @IsString({ message: 'Country must be a string.' })
  country?: string;
}
