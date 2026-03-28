import { PrismaClient, BookFormat } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { statSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const BOOKS = [
  {
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    filename: 'alice-in-wonderland.epub',
    format: BookFormat.EPUB,
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    filename: 'pride-and-prejudice.epub',
    format: BookFormat.EPUB,
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    filename: 'the-great-gatsby.epub',
    format: BookFormat.EPUB,
  },
  {
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    filename: 'sherlock-holmes.epub',
    format: BookFormat.EPUB,
  },
  {
    title: 'Frankenstein',
    author: 'Mary Shelley',
    filename: 'frankenstein.epub',
    format: BookFormat.EPUB,
  },
];

async function main() {
  console.log('Seeding database...\n');

  // 1. Create a test user
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@pocketbook.dev' },
    update: {},
    create: {
      email: 'test@pocketbook.dev',
      passwordHash,
      displayName: 'Test User',
    },
  });
  console.log(`Created test user: ${user.email} (password: password123)`);

  // 2. Add public library books
  const uploadsDir = join(__dirname, '..', 'uploads', 'books');

  for (const bookData of BOOKS) {
    const filePath = join(uploadsDir, bookData.filename);
    let fileSize = 0;
    try {
      fileSize = statSync(filePath).size;
    } catch {
      console.log(`  Skipping ${bookData.title} - file not found`);
      continue;
    }

    const existing = await prisma.book.findFirst({
      where: { fileUrl: `/uploads/books/${bookData.filename}` },
    });
    const book = existing || await prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author,
        format: bookData.format,
        fileUrl: `/uploads/books/${bookData.filename}`,
        fileSize,
        isPublic: true,
      },
    });
    console.log(`  Added book: ${book.title} by ${book.author} (${(fileSize / 1024).toFixed(0)} KB)`);
  }

  // 3. Add some sample translations to seed the cache
  const sampleWords = [
    { sourceWord: 'book', targetWord: 'kitap' },
    { sourceWord: 'read', targetWord: 'okumak' },
    { sourceWord: 'word', targetWord: 'kelime' },
    { sourceWord: 'language', targetWord: 'dil' },
    { sourceWord: 'learn', targetWord: 'öğrenmek' },
    { sourceWord: 'story', targetWord: 'hikaye' },
    { sourceWord: 'adventure', targetWord: 'macera' },
    { sourceWord: 'wonder', targetWord: 'merak' },
    { sourceWord: 'rabbit', targetWord: 'tavşan' },
    { sourceWord: 'queen', targetWord: 'kraliçe' },
    { sourceWord: 'dream', targetWord: 'rüya' },
    { sourceWord: 'garden', targetWord: 'bahçe' },
    { sourceWord: 'door', targetWord: 'kapı' },
    { sourceWord: 'key', targetWord: 'anahtar' },
    { sourceWord: 'smile', targetWord: 'gülümsemek' },
    { sourceWord: 'thought', targetWord: 'düşünce' },
    { sourceWord: 'beautiful', targetWord: 'güzel' },
    { sourceWord: 'darkness', targetWord: 'karanlık' },
    { sourceWord: 'creature', targetWord: 'yaratık' },
    { sourceWord: 'mystery', targetWord: 'gizem' },
  ];

  console.log('\n  Adding sample translations...');
  for (const word of sampleWords) {
    await prisma.translation.upsert({
      where: {
        sourceWord_sourceLang_targetLang: {
          sourceWord: word.sourceWord,
          sourceLang: 'en',
          targetLang: 'tr',
        },
      },
      update: {},
      create: {
        sourceWord: word.sourceWord,
        targetWord: word.targetWord,
        sourceLang: 'en',
        targetLang: 'tr',
      },
    });
  }
  console.log(`  Added ${sampleWords.length} sample EN->TR translations`);

  // 4. Add some words to the test user's vocabulary
  const translations = await prisma.translation.findMany({ take: 8 });
  console.log('\n  Adding words to test user vocabulary...');
  for (const translation of translations) {
    await prisma.userVocabulary.upsert({
      where: {
        userId_translationId: {
          userId: user.id,
          translationId: translation.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        translationId: translation.id,
        masteryLevel: Math.floor(Math.random() * 4),
        reviewCount: Math.floor(Math.random() * 5),
      },
    });
  }
  console.log(`  Added ${translations.length} words to test user's vocabulary`);

  console.log('\n--- Seed complete! ---');
  console.log('\nTest account:');
  console.log('  Email:    test@pocketbook.dev');
  console.log('  Password: password123');
  console.log(`\nBooks in library: ${BOOKS.length}`);
  console.log(`Translations cached: ${sampleWords.length}`);
  console.log(`Vocabulary words: ${translations.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
