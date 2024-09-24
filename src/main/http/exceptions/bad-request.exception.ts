import { HttpStatusCodeEnum } from '../enums/http-status-code.enum';
import { HttpException } from './http.exception';

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(HttpStatusCodeEnum.BAD_REQUEST, message);
  }
}
