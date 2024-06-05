import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateMaterialDto {
  @IsUUID()
  @IsNotEmpty()
  readonly serialNumber: string;
}
