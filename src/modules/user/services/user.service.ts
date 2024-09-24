import { inject, singleton } from 'tsyringe';
import { HashService } from '../../hash/hash.service';
import { RegisterInput } from '../dto/input/register.input';
import { UserRepository } from '../repositories/user.repository';
import { LoginInput } from '../dto/input/login.input';
import { BadRequestException } from '../../../main/http/exceptions/bad-request.exception';
import { SessionRepository } from '../../session/repositories/session.repository';
import { UserType } from '../types/user.type';

@singleton()
export class UserService {
  constructor(
    @inject(HashService) private readonly hashService: HashService,
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(SessionRepository) private readonly sessionRepository: SessionRepository,
  ) {}

  public async register(registerInput: RegisterInput): Promise<void> {
    const { username, password } = registerInput;
    const hashedPassword = await this.hashService.hash(password);

    await this.userRepository.createUser({ username, password: hashedPassword });
  }

  public async login(loginInput: LoginInput): Promise<UserType> {
    const { username, password } = loginInput;
    const user = await this.userRepository.findUserByUsername(username);
    if (!user) {
      throw new BadRequestException('This user does not exists');
    }

    const passwordIsValid = this.hashService.compare(password, user.password);
    if (!passwordIsValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }
}
