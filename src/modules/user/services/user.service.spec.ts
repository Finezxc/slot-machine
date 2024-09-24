import 'reflect-metadata';
import { UserService } from './user.service';
import { HashService } from '../../hash/hash.service';
import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../../session/repositories/session.repository';
import { BadRequestException } from '../../../main/http/exceptions/bad-request.exception';
import { RegisterInput } from '../dto/input/register.input';
import { LoginInput } from '../dto/input/login.input';
import { UserType } from '../types/user.type';

describe('UserService', () => {
  let userService: UserService;
  let hashService: jest.Mocked<HashService>;
  let userRepository: jest.Mocked<UserRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;

  beforeEach(() => {
    hashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as any;
    userRepository = {
      createUser: jest.fn(),
      findUserByUsername: jest.fn(),
    } as any;
    sessionRepository = {} as any;

    userService = new UserService(hashService, userRepository, sessionRepository);
  });

  describe('register', () => {
    it('should hash the password and create a new user', async () => {
      const registerInput: RegisterInput = {
        username: 'testUser',
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword';

      // Mock the hash function to return a hashed password
      hashService.hash.mockResolvedValue(hashedPassword);

      await userService.register(registerInput);

      expect(hashService.hash).toHaveBeenCalledWith(registerInput.password);
      expect(userRepository.createUser).toHaveBeenCalledWith({
        username: registerInput.username,
        password: hashedPassword,
      });
    });
  });

  describe('login', () => {
    it('should throw BadRequestException if user does not exist', async () => {
      const loginInput: LoginInput = {
        username: 'nonexistentUser',
        password: 'password123',
      };

      // Mock findUserByUsername to return null
      userRepository.findUserByUsername.mockResolvedValue(null);

      await expect(userService.login(loginInput)).rejects.toThrow(BadRequestException);
      expect(userRepository.findUserByUsername).toHaveBeenCalledWith(loginInput.username);
    });

    it('should return the user if login is successful', async () => {
      const loginInput: LoginInput = {
        username: 'testUser',
        password: 'correctPassword',
      };
      const user: UserType = {
        id: 1,
        username: 'testUser',
        password: 'hashedPassword',
        credits: 10,
      };

      // Mock the repository to return the user
      userRepository.findUserByUsername.mockResolvedValue(user);
      // Mock the hashService to return true for valid password
      hashService.compare.mockResolvedValue(true);

      const result = await userService.login(loginInput);

      expect(userRepository.findUserByUsername).toHaveBeenCalledWith(loginInput.username);
      expect(hashService.compare).toHaveBeenCalledWith(loginInput.password, user.password);
      expect(result).toEqual(user);
    });
  });
});
