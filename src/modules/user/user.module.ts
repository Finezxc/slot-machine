import { Router } from 'express';
import { container, injectable } from 'tsyringe';
import { UserController } from './user.controller';
import { validateDto } from './middlewares/validate-dto';
import { RegisterInput } from './dto/input/register.input';

@injectable()
export class UserModule {
  private router: Router = Router();

  constructor() {
    this.setupRouter();
  }

  public getRouter() {
    return this.router;
  }

  private setupRouter() {
    const userController = container.resolve(UserController);

    this.router.post('/user/register', validateDto(RegisterInput), userController.register.bind(userController));
    this.router.post('/user/login', userController.login.bind(userController));
    this.router.post('/user/logout', userController.logout.bind(userController));
  }
}
