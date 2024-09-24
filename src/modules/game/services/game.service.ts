import { inject, singleton } from 'tsyringe';
import { SessionRepository } from '../../session/repositories/session.repository';
import { UnauthorizedException } from '../../../main/http/exceptions/unauthoriezed.exception';
import { BadRequestException } from '../../../main/http/exceptions/bad-request.exception';
import { WINSTON_LOGGER_TOKEN } from '../../../main/setup/setup-logger';
import { Logger } from 'winston';
import { RollType } from '../types/roll.type';

const SYMBOLS: string[] = ['cherry', 'lemon', 'orange', 'watermelon'];
const REWARDS: Record<string, number> = { cherry: 10, lemon: 20, orange: 30, watermelon: 40 };

@singleton()
export class GameService {
  constructor(
    @inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @inject(WINSTON_LOGGER_TOKEN) private readonly logger: Logger,
  ) {}

  public async roll(userId: string): Promise<RollType> {
    const session = await this.sessionRepository.getActiveSessionByUserId(userId);

    if (!session) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { credits, sid } = session;

    if (credits < 1) {
      throw new BadRequestException('You do not have enough credits to roll');
    }

    const { symbols, isWin, reward } = this.simpleLogicRoll();
    const rollResult = this.houseAdvantageRoll(session.credits, symbols, isWin, reward);

    if (rollResult.isWin) {
      await this.sessionRepository.updateCredits(sid, session.credits + rollResult.reward);

      this.logger.info(`User with userId: ${userId} win ${rollResult.reward}`);
    } else {
      this.logger.info(`User with userId: ${userId} lose 1 credit`);
      await this.sessionRepository.updateCredits(sid, session.credits - 1);
    }

    return rollResult;
  }

  public simpleLogicRoll(): RollType {
    const symbols = Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    const isWin = symbols.every((symbol) => symbol === symbols[0]);

    const reward = isWin ? REWARDS[symbols[0]] : -1;

    return { symbols, isWin, reward };
  }

  private houseAdvantageRoll(credits: number, symbols: string[], isWin: boolean, reward: number): RollType {
    if (!isWin) {
      return { symbols, isWin, reward };
    }

    let rerollChance = 0;
    if (credits >= 40 && credits < 60) {
      rerollChance = 0.3;
    } else if (credits >= 60) {
      rerollChance = 0.6;
    }

    if (Math.random() < rerollChance) {
      return this.simpleLogicRoll();
    }

    return { symbols, isWin, reward };
  }
}
