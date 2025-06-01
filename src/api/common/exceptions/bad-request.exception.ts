import { AppException } from './app.exception';

export class BadRequestException extends AppException {
  constructor(public override readonly message: string) {
    super(message, 400);
    this.name = 'BadRequestException';
  }
}
