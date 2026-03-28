import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuizType } from '@prisma/client';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async generate(userId: string, params: { type: string; count: number }) {
    const vocabulary = await this.prisma.userVocabulary.findMany({
      where: { userId },
      include: { translation: true },
      orderBy: { nextReviewAt: 'asc' },
      take: Math.max(params.count, 4),
    });

    if (vocabulary.length < 2) {
      throw new BadRequestException(
        'You need at least 2 words in your vocabulary to take a quiz',
      );
    }

    const quizWords = vocabulary.slice(0, params.count);
    const allTranslations = vocabulary.map((v) => v.translation.targetWord);

    return quizWords.map((v) => {
      const question: Record<string, unknown> = {
        id: v.id,
        word: v.translation.sourceWord,
        correctAnswer: v.translation.targetWord,
        type: params.type,
      };

      if (params.type === 'MULTIPLE_CHOICE') {
        const wrongOptions = allTranslations
          .filter((t) => t !== v.translation.targetWord)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const options = [v.translation.targetWord, ...wrongOptions].sort(
          () => Math.random() - 0.5,
        );
        question.options = options;
      }

      return question;
    });
  }

  async submit(userId: string, dto: SubmitQuizDto) {
    const correct = dto.answers.filter((a) => a.correct).length;
    const total = dto.answers.length;

    const result = await this.prisma.quizResult.create({
      data: {
        userId,
        correct,
        total,
        quizType: dto.quizType as QuizType,
      },
    });

    // Update vocabulary mastery based on quiz answers
    for (const answer of dto.answers) {
      const vocab = await this.prisma.userVocabulary.findFirst({
        where: { id: answer.vocabularyId, userId },
      });

      if (vocab) {
        const quality = answer.correct ? 4 : 1;
        const newLevel = answer.correct
          ? Math.min(vocab.masteryLevel + 1, 5)
          : Math.max(vocab.masteryLevel - 1, 0);

        const intervals = [0.0007, 1, 3, 7, 14, 30];
        const intervalDays = intervals[newLevel] || 1;

        await this.prisma.userVocabulary.update({
          where: { id: vocab.id },
          data: {
            masteryLevel: newLevel,
            nextReviewAt: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000),
            reviewCount: vocab.reviewCount + 1,
            lastReviewedAt: new Date(),
          },
        });
      }
    }

    return result;
  }
}
