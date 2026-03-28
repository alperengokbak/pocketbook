import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('generate')
  async generate(
    @CurrentUser() user: JwtPayload,
    @Query('type') type?: string,
    @Query('count') count?: number,
  ) {
    return this.quizService.generate(user.sub, {
      type: type || 'FLASHCARD',
      count: count || 10,
    });
  }

  @Post('submit')
  async submit(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizService.submit(user.sub, dto);
  }
}
