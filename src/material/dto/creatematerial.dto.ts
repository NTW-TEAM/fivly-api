import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMaterialDto {
  @IsUUID()
  @IsNotEmpty()
  readonly serialNumber: string;

  @IsUUID()
  @IsNotEmpty()
  readonly materialModelId: string;
}
