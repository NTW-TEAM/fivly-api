import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateMaterialModelDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly model: string;

  @IsUrl()
  @IsNotEmpty()
  readonly image: string;
}
