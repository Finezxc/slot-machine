import { PrismaClient } from '@prisma/client';
import { inject, singleton } from 'tsyringe';
import { PRISMA_CLIENT_TOKEN } from '../../../main/setup/setup-prisma';
import { RegisterInput } from '../dto/input/register.input';
import { UserType } from '../types/user.type';
import { IUserRepository } from './user.repository.interface';

@singleton()
export class UserRepository implements IUserRepository {
  constructor(@inject(PRISMA_CLIENT_TOKEN) private prisma: PrismaClient) {}

  async createUser(registerInput: RegisterInput): Promise<void> {
    await this.prisma.user.create({
      data: { username: registerInput.username, password: registerInput.password },
    });
  }

  async findUserByUsername(username: string): Promise<UserType | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async updateCredits(userId: number, credits: number): Promise<UserType> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: credits,
        },
      },
    });
  }
}
