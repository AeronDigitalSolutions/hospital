import jwt from 'jsonwebtoken';
import { env } from '@chikitsaalye/config';
import type { AuthTokens, AuthContext } from '@chikitsaalye/types';

export interface JwtTokenPayload {
  sub: string; // userId
  email: string;
  roles: string[];
  permissions: string[];
  department?: string;
  organizationId: string;
  type: 'access' | 'refresh';
}

export function generateAuthTokens(
  user: {
    id: string;
    email: string;
    department?: string;
    organizationId: string;
  },
  roles: string[],
  permissions: string[]
): AuthTokens {
  const payloadBase = {
    sub: user.id,
    email: user.email,
    roles,
    permissions,
    department: user.department,
    organizationId: user.organizationId,
  };

  const accessToken = jwt.sign(
    { ...payloadBase, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: 900, // 15 mins in seconds
  };
}

export function verifyAccessToken(token: string): JwtTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtTokenPayload;
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type: expected access token');
  }
  return decoded;
}

export function verifyRefreshToken(token: string): { sub: string } {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; type: string };
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type: expected refresh token');
  }
  return { sub: decoded.sub };
}
