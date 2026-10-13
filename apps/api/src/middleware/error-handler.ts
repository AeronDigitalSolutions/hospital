import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { formatZodError } from '@chikitsaalye/validation';
import { HTTP_STATUS, ERROR_CODES } from '@chikitsaalye/config';
import type { ApiErrorResponse } from '@chikitsaalye/types';
import { AppError } from './errors.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response<ApiErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.requestId || 'req_unknown';

  // 1. Zod validation error
  if (err instanceof ZodError || (typeof err === 'object' && err !== null && (err as any).name === 'ZodError')) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Invalid request payload or query parameters',
        requestId,
        details: formatZodError(err as ZodError),
      },
    });
    return;
  }

  // 2. Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details,
      },
    });
    return;
  }

  // 3. Fallback Internal Server Error (Never leak internal stack trace)
  const isDev = process.env.NODE_ENV === 'development';
  const errorMessage = isDev && err instanceof Error ? err.message : 'An unexpected error occurred while processing the request.';

  console.error(`[Unhandled Error] [${requestId}]`, err);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: errorMessage,
      requestId,
    },
  });
}
