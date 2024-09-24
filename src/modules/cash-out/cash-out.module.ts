import { Router } from 'express';
import { container, injectable } from 'tsyringe';
import { CashOutController } from './cash-out.controller';

@injectable()
export class CashOutModule {
  private router: Router = Router();

  constructor() {
    this.setupRouter();
  }

  public getRouter() {
    return this.router;
  }

  private setupRouter() {
    const cashOutController = container.resolve(CashOutController);

    this.router.post('/cash-out/cash-out', cashOutController.cashOut.bind(cashOutController));
  }
}
