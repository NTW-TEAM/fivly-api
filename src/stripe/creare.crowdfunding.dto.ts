import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCrowdfundingDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({maxDecimalPlaces: 2})
  @IsNotEmpty()
  goalAmount: number;

  @IsDateString()
  @IsNotEmpty()
  beginDatetime: Date;

  @IsDateString()
  @IsNotEmpty()
  endDatetime: Date;

  @IsNumber()
  @IsNotEmpty()
  creator: number;

}
