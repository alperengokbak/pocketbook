import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookFormat } from '@prisma/client';
import { extname } from 'path';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async getUserBooks(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.userBook.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { lastReadAt: { sort: 'desc', nulls: 'last' } },
        skip,
        take: limit,
      }),
      this.prisma.userBook.count({ where: { userId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublicBooks(query: string | undefined, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where = {
      isPublic: true,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' as const } },
              { author: { contains: query, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserBook(userId: string, bookId: string) {
    const userBook = await this.prisma.userBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
      include: { book: true },
    });

    if (!userBook) {
      throw new NotFoundException('Book not found in your library');
    }

    return userBook;
  }

  async uploadBook(userId: string, file: Express.Multer.File) {
    const ext = extname(file.originalname).toLowerCase().replace('.', '');
    const format = ext === 'epub' ? BookFormat.EPUB : BookFormat.PDF;

    const title = file.originalname
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const book = await this.prisma.book.create({
      data: {
        title,
        format,
        fileUrl: `/uploads/books/${file.filename}`,
        fileSize: file.size,
        uploadedBy: userId,
      },
    });

    const userBook = await this.prisma.userBook.create({
      data: {
        userId,
        bookId: book.id,
      },
      include: { book: true },
    });

    return userBook;
  }

  async addBookToUser(userId: string, bookId: string) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const existing = await this.prisma.userBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existing) {
      throw new ConflictException('Book already in your library');
    }

    return this.prisma.userBook.create({
      data: { userId, bookId },
      include: { book: true },
    });
  }
}
