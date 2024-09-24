import { RegisterInput } from '../dto/input/register.input';
import { UserType } from '../types/user.type';

export interface IUserRepository {
  createUser(registerInput: RegisterInput): Promise<void>;
  findUserByUsername(username: string): Promise<UserType | null>;
  updateCredits(userId: number, credits: number): Promise<UserType>;
}
