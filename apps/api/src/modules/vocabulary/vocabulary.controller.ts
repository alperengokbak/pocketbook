import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { AddVocabularyDto } from './dto/add-vocabulary.dto';
import { ReviewVocabularyDto } from './dto/review-vocabulary.dto';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.vocabularyService.list(user.sub, {
      query,
      page: page || 1,
      limit: limit || 20,
      sortBy: sortBy || 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    });
  }

  @Post()
  async add(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddVocabularyDto,
  ) {
    return this.vocabularyService.add(user.sub, dto.translationId);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.vocabularyService.remove(user.sub, id);
  }

  @Patch(':id/review')
  async review(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ReviewVocabularyDto,
  ) {
    return this.vocabularyService.review(user.sub, id, dto.quality);
  }

  @Get('stats')
  async stats(@CurrentUser() user: JwtPayload) {
    return this.vocabularyService.getStats(user.sub);
  }
}
