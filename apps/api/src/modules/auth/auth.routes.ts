import { Router } from 'express';
import {
  login,
  logout,
  getCurrentUser,
  refreshToken,
  changePassword,
} from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '@chikitsaalye/validation';
import { authenticate } from '../../middleware/auth.js';

export const authRouter = Router();

// Public Authentication Endpoints
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/refresh', validateBody(refreshTokenSchema), refreshToken);

// Protected Authentication Endpoints
authRouter.get('/me', authenticate(), getCurrentUser);
authRouter.post('/logout', authenticate(), logout);
authRouter.post('/change-password', authenticate(), validateBody(changePasswordSchema), changePassword);
