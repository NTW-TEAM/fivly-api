import { IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DoesActivityTypeExist } from '../validator/activitytype.validator';

export class CreateActivityDTO {
  @ApiProperty({
    example: 'Activity title',
    description: 'The title of the activity',
    required: true,
  })
  @IsNotEmpty({ message: 'Title is required.' })
  @IsString({ message: 'Title must be a string.' })
  title: string;

  @ApiProperty({
    example: 'Activity description',
    description: 'The description of the activity',
    required: true,
  })
  @IsNotEmpty({ message: 'Description is required.' })
  @IsString({ message: 'Description must be a string.' })
  description: string;

  @ApiProperty({
    example: new Date(),
    description: 'The begin date time',
    required: true,
  })
  beginDateTime: Date;

  @ApiProperty({
    example: new Date(),
    description: 'The end date time',
    required: true,
  })
  endDateTime: Date;

  @ApiProperty({
    example: 'activityType',
    description: 'The type of the activity',
    required: true,
  })
  @IsString({ message: 'Activity type must be a string.' })
  @Validate(DoesActivityTypeExist)
  activityType: string;

  @ApiProperty({
    example: 1,
    description: 'The owner of the activity',
    required: true,
  })
  @IsNumber({}, { message: 'Owner must be a number.' })
  owner: number;
}
