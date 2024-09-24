import express from 'express';
import httpExceptionHandler from '../http/middlewares/http-exception-handler';

export default function setupExceptionHandlers(app: express.Application) {
  app.use(httpExceptionHandler);
}
