'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Home, Users, UserPlus, Database } from 'lucide-react';
import { Button } from '@chikitsaalye/ui';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            HTTP 404 — Clinical Route Not Found
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The requested hospital station, route, or resource is either not configured or has moved.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-left space-y-2">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Available Institutional Portals
          </div>
          <div className="divide-y divide-slate-100">
            <Link
              href="/patients"
              className="flex items-center justify-between py-2 text-sm font-medium text-slate-700 hover:text-teal-700 transition"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                Patient Search &amp; 360 Registry
              </span>
              <span className="text-xs text-teal-600">Open &rarr;</span>
            </Link>
            <Link
              href="/patients/new"
              className="flex items-center justify-between py-2 text-sm font-medium text-slate-700 hover:text-teal-700 transition"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-slate-400" />
                Patient Registration Desk
              </span>
              <span className="text-xs text-teal-600">Open &rarr;</span>
            </Link>
            <Link
              href="/administration/master-data"
              className="flex items-center justify-between py-2 text-sm font-medium text-slate-700 hover:text-teal-700 transition"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                Central Master Data Management
              </span>
              <span className="text-xs text-teal-600">Open &rarr;</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Link href="/patients" className="w-full sm:w-auto">
            <Button
              variant="primary"
              className="w-full sm:w-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              Patient Desk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
