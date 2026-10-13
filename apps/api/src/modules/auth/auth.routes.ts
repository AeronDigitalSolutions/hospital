import { Router } from 'express';
import { login, getCurrentUser, refreshToken } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { loginSchema, refreshTokenSchema } from '@chikitsaalye/validation';
import { authenticate } from '../../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), login);
authRouter.get('/me', authenticate(), getCurrentUser);
authRouter.post('/refresh', validateBody(refreshTokenSchema), refreshToken);
