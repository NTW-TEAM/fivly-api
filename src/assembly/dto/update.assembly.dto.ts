import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateAssemblyDto {
  @IsBoolean()
  @IsOptional()
  isGeneral?: boolean;

  @IsBoolean()
  @IsOptional()
  hasStarted?: boolean;

  @IsDateString()
  @IsOptional()
  datetime?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  quorum?: number;

  @IsString()
  @IsOptional()
  location?: string;
}
