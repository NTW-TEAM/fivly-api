import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class SearchActivityDTO {

  @ApiProperty(
    {
      example: new Date(),
      description: 'The begin date from',
      required: false,
    }
  )
  @IsOptional()
  beginDateFrom: Date;

  @ApiProperty(
    {
      example: new Date(),
      description: 'The begin date to',
      required: false,
    }
  )
  @IsOptional()
  beginDateTo: Date;

  @ApiProperty(
    {
      example: new Date(),
      description: 'The end date from',
      required: false,
    }
  )
  @IsOptional()
  endDateFrom: Date;

  @ApiProperty(
    {
      example: new Date(),
      description: 'The end date to',
      required: false,
    }
  )
  @IsOptional()
  endDateTo: Date;

  @ApiProperty(
    {
      example: 'activityType',
      description: 'The type of the activity',
      required: false,
    }
  )
  @IsString({ message: "Activity type must be a string." })
  @IsOptional()
  activityType: string;

  @ApiProperty(
    {
      example: 1,
      description: 'The owner of the activity',
      required: false,
    }
  )
  @IsNumber({}, { message: "Owner must be a number." })
  @IsOptional()
  owner: number;

  @ApiProperty(
    {
      example: 1,
      description: 'The participant of the activity',
      required: false,
    }
  )
  @IsNumber({}, { message: "Participant must be a number." })
  @IsOptional()
  participant: number;

}