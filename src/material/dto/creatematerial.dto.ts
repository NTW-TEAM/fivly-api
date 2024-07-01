import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMaterialDto {
  @IsNotEmpty()
  readonly materialModelId: string;
}
