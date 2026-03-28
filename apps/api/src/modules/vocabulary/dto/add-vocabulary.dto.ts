import { IsString, IsUUID } from 'class-validator';

export class AddVocabularyDto {
  @IsString()
  @IsUUID()
  translationId!: string;
}
