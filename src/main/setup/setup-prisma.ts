import { PrismaClient } from '@prisma/client';
import { container } from 'tsyringe';

export default function setupPrisma(): void {
  container.register<PrismaClient>(PRISMA_CLIENT_TOKEN, {
    useValue: new PrismaClient(),
  });
}

export const PRISMA_CLIENT_TOKEN = Symbol('PRISMA_CLIENT_TOKEN');
