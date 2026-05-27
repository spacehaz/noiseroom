import { IsOptional, IsInt, IsDateString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMessagesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 50;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsDateString()
  since?: string;
}
