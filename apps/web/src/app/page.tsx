'use client';

import React, { useState } from 'react';
import {
  PageContainer,
  AlertBanner,
  DataTable,
  Badge,
  Button,
  Input,
  Select,
  Textarea,
  FormField,
  Modal,
  LoadingState,
  EmptyState,
  ErrorState,
  PermissionDeniedState,
} from '@chikitsaalye/ui';
import {
  ShieldCheck,
  Server,
  Database,
  Building,
  KeyRound,
  FileCode,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'states' | 'forms' | 'table'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample data demonstrating the Reusable Table
  const sampleModules = [
    { code: 'AUTH', name: 'Identity & Access Control', status: 'READY', phase: 'CODEx-001' },
    { code: 'PATIENTS', name: 'Master Patient Index (UHID)', status: 'SCHEDULED', phase: 'CODEx-002' },
    { code: 'ENCOUNTERS', name: 'Patient Encounters & Visits', status: 'SCHEDULED', phase: 'CODEx-002' },
    { code: 'AUTH_RBAC', name: 'Granular Role-Based Access', status: 'SCHEDULED', phase: 'CODEx-003' },
    { code: 'OPD', name: 'Outpatient Queue & Consultation', status: 'SCHEDULED', phase: 'CODEx-004' },
    { code: 'EMERGENCY', name: 'Emergency Triage & Resuscitation', status: 'SCHEDULED', phase: 'CODEx-005' },
    { code: 'BILLING', name: 'Tariffs, Cashier & PMJAY Claims', status: 'SCHEDULED', phase: 'CODEx-006' },
  ];

  const tableColumns = [
    { key: 'code', header: 'Module Key', sortable: true },
    { key: 'name', header: 'Subsystem Name', sortable: true },
    {
      key: 'status',
      header: 'Foundation Status',
      render: (row: any) => (
        <Badge variant={row.status === 'READY' ? 'emerald' : 'blue'}>
          {row.status}
        </Badge>
      ),
    },
    { key: 'phase', header: 'Target Roadmap' },
  ];

  return (
    <PageContainer
      title="Hospital Operating System — Architectural Bootstrap"
      subtitle="UPUMS Teaching Hospital & Research Center • Core System Foundation"
      breadcrumbs={[{ label: 'System Architecture', current: true }]}
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
            View Facility Context
          </Button>
          <Button variant="primary" size="sm" onClick={() => window.open('/api/v1/health', '_blank')}>
            <Server className="w-3.5 h-3.5 mr-1.5" />
            Check API Health
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* System Alert Notification */}
        <AlertBanner
          type="info"
          title="Chikitsaalye CODEx-001 Bootstrap Active"
          message="Repository boundaries, database migration foundation, API versioning (/api/v1), and enterprise hospital shell established. Ready for CODEx-002 Patient Master & Encounter schema."
        />

        {/* Foundation Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-4">
            {(
              [
                { id: 'overview', label: 'Architecture Overview' },
                { id: 'table', label: 'Reusable Table & Modules' },
                { id: 'states', label: 'UI Feedback & Error States' },
                { id: 'forms', label: 'Form Components' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Modular Monolith</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clean boundaries established across 24 clinical, diagnostics, financial, and governance subsystems under apps/api/src/modules.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-400">
                apps/api • /api/v1/*
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Database Foundation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Prisma 5 ORM with PostgreSQL 16 schema for Hospital Organizations, Users, Roles, Granular Permissions, and Audit Trails.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-400">
                packages/database • PostgreSQL
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="w-9 h-9 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Audit & Governance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Request-ID correlation tracking, audit trail abstraction, idempotency protection for mutations, and standardized error envelopes.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-400">
                x-request-id • x-idempotency-key
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reusable Table */}
        {activeTab === 'table' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Subsystem Manifest</h3>
                <p className="text-xs text-slate-500">
                  Standardized high-density table component for hospital operational lists.
                </p>
              </div>
            </div>
            <DataTable
              columns={tableColumns}
              data={sampleModules}
              page={1}
              totalPages={1}
            />
          </div>
        )}

        {/* Tab 3: Feedback States */}
        {activeTab === 'states' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">1. Loading State (Clinical Pulse)</h4>
              <div className="bg-white border border-slate-200 rounded-lg">
                <LoadingState
                  message="Fetching Emergency Triage Queue..."
                  subMessage="Synchronizing patient vital signs with telemetry unit"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">2. Empty State</h4>
              <EmptyState
                title="No Inpatient Bed Transfers Pending"
                description="All ward transfer requests have been processed by the nursing supervisor."
                actionLabel="Create Transfer Order"
                onAction={() => alert('Transfer modal triggered')}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">3. Standardized Error State</h4>
              <ErrorState
                message="PACS DICOM imaging server timed out during study retrieval."
                errorCode="DICOM_GATEWAY_TIMEOUT"
                requestId="req_8f7b2c9d01a"
                onRetry={() => alert('Retrying DICOM connection')}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">4. Permission Denied State</h4>
              <PermissionDeniedState
                moduleName="Pharmacy Controlled Substance Formulary"
                requiredPermission="pharmacy:dispense_narcotics"
                onBack={() => setActiveTab('overview')}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Reusable Forms */}
        {activeTab === 'forms' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Reusable Form Foundation</h3>
            <p className="text-xs text-slate-500">
              Enterprise clinical inputs with consistent focus rings, error states, and keyboard accessibility.
            </p>

            <FormField label="Universal Health ID (UHID)" required hint="14-digit ABDM / UPUMS identifier">
              <Input placeholder="e.g. 2024-UPUMS-009182" />
            </FormField>

            <FormField label="Assigned Department" required>
              <Select
                options={[
                  { value: 'EMERGENCY', label: 'Emergency & Trauma Care' },
                  { value: 'OPD_MEDICINE', label: 'OPD — General Medicine' },
                  { value: 'ICU_CARDIAC', label: 'ICU — Cardiac Care' },
                  { value: 'OT_NEURO', label: 'OT — Neurosurgery Suite 1' },
                ]}
              />
            </FormField>

            <FormField label="Clinical Triage Notes" hint="Chief complaints and initial nursing observation">
              <Textarea rows={3} placeholder="Enter clinical observations..." />
            </FormField>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button variant="primary" size="sm">Save Clinical Entry</Button>
            </div>
          </div>
        )}
      </div>

      {/* Facility Context Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Hospital Organization Profile"
        description="Active institutional context for Chikitsaalye Health OS"
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
            Close Profile
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded">
            <Building className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-bold text-slate-900 text-xs">Uttar Pradesh University of Medical Sciences</div>
              <div className="text-[11px] text-slate-500">UPUMS Teaching Hospital & Medical Institute</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-400 block text-[10px] uppercase">Facility Code</span>
              <span className="font-bold font-mono text-slate-800">UPUMS-MAIN</span>
            </div>
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-400 block text-[10px] uppercase">Timezone</span>
              <span className="font-bold font-mono text-slate-800">Asia/Kolkata</span>
            </div>
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-400 block text-[10px] uppercase">Total Capacity</span>
              <span className="font-bold text-slate-800">1,050 Inpatient Beds</span>
            </div>
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-400 block text-[10px] uppercase">Location</span>
              <span className="font-bold text-slate-800">Saifai, Etawah, UP</span>
            </div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
