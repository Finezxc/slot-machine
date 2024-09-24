import 'reflect-metadata';
import express from 'express';
import setupEnv from './main/setup/setup-env';
import setupListen from './main/setup/setup-listen';
import setupRoutes from './main/setup/setup-routes';
import setupPrisma from './main/setup/setup-prisma';
import setupExceptionHandlers from './main/setup/setup-exception-handlers';
import { setupSessions } from './main/setup/setup-sessions';
import setupLogger from './main/setup/setup-logger';

function bootstrap(): void {
  const app = express();
  app.use(express.json());
  setupLogger();
  setupEnv();
  setupPrisma();
  setupSessions(app);
  setupRoutes(app);
  setupExceptionHandlers(app);
  setupListen(app);
}

bootstrap();
