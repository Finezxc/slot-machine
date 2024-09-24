import { Request, Response, NextFunction } from 'express';
import { HttpStatusCodeEnum } from '../enums/http-status-code.enum';
import { HttpException } from '../exceptions/http.exception';
import { Prisma } from '@prisma/client';
import { PrismaCodeEnum } from '../enums/prisma-code.enum';

export default function httpExceptionHandler(
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const status = error.status ? error.status : HttpStatusCodeEnum.UNKNOWN_ERROR;
  const message = status === HttpStatusCodeEnum.UNKNOWN_ERROR ? 'Unknown error' : error.message;
  const errors = error.error;

  res.status(status).json({ status, message, error: errors });
}
