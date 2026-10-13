import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';
import { NotFoundError } from '../../middleware/errors.js';
import { authService, StoredUser } from '../auth/auth.service.js';

function sanitizeUser(user: StoredUser) {
  const { passwordHash, mfaSecret, ...safe } = user;
  return safe;
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const role = req.query.role as string | undefined;

    const allUsers = await authService.listUsers({ search, status, role });
    const total = allUsers.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = allUsers.slice(startIndex, startIndex + pageSize).map(sanitizeUser);

    return sendPaginated(req, res, {
      items: paginated,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = authService.getUser(id);
    if (!user) {
      throw new NotFoundError(`User '${id}' not found`);
    }

    return sendSuccess(req, res, sanitizeUser(user));
  } catch (err) {
    return next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.auth?.userId || 'system';
    const newUser = await authService.createUser(req.body, {
      actorId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
    });

    return sendSuccess(req, res, sanitizeUser(newUser), 201);
  } catch (err) {
    return next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const actorId = req.auth?.userId || 'system';

    const updated = await authService.updateUser(id, req.body, {
      actorId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
    });

    return sendSuccess(req, res, sanitizeUser(updated));
  } catch (err) {
    return next(err);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const actorId = req.auth?.userId || 'system';

    const updated = await authService.updateUserStatus(id, status, reason, {
      actorId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
    });

    return sendSuccess(req, res, sanitizeUser(updated));
  } catch (err) {
    return next(err);
  }
}

export async function assignRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { roles } = req.body;
    const actorId = req.auth?.userId || 'system';

    const updated = await authService.updateUser(id, { roles }, {
      actorId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
    });

    return sendSuccess(req, res, sanitizeUser(updated));
  } catch (err) {
    return next(err);
  }
}
