import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { TranslateDto } from './dto/translate.dto';

@Injectable()
export class TranslationsService {
  private readonly logger = new Logger(TranslationsService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private configService: ConfigService,
  ) {}

  async translate(dto: TranslateDto) {
    const { word, sourceLang = 'en', targetLang = 'tr' } = dto;
    const normalizedWord = word.toLowerCase().trim();
    const cacheKey = `translation:${sourceLang}:${targetLang}:${normalizedWord}`;

    // 1. Check Redis cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        id: parsed.id,
        sourceWord: normalizedWord,
        targetWord: parsed.targetWord,
        sourceLang,
        targetLang,
      };
    }

    // 2. Check database
    const dbTranslation = await this.prisma.translation.findUnique({
      where: {
        sourceWord_sourceLang_targetLang: {
          sourceWord: normalizedWord,
          sourceLang,
          targetLang,
        },
      },
    });

    if (dbTranslation) {
      await this.redis.set(
        cacheKey,
        JSON.stringify({ id: dbTranslation.id, targetWord: dbTranslation.targetWord }),
      );
      return {
        id: dbTranslation.id,
        sourceWord: normalizedWord,
        targetWord: dbTranslation.targetWord,
        sourceLang,
        targetLang,
      };
    }

    // 3. Call MyMemory API
    const targetWord = await this.fetchFromMyMemory(normalizedWord, sourceLang, targetLang);

    const translation = await this.prisma.translation.create({
      data: {
        sourceWord: normalizedWord,
        targetWord,
        sourceLang,
        targetLang,
        context: dto.context,
      },
    });

    await this.redis.set(
      cacheKey,
      JSON.stringify({ id: translation.id, targetWord: translation.targetWord }),
    );

    return {
      id: translation.id,
      sourceWord: normalizedWord,
      targetWord: translation.targetWord,
      sourceLang,
      targetLang,
    };
  }

  private async fetchFromMyMemory(
    word: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<string> {
    const email = this.configService.get<string>('app.mymemoryEmail');
    const params = new URLSearchParams({
      q: word,
      langpair: `${sourceLang}|${targetLang}`,
    });
    if (email) {
      params.set('de', email);
    }

    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?${params.toString()}`,
      );
      const data = (await response.json()) as {
        responseStatus: number;
        responseData?: { translatedText?: string };
      };

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return data.responseData.translatedText.toLowerCase();
      }

      this.logger.warn(`MyMemory returned unexpected response for "${word}"`);
      return word;
    } catch (error) {
      this.logger.error(`MyMemory API error for "${word}":`, error);
      return word;
    }
  }
}
