import { z } from 'zod';

export const userStatusEnum = z.enum(['ACTIVE', 'INVITED', 'SUSPENDED', 'DISABLED', 'INACTIVE']);

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(3, 'Username or email must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token is required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  roles: z.array(z.string()).min(1, 'At least one role must be assigned'),
  department: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  patientId: z.string().optional(),
  status: userStatusEnum.default('ACTIVE'),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  roles: z.array(z.string()).optional(),
  status: userStatusEnum.optional(),
  patientId: z.string().nullable().optional(),
});

export const updateUserStatusSchema = z.object({
  status: userStatusEnum,
  reason: z.string().optional(),
});

export const createRoleSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/, 'Role code must be uppercase alphanumeric and underscores'),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export const updateRolePermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
