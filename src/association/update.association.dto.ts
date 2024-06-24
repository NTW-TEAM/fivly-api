import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class UpdateAssociationDto {
  @IsString()
  name?:string;
  @IsString()
  domainName?:string;
  @IsString()
  stripeKey?:string;
}