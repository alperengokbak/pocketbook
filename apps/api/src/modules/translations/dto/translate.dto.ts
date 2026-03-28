import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class TranslateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  word!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  context?: string;

  @IsString()
  @IsOptional()
  sourceLang?: string;

  @IsString()
  @IsOptional()
  targetLang?: string;
}
