import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ReaderService } from './reader.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('reader')
@UseGuards(JwtAuthGuard)
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @Get(':bookId/content')
  async getContent(
    @CurrentUser() user: JwtPayload,
    @Param('bookId') bookId: string,
  ) {
    return this.readerService.getBookContent(user.sub, bookId);
  }

  @Patch(':bookId/progress')
  async updateProgress(
    @CurrentUser() user: JwtPayload,
    @Param('bookId') bookId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.readerService.updateProgress(user.sub, bookId, dto);
  }
}
