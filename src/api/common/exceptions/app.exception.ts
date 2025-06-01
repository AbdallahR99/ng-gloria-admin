export class AppException extends Error {
  constructor(
    public override readonly message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppException';
    this.statusCode = statusCode;
  }
}
