import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateAssemblyDto {
  @IsBoolean()
  isGeneral: boolean;

  @IsBoolean()
  hasStarted: boolean;

  @IsDateString()
  datetime: Date;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  quorum: number;

  @IsString()
  @IsNotEmpty()
  location: string;
}