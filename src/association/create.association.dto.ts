import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateAssociationDto {
  @IsString()
  @IsNotEmpty()
  name:string;
  @IsString()
  @IsNotEmpty()
  domainName:string;
  @IsString()
  @IsNotEmpty()
  stripeKey:string;
}