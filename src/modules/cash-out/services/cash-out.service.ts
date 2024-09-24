import { inject, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { SessionRepository } from '../../session/repositories/session.repository';
import { UnauthorizedException } from '../../../main/http/exceptions/unauthoriezed.exception';
import { UserRepository } from '../../user/repositories/user.repository';
import { BadRequestException } from '../../../main/http/exceptions/bad-request.exception';
import { WINSTON_LOGGER_TOKEN } from '../../../main/setup/setup-logger';

@singleton()
export class CashOutService {
  constructor(
    @inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(WINSTON_LOGGER_TOKEN) private readonly logger: Logger,
  ) {}

  async cashOut(userId: string): Promise<number> {
    const session = await this.sessionRepository.getActiveSessionByUserId(userId);
    if (!session) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (session.credits <= 10) {
      this.logger.info(`User with userId: ${userId}, unsuccessfull cash-out attempt`);
      throw new BadRequestException('You need to have more than 10 credits to cash-out');
    }

    const cashoutChance = Math.random();

    if (cashoutChance < 0.5) {
      // Simulate a server-side delay
      const delay = Math.floor(Math.random() * 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));

      // After the delay, randomly decide if we simulate an error or respond successfully
      if (Math.random() < 0.5) {
        this.logger.info(`User with userId: ${userId}, unsuccessfull cash-out attempt`);
        throw new BadRequestException('Something went wrong');
      }
    }

    await this.userRepository.updateCredits(parseInt(userId), session.credits);

    return session.credits;
  }
}
