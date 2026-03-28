import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TranslateDto } from './dto/translate.dto';

@Controller('translations')
@UseGuards(JwtAuthGuard)
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Post('translate')
  async translate(@Body() dto: TranslateDto) {
    return this.translationsService.translate(dto);
  }
}
