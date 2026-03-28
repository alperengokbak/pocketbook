import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class ReaderService {
  constructor(private prisma: PrismaService) {}

  async getBookContent(userId: string, bookId: string) {
    const userBook = await this.prisma.userBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
      include: { book: true },
    });

    if (!userBook) {
      throw new NotFoundException('Book not found in your library');
    }

    const book = userBook.book;
    const filePath = join(__dirname, '..', '..', '..', book.fileUrl);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Book file not found');
    }

    return {
      bookId: book.id,
      format: book.format,
      fileUrl: book.fileUrl,
      totalPages: userBook.totalPages,
      currentPosition: userBook.currentPosition,
      currentPage: userBook.currentPage,
      progress: userBook.progress,
      metadata: {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
      },
    };
  }

  async updateProgress(userId: string, bookId: string, dto: UpdateProgressDto) {
    const userBook = await this.prisma.userBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (!userBook) {
      throw new NotFoundException('Book not found in your library');
    }

    const updateData: Record<string, unknown> = {
      lastReadAt: new Date(),
    };

    if (dto.currentPosition !== undefined) updateData.currentPosition = dto.currentPosition;
    if (dto.currentPage !== undefined) updateData.currentPage = dto.currentPage;
    if (dto.totalPages !== undefined) updateData.totalPages = dto.totalPages;
    if (dto.progress !== undefined) {
      updateData.progress = dto.progress;
      if (dto.progress >= 100) {
        updateData.finishedAt = new Date();
      }
    }

    return this.prisma.userBook.update({
      where: { userId_bookId: { userId, bookId } },
      data: updateData,
      include: { book: true },
    });
  }
}
