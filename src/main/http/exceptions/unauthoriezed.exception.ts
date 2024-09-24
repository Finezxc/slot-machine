import { HttpStatusCodeEnum } from '../enums/http-status-code.enum';
import { HttpException } from './http.exception';

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(HttpStatusCodeEnum.UNAUTHORIZED, message);
  }
}
