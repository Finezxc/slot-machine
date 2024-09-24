import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '../exceptions/unauthoriezed.exception';

export function AuthSession() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        if (req.session.userId) {
          return originalMethod.apply(this, [req, res, next]);
        } else {
          throw new UnauthorizedException('Unauthorized');
        }
      } catch (error) {
        next(error);
      }
    };

    return descriptor;
  };
}
