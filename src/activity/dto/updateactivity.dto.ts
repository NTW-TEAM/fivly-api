import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { DoesActivityTypeExist } from '../validator/activitytype.validator';

export class UpdateActivityDTO {
  @ApiPropertyOptional({
    example: 'Activity title',
    description: 'The title of the activity',
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string.' })
  title?: string;

  @ApiPropertyOptional({
    example: 'Activity description',
    description: 'The description of the activity',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  description?: string;

  @ApiPropertyOptional({
    example: new Date(),
    description: 'The begin date time',
  })
  @IsOptional()
  beginDateTime?: Date;

  @ApiPropertyOptional({
    example: new Date(),
    description: 'The end date time',
  })
  @IsOptional()
  endDateTime?: Date;

  @ApiPropertyOptional({
    example: 'activityType',
    description: 'The type of the activity',
  })
  @IsOptional()
  @IsString({ message: 'Activity type must be a string.' })
  @Validate(DoesActivityTypeExist)
  activityType?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'The owner of the activity',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Owner must be a number.' })
  owner?: number;
}
