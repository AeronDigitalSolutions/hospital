'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { SYSTEM_ROLES } from '@chikitsaalye/auth';
import type { UserStatus } from '@chikitsaalye/types';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Building,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Clock,
  MoreVertical,
  X,
} from 'lucide-react';

interface StaffUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  department: string;
  status: UserStatus;
  lastLogin: string;
}

const INITIAL_USERS: StaffUser[] = [
  {
    id: 'usr_super_admin',
    username: 'superadmin',
    email: 'superadmin@chikitsaalye.org',
    fullName: 'Super Administrator',
    roles: [SYSTEM_ROLES.SUPER_ADMIN],
    department: 'Hospital IT & Governance',
    status: 'ACTIVE',
    lastLogin: '10 minutes ago',
  },
  {
    id: 'usr_doctor_sharma',
    username: 'dr.sharma',
    email: 'dr.sharma@chikitsaalye.org',
    fullName: 'Dr. S. K. Sharma',
    roles: [SYSTEM_ROLES.DOCTOR],
    department: 'General Medicine',
    status: 'ACTIVE',
    lastLogin: '2 hours ago',
  },
  {
    id: 'usr_nurse_anita',
    username: 'nurse.anita',
    email: 'nurse.anita@chikitsaalye.org',
    fullName: 'Sister Anita Verma',
    roles: [SYSTEM_ROLES.NURSE],
    department: 'Emergency & Triage',
    status: 'ACTIVE',
    lastLogin: '45 minutes ago',
  },
  {
    id: 'usr_reg_desk',
    username: 'reg.desk',
    email: 'reception@chikitsaalye.org',
    fullName: 'Vikas Kumar',
    roles: [SYSTEM_ROLES.REGISTRATION_DESK],
    department: 'Central Registration Desk',
    status: 'ACTIVE',
    lastLogin: 'Yesterday',
  },
  {
    id: 'usr_billing_op',
    username: 'billing.user',
    email: 'billing@chikitsaalye.org',
    fullName: 'Rajesh Gupta',
    roles: [SYSTEM_ROLES.BILLING_OPERATOR],
    department: 'Central Cashier & Billing',
    status: 'ACTIVE',
    lastLogin: '3 days ago',
  },
  {
    id: 'usr_suspended_doc',
    username: 'suspended.user',
    email: 'suspended@chikitsaalye.org',
    fullName: 'Suspended Clinician',
    roles: [SYSTEM_ROLES.DOCTOR],
    department: 'General Surgery',
    status: 'SUSPENDED',
    lastLogin: '2 weeks ago',
  },
  {
    id: 'usr_disabled_staff',
    username: 'disabled.user',
    email: 'disabled@chikitsaalye.org',
    fullName: 'Disabled Staff Member',
    roles: [SYSTEM_ROLES.REGISTRATION_DESK],
    department: 'Housekeeping',
    status: 'DISABLED',
    lastLogin: '1 month ago',
  },
];

export default function UsersAdministrationPage() {
  const [users, setUsers] = useState<StaffUser[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState<{
    username: string;
    fullName: string;
    email: string;
    department: string;
    role: string;
  }>({
    username: '',
    fullName: '',
    email: '',
    department: 'General Medicine',
    role: SYSTEM_ROLES.DOCTOR,
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.roles.includes(roleFilter);

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.fullName || !newUser.email) return;

    const created: StaffUser = {
      id: `usr_${Date.now()}`,
      username: newUser.username.trim(),
      fullName: newUser.fullName.trim(),
      email: newUser.email.trim(),
      department: newUser.department,
      roles: [newUser.role],
      status: 'ACTIVE',
      lastLogin: 'Never',
    };

    setUsers([created, ...users]);
    setShowInviteModal(false);
    setNewUser({
      username: '',
      fullName: '',
      email: '',
      department: 'General Medicine',
      role: SYSTEM_ROLES.DOCTOR,
    });
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> Suspended
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3 h-3 mr-1" /> Disabled
          </span>
        );
      case 'INVITED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 mr-1" /> Invited
          </span>
        );
      default:
        return <span className="text-slate-500">{status}</span>;
    }
  };

  return (
    <ProtectedRoute requiredRoles={[SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMIN]}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                System Administration
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">RBAC Security Console</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">User Accounts Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision, assign clinical roles, and manage lifecycle status for hospital personnel.
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision / Invite User</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by full name, username, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DISABLED">Disabled</option>
              <option value="INVITED">Invited</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value={SYSTEM_ROLES.SUPER_ADMIN}>Super Admin</option>
              <option value={SYSTEM_ROLES.DOCTOR}>Doctor</option>
              <option value={SYSTEM_ROLES.NURSE}>Nurse</option>
              <option value={SYSTEM_ROLES.REGISTRATION_DESK}>Registration Desk</option>
              <option value={SYSTEM_ROLES.BILLING_OPERATOR}>Billing Operator</option>
            </select>
          </div>
        </div>

        {/* Users Directory Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Roles</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{user.fullName}</span>
                            <span className="text-slate-400 font-mono text-[11px]">@{user.username} • {user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 text-slate-600">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.department}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((r) => (
                            <span
                              key={r}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              <Shield className="w-2.5 h-2.5 mr-1 text-slate-500" />
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{user.lastLogin}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {user.status !== 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                              className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          {user.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                              className="px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                          {user.status !== 'DISABLED' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'DISABLED')}
                              className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                            >
                              Disable
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Provision New Hospital Staff Account</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Khanna"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. dr.khanna"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Official Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. r.khanna@chikitsaalye.org"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Clinical Department</label>
                    <select
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="General Surgery">General Surgery</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Emergency & Trauma">Emergency & Trauma</option>
                      <option value="Administration">Hospital Administration</option>
                      <option value="Central Registration">Central Registration</option>
                      <option value="Cash & Billing">Cash & Billing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Assigned Security Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value={SYSTEM_ROLES.DOCTOR}>DOCTOR (Clinical Workspaces)</option>
                      <option value={SYSTEM_ROLES.NURSE}>NURSE (Ward & Vitals)</option>
                      <option value={SYSTEM_ROLES.REGISTRATION_DESK}>REGISTRATION_DESK (MPI Access)</option>
                      <option value={SYSTEM_ROLES.BILLING_OPERATOR}>BILLING_OPERATOR (Revenue Desk)</option>
                      <option value={SYSTEM_ROLES.HOSPITAL_ADMIN}>HOSPITAL_ADMIN (Full Ops)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-700">
                  A temporary password invitation will be created with mandatory change on first login.
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Provision Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
