import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VocabularyService {
  constructor(private prisma: PrismaService) {}

  async list(
    userId: string,
    params: {
      query?: string;
      page: number;
      limit: number;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    },
  ) {
    const { query, page, limit, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(query
        ? {
            translation: {
              OR: [
                { sourceWord: { contains: query, mode: 'insensitive' as const } },
                { targetWord: { contains: query, mode: 'insensitive' as const } },
              ],
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.userVocabulary.findMany({
        where,
        include: { translation: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.userVocabulary.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async add(userId: string, translationId: string) {
    const translation = await this.prisma.translation.findUnique({
      where: { id: translationId },
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    const existing = await this.prisma.userVocabulary.findUnique({
      where: { userId_translationId: { userId, translationId } },
    });

    if (existing) {
      throw new ConflictException('Word already in your vocabulary');
    }

    return this.prisma.userVocabulary.create({
      data: { userId, translationId },
      include: { translation: true },
    });
  }

  async remove(userId: string, id: string) {
    const vocab = await this.prisma.userVocabulary.findFirst({
      where: { id, userId },
    });

    if (!vocab) {
      throw new NotFoundException('Vocabulary entry not found');
    }

    await this.prisma.userVocabulary.delete({ where: { id } });
  }

  async review(userId: string, id: string, quality: number) {
    const vocab = await this.prisma.userVocabulary.findFirst({
      where: { id, userId },
    });

    if (!vocab) {
      throw new NotFoundException('Vocabulary entry not found');
    }

    // SM-2 spaced repetition algorithm
    const { masteryLevel, nextReviewAt } = this.calculateSM2(
      vocab.masteryLevel,
      vocab.reviewCount,
      quality,
    );

    return this.prisma.userVocabulary.update({
      where: { id },
      data: {
        masteryLevel,
        nextReviewAt,
        reviewCount: vocab.reviewCount + 1,
        lastReviewedAt: new Date(),
      },
      include: { translation: true },
    });
  }

  async getStats(userId: string) {
    const [total, toReview, mastered] = await Promise.all([
      this.prisma.userVocabulary.count({ where: { userId } }),
      this.prisma.userVocabulary.count({
        where: { userId, nextReviewAt: { lte: new Date() } },
      }),
      this.prisma.userVocabulary.count({
        where: { userId, masteryLevel: { gte: 4 } },
      }),
    ]);

    return { total, toReview, mastered };
  }

  private calculateSM2(
    currentLevel: number,
    reviewCount: number,
    quality: number,
  ): { masteryLevel: number; nextReviewAt: Date } {
    // quality: 0-5 (0=complete fail, 5=perfect)
    let newLevel = currentLevel;

    if (quality >= 3) {
      newLevel = Math.min(currentLevel + 1, 5);
    } else {
      newLevel = Math.max(currentLevel - 1, 0);
    }

    // Calculate interval in days based on mastery level
    const intervals = [0.0007, 1, 3, 7, 14, 30]; // ~1min, 1d, 3d, 7d, 14d, 30d
    const intervalDays = intervals[newLevel] || 1;

    const nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

    return { masteryLevel: newLevel, nextReviewAt };
  }
}
