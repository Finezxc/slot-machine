import 'reflect-metadata';
import { GameService } from './game.service';
import { SessionRepository } from '../../session/repositories/session.repository';
import { BadRequestException } from '../../../main/http/exceptions/bad-request.exception';
import { Logger } from 'winston';
import { WINSTON_LOGGER_TOKEN } from '../../../main/setup/setup-logger';
import { container } from 'tsyringe';
import { RollType } from '../types/roll.type';
import { UnauthorizedException } from '../../../main/http/exceptions/unauthoriezed.exception';
import { SessionType } from '../../session/types/session.type';

describe('GameService', () => {
  let gameService: GameService;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let logger: jest.Mocked<Logger>;

  beforeEach(() => {
    sessionRepository = {
      getActiveSessionByUserId: jest.fn(),
      updateCredits: jest.fn(),
    } as any;
    logger = {
      info: jest.fn(),
    } as any;

    container.clearInstances(); // Ensure clean container instances in each test
    container.registerInstance(SessionRepository, sessionRepository);
    container.registerInstance(WINSTON_LOGGER_TOKEN, logger);

    gameService = container.resolve(GameService);
  });

  it('should throw UnauthorizedException if no active session exists for the user', async () => {
    sessionRepository.getActiveSessionByUserId.mockResolvedValue(undefined);

    await expect(gameService.roll('1')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw BadRequestException if user does not have enough credits', async () => {
    const session: SessionType = {
      credits: 0,
      sid: 'session123',
      data: 'data',
      expiresAt: new Date(),
      id: '1',
    };
    sessionRepository.getActiveSessionByUserId.mockResolvedValue(session);

    await expect(gameService.roll('1')).rejects.toThrow(BadRequestException);
  });

  it('should win and update credits if roll result is a win', async () => {
    const session: SessionType = {
      credits: 10,
      sid: 'session123',
      data: 'data',
      expiresAt: new Date(),
      id: '1',
    };
    sessionRepository.getActiveSessionByUserId.mockResolvedValue(session);

    const mockRollResult: RollType = {
      symbols: ['cherry', 'cherry', 'cherry'],
      isWin: true,
      reward: 10,
    };

    jest.spyOn(gameService, 'simpleLogicRoll').mockReturnValue(mockRollResult);
    jest.spyOn(global.Math, 'random').mockReturnValue(0.1); // No house advantage

    const result = await gameService.roll('1');

    expect(sessionRepository.updateCredits).toHaveBeenCalledWith('session123', 20);
    expect(logger.info).toHaveBeenCalledWith('User with userId: 1 win 10');
    expect(result).toEqual(mockRollResult);
  });

  it('should lose and deduct one credit if roll result is not a win', async () => {
    const session: SessionType = {
      credits: 10,
      sid: 'session123',
      data: 'data',
      expiresAt: new Date(),
      id: '1',
    };
    sessionRepository.getActiveSessionByUserId.mockResolvedValue(session);

    const mockRollResult: RollType = {
      symbols: ['cherry', 'lemon', 'orange'],
      isWin: false,
      reward: -1,
    };

    jest.spyOn(gameService, 'simpleLogicRoll').mockReturnValue(mockRollResult);

    const result = await gameService.roll('1');

    expect(sessionRepository.updateCredits).toHaveBeenCalledWith('session123', 9);
    expect(logger.info).toHaveBeenCalledWith('User with userId: 1 lose 1 credit');
    expect(result).toEqual(mockRollResult);
  });

  it('should apply house advantage and reroll when credits are between 40 and 60', async () => {
    const session: SessionType = {
      credits: 50,
      sid: 'session123',
      data: 'data',
      expiresAt: new Date(),
      id: '1',
    };
    sessionRepository.getActiveSessionByUserId.mockResolvedValue(session);

    const winRollResult: RollType = {
      symbols: ['cherry', 'cherry', 'cherry'],
      isWin: true,
      reward: 10,
    };

    const rerollResult: RollType = {
      symbols: ['lemon', 'lemon', 'lemon'],
      isWin: true,
      reward: 20,
    };

    jest.spyOn(gameService, 'simpleLogicRoll').mockReturnValueOnce(winRollResult).mockReturnValueOnce(rerollResult);

    jest.spyOn(global.Math, 'random').mockReturnValue(0.2); // Apply house advantage

    const result = await gameService.roll('1');

    expect(sessionRepository.updateCredits).toHaveBeenCalledWith('session123', 70);
    expect(result).toEqual(rerollResult);
  });

  it('should not reroll if house advantage condition is not met', async () => {
    const session: SessionType = {
      credits: 30,
      sid: 'session123',
      data: 'data',
      expiresAt: new Date(),
      id: '1',
    };
    sessionRepository.getActiveSessionByUserId.mockResolvedValue(session);

    const mockRollResult: RollType = {
      symbols: ['watermelon', 'watermelon', 'watermelon'],
      isWin: true,
      reward: 40,
    };

    jest.spyOn(gameService, 'simpleLogicRoll').mockReturnValue(mockRollResult);

    jest.spyOn(global.Math, 'random').mockReturnValue(0.7); // No reroll chance

    const result = await gameService.roll('1');

    expect(sessionRepository.updateCredits).toHaveBeenCalledWith('session123', 70);
    expect(result).toEqual(mockRollResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
