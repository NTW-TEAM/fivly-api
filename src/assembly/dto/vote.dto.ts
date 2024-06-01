import { IsBoolean, IsInt } from 'class-validator';

export class VoteDto {
  @IsInt()
  userId: number;

  @IsBoolean()
  for: boolean;
}
