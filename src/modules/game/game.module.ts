import { Router } from 'express';
import { container, injectable } from 'tsyringe';
import { GameController } from './game.controller';

@injectable()
export class GameModule {
  private router: Router = Router();

  constructor() {
    this.setupRouter();
  }

  public getRouter() {
    return this.router;
  }

  private setupRouter() {
    const gameController = container.resolve(GameController);

    this.router.post('/game/roll', gameController.roll.bind(gameController));
  }
}
