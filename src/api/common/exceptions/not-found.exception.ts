import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  constructor(public override readonly message: string) {
    super(message, 404);
    this.name = 'NotFoundException';
  }
}
