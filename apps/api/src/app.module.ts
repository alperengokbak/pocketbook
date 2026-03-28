import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { BooksModule } from './modules/books/books.module';
import { ReaderModule } from './modules/reader/reader.module';
import { TranslationsModule } from './modules/translations/translations.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { QuizModule } from './modules/quiz/quiz.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    BooksModule,
    ReaderModule,
    TranslationsModule,
    VocabularyModule,
    QuizModule,
  ],
})
export class AppModule {}
