import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

enum QuizType {
  FLASHCARD = 'FLASHCARD',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_BLANK = 'FILL_BLANK',
}

class QuizAnswer {
  @IsString()
  vocabularyId!: string;

  @IsString()
  answer!: string;

  @IsBoolean()
  correct!: boolean;
}

export class SubmitQuizDto {
  @IsEnum(QuizType)
  quizType!: QuizType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswer)
  answers!: QuizAnswer[];
}
