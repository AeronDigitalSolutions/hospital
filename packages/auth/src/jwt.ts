import jwt from 'jsonwebtoken';
import { env } from '@chikitsaalye/config';
import type { AuthTokens } from '@chikitsaalye/types';

export interface JwtTokenPayload {
  sub: string; // userId
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  status: string;
  patientId?: string | null;
  department?: string | null;
  organizationId: string;
  sessionId?: string;
  mfaVerified?: boolean;
  type: 'access' | 'refresh';
}

export function generateAuthTokens(
  user: {
    id: string;
    email: string;
    username: string;
    status?: string;
    patientId?: string | null;
    department?: string | null;
    organizationId: string;
  },
  roles: string[],
  permissions: string[],
  sessionId?: string
): AuthTokens {
  const payloadBase = {
    sub: user.id,
    username: user.username,
    email: user.email,
    roles,
    permissions,
    status: user.status || 'ACTIVE',
    patientId: user.patientId || null,
    department: user.department || null,
    organizationId: user.organizationId,
    sessionId: sessionId || undefined,
    mfaVerified: false,
  };

  const accessToken = jwt.sign(
    { ...payloadBase, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, sessionId, type: 'refresh' },
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

export function verifyRefreshToken(token: string): { sub: string; sessionId?: string } {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
    sub: string;
    sessionId?: string;
    type: string;
  };
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type: expected refresh token');
  }
  return { sub: decoded.sub, sessionId: decoded.sessionId };
}
