import { IsNotEmpty, IsInt } from 'class-validator';

export class AssignMaterialDto {
  @IsInt()
  @IsNotEmpty()
  readonly activityId: number;
}
