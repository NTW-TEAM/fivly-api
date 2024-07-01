import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateVoteSessionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  description: string;

  @IsDateString()
  beginDateTime: Date;

  @IsInt()
  @Min(1)
  voteTimeInMinutes: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsBoolean()
  anonymous: boolean;
}
