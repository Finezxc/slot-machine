import express from 'express';
import expressSession from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
import { container } from 'tsyringe';
import { PRISMA_CLIENT_TOKEN } from './setup-prisma';

export function setupSessions(app: express.Application) {
  const prisma = container.resolve<PrismaClient>(PRISMA_CLIENT_TOKEN);

  app.use(
    expressSession({
      cookie: {
        maxAge: 30 * 60 * 1000, // 30 min
        // maxAge: 5 * 1000, // 3 sec
      },
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
      store: new PrismaSessionStore(prisma, {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }),
    }),
  );
}
