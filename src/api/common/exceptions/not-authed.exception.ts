import { AppException } from "./app.exception";

export class NotAuthorizedException extends AppException {
  constructor(message: string = 'Not authorized') {
    super(message, 401);
    this.name = 'NotAuthorizedException';
  }
}
