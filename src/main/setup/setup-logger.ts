import { container } from 'tsyringe';
import winston, { Logger } from 'winston';

export default function setupLogger() {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
  });

  container.register<Logger>(WINSTON_LOGGER_TOKEN, {
    useValue: logger,
  });
}

export const WINSTON_LOGGER_TOKEN = Symbol('WINSTON_LOGGER_TOKEN');
