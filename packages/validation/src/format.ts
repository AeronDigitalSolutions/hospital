import { ZodError } from 'zod';
import type { ApiErrorDetail } from '@chikitsaalye/types';

export function formatZodError(error: ZodError): ApiErrorDetail[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}
