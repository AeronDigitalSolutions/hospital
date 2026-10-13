'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { SYSTEM_ROLES } from '@chikitsaalye/auth';
import { Hospital, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      router.push('/patients');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: string, username: string) => {
    switchDemoUser(role);
    router.push('/patients');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Hospital Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white shadow-lg ring-2 ring-blue-400">
            <Hospital className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Chikitsaalye</h1>
          <p className="text-xs text-blue-400 font-mono">
            Uttar Pradesh University of Medical Sciences (UPUMS)
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Hospital Portal Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter official hospital ID or patient credentials to continue.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Username or Official Email</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. dr.sharma or reception@chikitsaalye.org"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Clinical Workstation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Simulation Roles */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick Role Simulation
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin(SYSTEM_ROLES.DOCTOR, 'dr.sharma')}
                className="p-2 border border-slate-200 hover:border-blue-400 rounded-lg text-left hover:bg-blue-50/50 transition-colors"
              >
                <span className="font-bold text-slate-900 block text-[11px]">Dr. S. K. Sharma</span>
                <span className="text-[10px] text-blue-600 font-mono">DOCTOR</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(SYSTEM_ROLES.NURSE, 'nurse.anita')}
                className="p-2 border border-slate-200 hover:border-blue-400 rounded-lg text-left hover:bg-blue-50/50 transition-colors"
              >
                <span className="font-bold text-slate-900 block text-[11px]">Sister Anita</span>
                <span className="text-[10px] text-blue-600 font-mono">NURSE</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(SYSTEM_ROLES.REGISTRATION_DESK, 'reg.desk')}
                className="p-2 border border-slate-200 hover:border-blue-400 rounded-lg text-left hover:bg-blue-50/50 transition-colors"
              >
                <span className="font-bold text-slate-900 block text-[11px]">Vikas Kumar</span>
                <span className="text-[10px] text-blue-600 font-mono">REG_DESK</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(SYSTEM_ROLES.BILLING_OPERATOR, 'billing.user')}
                className="p-2 border border-slate-200 hover:border-blue-400 rounded-lg text-left hover:bg-blue-50/50 transition-colors"
              >
                <span className="font-bold text-slate-900 block text-[11px]">Rajesh Gupta</span>
                <span className="text-[10px] text-blue-600 font-mono">BILLING</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(SYSTEM_ROLES.SUPER_ADMIN, 'superadmin')}
                className="p-2 border border-slate-200 hover:border-blue-400 rounded-lg text-left hover:bg-blue-50/50 transition-colors"
              >
                <span className="font-bold text-slate-900 block text-[11px]">System Admin</span>
                <span className="text-[10px] text-blue-600 font-mono">SUPER_ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(SYSTEM_ROLES.PATIENT, 'patient.ramesh')}
                className="p-2 border border-slate-200 hover:border-blue-400 rounded-lg text-left hover:bg-blue-50/50 transition-colors"
              >
                <span className="font-bold text-slate-900 block text-[11px]">Ramesh Verma</span>
                <span className="text-[10px] text-emerald-600 font-mono">PATIENT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 font-mono">
          Security: TLS 1.3 • AES-256 GCM • ABHA/NDHM Ready
        </p>
      </div>
    </div>
  );
}
