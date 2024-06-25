import { IsNotEmpty, IsString } from "class-validator";

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
  @IsString()
  @IsNotEmpty()
  stripeWebhookSecret:string;
}