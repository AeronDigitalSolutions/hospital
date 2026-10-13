import { Request, Response } from 'express';
import type { ApiSuccessResponse, PaginatedResult } from '@chikitsaalye/types';

export function sendSuccess<T>(
  req: Request,
  res: Response,
  data: T,
  statusCode = 200,
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }
): Response<ApiSuccessResponse<T>> {
  const durationMs = req.startTime ? Date.now() - req.startTime : undefined;

  const responsePayload: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      requestId: req.requestId || 'unknown',
      timestamp: new Date().toISOString(),
      durationMs,
      pagination,
    },
  };

  return res.status(statusCode).json(responsePayload);
}

export function sendPaginated<T>(
  req: Request,
  res: Response,
  paginatedResult: PaginatedResult<T>,
  statusCode = 200
): Response<ApiSuccessResponse<T[]>> {
  return sendSuccess(req, res, paginatedResult.items, statusCode, {
    page: paginatedResult.page,
    pageSize: paginatedResult.pageSize,
    total: paginatedResult.total,
    totalPages: paginatedResult.totalPages,
  });
}
