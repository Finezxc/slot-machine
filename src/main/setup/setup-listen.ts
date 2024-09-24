import express from 'express';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { WINSTON_LOGGER_TOKEN } from './setup-logger';

export default function setupListen(app: express.Application): void {
  const PORT = process.env.APP_PORT;
  const logger = container.resolve<Logger>(WINSTON_LOGGER_TOKEN);

  app
    .listen(PORT, () => {
      logger.info(`Server running at PORT: ${PORT}`);
    })
    .on('error', (error) => {
      throw new Error(error.message);
    });
}
