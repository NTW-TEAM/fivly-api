import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example: 'john.doe@mystery.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
  @ApiProperty({
    example: 'qfcqfz6f2q46Dzv15',
    description: 'The password (clear) of the user',
  })
  @IsNotEmpty({ message: 'Password is required.' })
  @Length(8, 32, {
    message: 'Password must be between 8 and 32 characters long.',
  })
  password: string;
}
