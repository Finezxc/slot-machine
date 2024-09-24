import { PrismaClient, Session } from '@prisma/client';
import { inject, singleton } from 'tsyringe';
import { ISessionRepository } from './session.repository.interface';
import { PRISMA_CLIENT_TOKEN } from '../../../main/setup/setup-prisma';
import { SessionType } from '../types/session.type';

@singleton()
export class SessionRepository implements ISessionRepository {
  constructor(@inject(PRISMA_CLIENT_TOKEN) private prisma: PrismaClient) {}

  public async getActiveSessionByUserId(userId: string): Promise<SessionType | undefined> {
    const sessions = await this.prisma.$queryRaw<Session[]>`
      SELECT * FROM sessions
      WHERE data::jsonb->>'userId' = ${userId}::text AND "expiresAt"::date >= CURRENT_DATE`;

    const session = sessions.shift();

    return session;
  }

  public async updateCredits(sessionId: string, credits: number): Promise<void> {
    await this.prisma.session.update({
      where: {
        sid: sessionId,
      },
      data: {
        credits,
      },
    });
  }
}
