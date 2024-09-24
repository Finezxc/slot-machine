import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { UserService } from './services/user.service';
import { Prisma } from '@prisma/client';
import { PrismaCodeEnum } from '../../main/http/enums/prisma-code.enum';
import { BadRequestException } from '../../main/http/exceptions/bad-request.exception';
import { HttpStatusCodeEnum } from '../../main/http/enums/http-status-code.enum';
import { AuthSession } from '../../main/http/decorators/auth-session.decorator';

@injectable()
export class UserController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.register(req.body);

      return res
        .status(HttpStatusCodeEnum.CREATED)
        .json({ status: HttpStatusCodeEnum.CREATED, message: 'User successfully registered' });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaCodeEnum.P2002) {
          next(new BadRequestException('This username already exists'));
        }
      }
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.login(req.body);
      req.session.userId = user.id.toString();

      return res.status(HttpStatusCodeEnum.SUCCESS).json({ message: 'Login successful', user });
    } catch (error) {
      next(error);
    }
  }

  @AuthSession()
  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      req.session.destroy(() => {
        return res.status(HttpStatusCodeEnum.SUCCESS).json({ message: 'Logout successful' });
      });
    } catch (error) {
      next(error);
    }
  }
}
