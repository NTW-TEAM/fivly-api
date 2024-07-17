import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateLocalDTO {

  @ApiProperty(
    {
      example: 'Local name',
      description: 'The name of the local',
      required: true,
    }
  )
  @IsNotEmpty({ message: "Name is required." })
  @IsString({ message: "Name must be a string." })
  name: string;

  @ApiProperty(
    {
      example: 'Local number and street',
      description: 'The number and street of the local',
      required: true,
    }
  )
  @IsNotEmpty({ message: "Number and street is required." })
  @IsString({ message: "Number and street must be a string." })
  numberAndStreet: string;

  @ApiProperty(
    {
      example: 'Local postal code',
      description: 'The postal code of the local',
      required: true,
    }
  )
  @IsNotEmpty({ message: "Postal code is required." })
  @IsString({ message: "Postal code must be a string." })
  postalCode: string;

  @ApiProperty(
    {
      example: 'Local city',
      description: 'The city of the local',
      required: true,
    }
  )
  @IsNotEmpty({ message: "City is required." })
  @IsString({ message: "City must be a string." })
  city: string;

  @ApiProperty(
    {
      example: 'Local country',
      description: 'The country of the local',
      required: true,
    }
  )
  @IsNotEmpty({ message: "Country is required." })
  @IsString({ message: "Country must be a string." })
  country: string;
}