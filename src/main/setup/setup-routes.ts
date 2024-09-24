import express from 'express';
import { container } from 'tsyringe';
import { GameModule } from '../../modules/game/game.module';
import { UserModule } from '../../modules/user/user.module';
import { CashOutModule } from '../../modules/cash-out/cash-out.module';

export default function setupRoutes(app: express.Application): void {
  const userRouter = container.resolve(UserModule).getRouter();
  const gameRouter = container.resolve(GameModule).getRouter();
  const cashOutRouter = container.resolve(CashOutModule).getRouter();

  app.use([userRouter, gameRouter, cashOutRouter]);
}
