import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { BooksService } from './books.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

const uploadDir = join(__dirname, '..', '..', '..', 'uploads', 'books');

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async getMyBooks(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.booksService.getUserBooks(user.sub, page || 1, limit || 12);
  }

  @Get('library')
  async getLibrary(
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.booksService.getPublicBooks(query, page || 1, limit || 12);
  }

  @Get(':id')
  async getBook(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.booksService.getUserBook(user.sub, id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(epub|pdf)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.booksService.uploadBook(user.sub, file);
  }

  @Post(':id/add')
  async addToLibrary(
    @CurrentUser() user: JwtPayload,
    @Param('id') bookId: string,
  ) {
    return this.booksService.addBookToUser(user.sub, bookId);
  }
}
