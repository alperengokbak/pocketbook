import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  @IsOptional()
  currentPosition?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  currentPage?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalPages?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;
}
