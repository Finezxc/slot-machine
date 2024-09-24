import { SessionType } from '../types/session.type';

export interface ISessionRepository {
  getActiveSessionByUserId(userId: string): Promise<SessionType | undefined>;
  updateCredits(sessionId: string, credits: number): Promise<void>;
}

export const SESSION_REPOSITORY_TOKEN = Symbol('SESSION_REPOSITORY_TOKEN');
