import 'reflect-metadata';
import { SessionRepository } from '../../session/repositories/session.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { UnauthorizedException } from '../../../main/http/exceptions/unauthoriezed.exception';
import { BadRequestException } from '../../../main/http/exceptions/bad-request.exception';
import { Logger } from 'winston';
import { WINSTON_LOGGER_TOKEN } from '../../../main/setup/setup-logger';
import { container } from 'tsyringe';
import { CashOutService } from './cash-out.service';

describe('CashOutService', () => {
  let cashOutService: CashOutService;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let logger: jest.Mocked<Logger>;

  beforeEach(() => {
    sessionRepository = {
      getActiveSessionByUserId: jest.fn(),
    } as any;
    userRepository = {
      updateCredits: jest.fn(),
    } as any;
    logger = {
      info: jest.fn(),
    } as any;

    container.clearInstances(); // Ensure clean container instances in each test
    container.registerInstance(SessionRepository, sessionRepository);
    container.registerInstance(UserRepository, userRepository);
    container.registerInstance(WINSTON_LOGGER_TOKEN, logger);

    cashOutService = container.resolve(CashOutService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException if no active session exists for the user', async () => {
    sessionRepository.getActiveSessionByUserId.mockResolvedValue(undefined);

    await expect(cashOutService.cashOut('1')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw BadRequestException if credits are less than or equal to 10', async () => {
    const session = {
      id: '1',
      sid: 'sid',
      data: 'data',
      expiresAt: new Date(),
      credits: 10,
    };
    sessionRepository.getActiveSessionByUserId.mockResolvedValue(session);

    await expect(cashOutService.cashOut('1')).rejects.toThrow(BadRequestException);
    expect(logger.info).toHaveBeenCalledWith('User with userId: 1, unsuccessfull cash-out attempt');
  });

  it('should delay and throw BadRequestException if random value is less than 0.5', async () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.4); // Simulate cashoutChance < 0.5

    const session = {
      id: '1',
      sid: 'sid',
      data: 'data',
      expiresAt: new Date(),
      credits: 15,
    };
    sessionRepository.getActiveSessionByUserId.mockResolvedValue(session);

    jest.spyOn(global, 'setTimeout');

    await expect(cashOutService.cashOut('1')).rejects.toThrow(BadRequestException);
    expect(logger.info).toHaveBeenCalledWith('User with userId: 1, unsuccessfull cash-out attempt');
  });

  it('should update credits if the cash-out is successful', async () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.6); // Simulate cashoutChance > 0.5

    const session = {
      id: '1',
      sid: 'sid',
      data: 'data',
      expiresAt: new Date(),
      credits: 20,
    };
    sessionRepository.getActiveSessionByUserId.mockResolvedValue(session);

    const result = await cashOutService.cashOut('1');

    expect(userRepository.updateCredits).toHaveBeenCalledWith(1, 20);
    expect(result).toBe(20);
  });

  it('should throw BadRequestException after delay if random server error occurs', async () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.4); // Simulate cashoutChance < 0.5

    const session = {
      id: '1',
      sid: 'sid',
      data: 'data',
      expiresAt: new Date(),
      credits: 30,
    };

    sessionRepository.getActiveSessionByUserId.mockResolvedValue(session);

    jest.spyOn(global, 'setTimeout');

    await expect(cashOutService.cashOut('1')).rejects.toThrow(BadRequestException);
    expect(logger.info).toHaveBeenCalledWith('User with userId: 1, unsuccessfull cash-out attempt');
  });
});
