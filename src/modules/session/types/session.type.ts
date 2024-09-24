import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// export type SessionType = {
//   id: number;
//   credits: number;
//   isActive: boolean;
//   userId: number;
// };

export type SessionType = {
  id: string;
  sid: string;
  data: string;
  expiresAt: Date;
  credits: number;
};
