import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export function validateDto(dto: ClassConstructor<object>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(dto, req.body, { enableImplicitConversion: true });

    const errors = await validate(instance, { validationError: { target: false } });

    if (errors.length > 0) {
      const result = errors.map((error) => {
        return error.constraints ? Object.values(error.constraints) : [];
      });

      return res.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
        message: result.flat(),
      });
    }

    next();
  };
}
