export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Permission {
  id: string;
  code: string;
  module: string;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem: boolean;
  permissions?: Permission[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  status: UserStatus;
  department?: string;
  phone?: string;
  organizationId: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface AuthContext {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  department?: string;
  organizationId: string;
  requestId: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
}
