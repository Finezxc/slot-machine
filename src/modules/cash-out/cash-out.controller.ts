import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { CashOutService } from './services/cash-out.service';
import { AuthSession } from '../../main/http/decorators/auth-session.decorator';
import { UnauthorizedException } from '../../main/http/exceptions/unauthoriezed.exception';
import { HttpStatusCodeEnum } from '../../main/http/enums/http-status-code.enum';
import { WINSTON_LOGGER_TOKEN } from '../../main/setup/setup-logger';
import { Logger } from 'winston';

@injectable()
export class CashOutController {
  constructor(
    @inject(CashOutService) private readonly cashOutService: CashOutService,
    @inject(WINSTON_LOGGER_TOKEN) private readonly logger: Logger,
  ) {}

  @AuthSession()
  public async cashOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.session.userId;
      if (!userId) {
        throw new UnauthorizedException('Unauthorized');
      }

      const credits = await this.cashOutService.cashOut(userId);

      req.session.destroy(() => {
        this.logger.info(`User with userId: ${userId}, successfull cash-out attempt, ${credits} credits`);
        return res.status(HttpStatusCodeEnum.SUCCESS).json({ success: true, cashOutedcredits: credits });
      });
    } catch (error) {
      next(error);
    }
  }
}
