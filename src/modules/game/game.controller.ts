import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { GameService } from './services/game.service';
import { AuthSession } from '../../main/http/decorators/auth-session.decorator';
import { UnauthorizedException } from '../../main/http/exceptions/unauthoriezed.exception';
import { HttpStatusCodeEnum } from '../../main/http/enums/http-status-code.enum';

@injectable()
export class GameController {
  constructor(@inject(GameService) private readonly gameService: GameService) {}

  @AuthSession()
  public async roll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.session.userId;
      if (!userId) {
        throw new UnauthorizedException('Unauthorized');
      }

      const result = await this.gameService.roll(userId);

      return res.status(HttpStatusCodeEnum.SUCCESS).json(result);
    } catch (error) {
      next(error);
    }
  }
}
