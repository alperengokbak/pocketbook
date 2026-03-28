import { IsNumber, Min, Max } from 'class-validator';

export class ReviewVocabularyDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  quality!: number;
}
