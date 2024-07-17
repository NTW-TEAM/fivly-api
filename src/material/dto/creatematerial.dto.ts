import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMaterialDto {
  @IsUUID()
  @IsNotEmpty()
  readonly serialNumber: string;

  @IsNotEmpty()
  readonly materialModelId: string;
}
