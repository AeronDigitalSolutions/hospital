'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallback,
}) => {
  const { user, hasPermission, hasRole } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Authentication Required</h2>
            <p className="text-xs text-slate-500 mt-1">
              Please sign in with your hospital staff credentials to access this workstation.
            </p>
          </div>
          <a
            href="/auth/login"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Go to Clinical Login
          </a>
        </div>
      </div>
    );
  }

  // Check roles
  if (requiredRoles.length > 0) {
    const hasAny = requiredRoles.some((r) => hasRole(r));
    if (!hasAny) {
      return (
        fallback || (
          <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-xl border border-rose-200 shadow-sm p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your current role (<span className="font-semibold text-rose-600">{user.roles.join(', ')}</span>) lacks authorization for this module.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 text-left border border-slate-100">
                <span className="font-bold text-slate-700 block mb-1">Required Authorized Roles:</span>
                <span className="font-mono text-slate-600">{requiredRoles.join(' | ')}</span>
              </div>
              <a
                href="/patients"
                className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to MPI Workstation</span>
              </a>
            </div>
          </div>
        )
      );
    }
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const missing = requiredPermissions.filter((p) => !hasPermission(p));
    if (missing.length > 0) {
      return (
        fallback || (
          <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-xl border border-rose-200 shadow-sm p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Permission Denied</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Server-side authorization policy prevents your account from executing this operation.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 text-left border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700 block">Missing Security Permissions:</span>
                <ul className="list-disc pl-4 font-mono text-[10px] text-rose-600">
                  {missing.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              <a
                href="/patients"
                className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to MPI Workstation</span>
              </a>
            </div>
          </div>
        )
      );
    }
  }

  return <>{children}</>;
};

export const PermissionGate: React.FC<{
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};
