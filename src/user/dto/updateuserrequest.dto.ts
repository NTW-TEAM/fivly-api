import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length, Validate } from "class-validator";
import { DoesMailExist } from "../validator/email.validator";

/**
 * All properties are optional because we don't want to force the user to update all properties.
 * Properties that we want to be possible to change :
 * - firstName
 * - lastName
 * - email
 * - password
 * - phoneNumber
 * - numberAndStreet
 * - postalCode
 * - city
 * - country
 */
export class UpdateUserRequest {

  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @IsString({ message: 'First name must be a string.' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'DOE', description: 'The last name of the user' })
  @IsString({ message: 'Last name must be a string.' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: 'email@email.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsOptional()
  @Validate(DoesMailExist)
  email?: string;

  @ApiProperty({
    example: 'qfcqfz6f2q46Dzv15',
    description: 'The password (clear) of the user',
  })
  @Length(8, 32, {
    message: 'Password must be between 8 and 32 characters long.',
  })
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: '0782809628',
    description: 'The phone number of the user',
    required: false,
  })
  @IsString({ message: 'Phone number must be a string.' })
  @Length(10, 10, { message: 'Phone number must be 10 characters long.' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    example: '1 rue de la paix',
    description: 'The number and the street of the user',
  })
  @IsString({ message: 'Number and street must be a string.' })
  @IsOptional()
  numberAndStreet?: string;

  @ApiProperty({ example: '75016', description: 'The postal code of the user' })
  @IsString({ message: 'Postal code must be a string.' })
  @Length(5, 5, { message: 'Postal code must be 5 characters long.' })
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ example: 'Paris', description: 'The city of the user' })
  @IsString({ message: 'City must be a string.' })
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'France', description: 'The country of the user' })
  @IsString({ message: 'Country must be a string.' })
  @IsOptional()
  country?: string;

}