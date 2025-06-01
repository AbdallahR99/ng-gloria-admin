import { Response } from 'express';
import { AppException } from '@api/common/exceptions/app.exception';

export function handleControllerError(
  res: Response,
  error: unknown,
  defaultMessage: string
) {
  if (error instanceof AppException) {
    res.status(error.statusCode).json({ error: error.message });
  } else {
    res.status(500).json({
      error: defaultMessage,
      details: error instanceof Error ? error.message : JSON.stringify(error),
    });
  }
}
