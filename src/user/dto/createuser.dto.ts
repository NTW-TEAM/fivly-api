import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @IsNotEmpty({ message: 'First name is required.' })
  @IsString({ message: 'First name must be a string.' })
  firstName: string;

  @ApiProperty({ example: 'DOE', description: 'The last name of the user' })
  @IsNotEmpty({ message: 'Last name is required.' })
  @IsString({ message: 'Last name must be a string.' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@mystery.com', description: 'The email of the user' })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @ApiProperty({ example: 'qfcqfz6f2q46Dzv15', description: 'The password (clear) of the user' })
  @IsNotEmpty({ message: 'Password is required.' })
  @Length(8, 32, {
    message: 'Password must be between 8 and 32 characters long.',
  })
  password: string;

  @ApiProperty({ example: '0782809628', description: 'The phone number of the user', required: false })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string.' })
  phoneNumber?: string;

  @ApiProperty({ example: '1 rue de la paix', description: 'The number and the street of the user'})
  @IsNotEmpty({ message: 'Number and street are required.' })
  @IsString({ message: 'Number and street must be a string.' })
  numberAndStreet: string;

  @ApiProperty({ example: '75016', description: 'The postal code of the user' })
  @IsNotEmpty({ message: 'Postal code is required.' })
  @IsString({ message: 'Postal code must be a string.' })
  postalCode: string;

  @ApiProperty({ example: 'Paris', description: 'The city of the user' })
  @IsNotEmpty({ message: 'City is required.' })
  @IsString({ message: 'City must be a string.' })
  city: string;

  @ApiProperty({ example: 'France', description: 'The country of the user' })
  @IsNotEmpty({ message: 'Country is required.' })
  @IsString({ message: 'Country must be a string.' })
  country: string;
}
