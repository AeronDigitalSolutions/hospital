'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { SYSTEM_ROLES, ROLE_PERMISSIONS_MAP, SYSTEM_PERMISSIONS } from '@chikitsaalye/auth';
import {
  ShieldCheck,
  Key,
  CheckCircle2,
  Lock,
  Edit3,
  X,
  Layers,
} from 'lucide-react';

interface RoleItem {
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

const INITIAL_ROLES: RoleItem[] = Object.entries(ROLE_PERMISSIONS_MAP).map(([code, perms]) => ({
  code,
  name: code.replace(/_/g, ' '),
  description: `Standard system role for ${code}`,
  isSystem: true,
  permissions: perms,
}));

export default function RolesAdministrationPage() {
  const [roles, setRoles] = useState<RoleItem[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const handleOpenInspector = (role: RoleItem, edit = false) => {
    setSelectedRole(role);
    setIsEditing(edit);
    setEditPermissions([...role.permissions]);
  };

  const handleTogglePermission = (perm: string) => {
    if (editPermissions.includes(perm)) {
      setEditPermissions(editPermissions.filter((p) => p !== perm));
    } else {
      setEditPermissions([...editPermissions, perm]);
    }
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    setRoles((prev) =>
      prev.map((r) => (r.code === selectedRole.code ? { ...r, permissions: editPermissions } : r))
    );
    setSelectedRole({ ...selectedRole, permissions: editPermissions });
    setIsEditing(false);
  };

  const allAvailablePermissions = Object.values(SYSTEM_PERMISSIONS);

  return (
    <ProtectedRoute requiredRoles={[SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMIN]}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Strip */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              System Administration
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">RBAC Security Console</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Role Hierarchy & Privileges</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure functional authorization matrices across healthcare roles.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const hasWildcard = role.permissions.includes('*');
            return (
              <div
                key={role.code}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{role.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400 block">{role.code}</span>
                      </div>
                    </div>
                    {role.isSystem ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        <Lock className="w-2.5 h-2.5 mr-0.5" /> System
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Custom
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">{role.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {hasWildcard ? (
                        <span className="text-rose-600 font-bold font-mono">ALL (Bypass)</span>
                      ) : (
                        <span>
                          <strong className="text-slate-900">{role.permissions.length}</strong> permissions
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenInspector(role, false)}
                      className="px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded border border-slate-200 font-medium transition-colors"
                    >
                      View
                    </button>
                    {role.code !== SYSTEM_ROLES.SUPER_ADMIN && (
                      <button
                        onClick={() => handleOpenInspector(role, true)}
                        className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded border border-blue-200 font-medium transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inspector / Edit Modal */}
        {selectedRole && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {isEditing ? 'Configure Permissions' : 'Role Permissions Matrix'}: {selectedRole.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">{selectedRole.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                {selectedRole.permissions.includes('*') ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
                    <div className="font-bold flex items-center space-x-1.5">
                      <Lock className="w-4 h-4" />
                      <span>Full Wildcard Root Privileges</span>
                    </div>
                    <p>
                      This role possesses system-level root permissions (<code className="font-bold">*</code>), bypassing all individual resource checks.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      {isEditing ? 'Toggle Permissions for this Role:' : 'Active Assigned Permissions:'}
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {(isEditing ? allAvailablePermissions : selectedRole.permissions).map((perm) => {
                        const isAssigned = isEditing
                          ? editPermissions.includes(perm)
                          : selectedRole.permissions.includes(perm);

                        return (
                          <div
                            key={perm}
                            onClick={() => isEditing && handleTogglePermission(perm)}
                            className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                              isEditing ? 'cursor-pointer' : ''
                            } ${
                              isAssigned
                                ? 'bg-blue-50/60 border-blue-200 text-blue-900 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="font-mono text-[11px]">{perm}</span>
                            {isAssigned && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Audit trail records all permission changes.
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-white"
                  >
                    Close
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleSavePermissions}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-sm"
                    >
                      Save Matrix
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
