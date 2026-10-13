'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { SYSTEM_ROLES, ROLE_PERMISSIONS_MAP, SYSTEM_PERMISSIONS } from '@chikitsaalye/auth';
import { Key, Search, Shield, Layers, CheckCircle } from 'lucide-react';

interface PermissionEntry {
  code: string;
  module: string;
  action: string;
  description: string;
  heldByRoles: string[];
}

export default function PermissionsCataloguePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  const permissionsList: PermissionEntry[] = Object.values(SYSTEM_PERMISSIONS).map((code) => {
    const [module, action] = code.split('.');

    // Find which roles have this permission
    const heldByRoles = Object.entries(ROLE_PERMISSIONS_MAP)
      .filter(([rCode, perms]) => perms.includes('*') || perms.includes(code))
      .map(([rCode]) => rCode);

    return {
      code,
      module: module || 'SYSTEM',
      action: action || 'OPERATE',
      description: `Grants capability to execute ${action?.toLowerCase()} on ${module?.toLowerCase()} domain entities.`,
      heldByRoles,
    };
  });

  const modules = Array.from(new Set(permissionsList.map((p) => p.module)));

  const filtered = permissionsList.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === 'ALL' || p.module === selectedModule;
    return matchesSearch && matchesModule;
  });

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Granular Permissions Catalogue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive registry of fine-grained <code className="font-mono text-blue-600">RESOURCE.ACTION</code> permissions protecting clinical endpoints.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by permission code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Functional Modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m} Module
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Permissions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Permission Code</th>
                  <th className="py-3 px-4">Functional Domain</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Authorized Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 font-mono font-bold text-blue-700">
                        <Key className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span>{item.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {item.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md">{item.description}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {item.heldByRoles.includes('SUPER_ADMIN') && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            SUPER_ADMIN
                          </span>
                        )}
                        {item.heldByRoles
                          .filter((r) => r !== 'SUPER_ADMIN')
                          .map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              <Shield className="w-2.5 h-2.5 mr-0.5" />
                              {role}
                            </span>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
