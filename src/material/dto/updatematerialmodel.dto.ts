import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateMaterialModelDto {
  @IsString()
  @IsNotEmpty()
  readonly model: string;

  @IsUrl()
  @IsNotEmpty()
  readonly image: string;
}
