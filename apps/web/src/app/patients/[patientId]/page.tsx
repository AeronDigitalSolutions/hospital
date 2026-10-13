'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
} from '@chikitsaalye/ui';
import {
  User,
  HeartPulse,
  Activity,
  AlertTriangle,
  Calendar,
  FileText,
  Clock,
  Shield,
  Pill,
  Stethoscope,
  Plus,
  RefreshCw,
  FolderOpen,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Phone,
  Home,
  CreditCard,
  Building2,
} from 'lucide-react';

export default function Patient360Page() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'clinical'
    | 'history'
    | 'vitals'
    | 'diagnosis'
    | 'orders'
    | 'prescription'
    | 'reports'
    | 'documents'
    | 'timeline'
  >('overview');

  // New Encounter Modal State
  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);
  const [isCreatingEncounter, setIsCreatingEncounter] = useState(false);
  const [encounterForm, setEncounterForm] = useState({
    type: 'OPD',
    priority: 'ROUTINE',
    department: 'GENERAL_MEDICINE',
    reasonForVisit: '',
  });

  const fetchPatient360 = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/patients/${patientId}/360`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || 'Failed to load patient 360 profile');
      }
    } catch (err: any) {
      setError(err.message || 'Error querying patient 360 endpoint');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatient360();
    }
  }, [patientId]);

  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encounterForm.reasonForVisit.trim()) return;

    setIsCreatingEncounter(true);
    try {
      const res = await fetch('/api/v1/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: data?.patient?.id,
          type: encounterForm.type,
          priority: encounterForm.priority,
          department: encounterForm.department,
          reasonForVisit: encounterForm.reasonForVisit,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsEncounterModalOpen(false);
        setEncounterForm({
          type: 'OPD',
          priority: 'ROUTINE',
          department: 'GENERAL_MEDICINE',
          reasonForVisit: '',
        });
        fetchPatient360();
      } else {
        alert(json.error?.message || 'Failed to initialize encounter');
      }
    } catch (err: any) {
      alert(err.message || 'Network error creating encounter');
    } finally {
      setIsCreatingEncounter(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Patient 360 Clinical Cockpit">
        <div className="bg-white p-12 border border-slate-200 rounded-lg">
          <LoadingState
            message="Assembling Patient 360 Longitudinal Record..."
            subMessage="Querying canonical identifiers, clinical flags, and encounters"
          />
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer title="Patient 360 Clinical Cockpit">
        <ErrorState
          title="Unable to Access Patient 360 Record"
          message={error || 'Patient record could not be loaded'}
          onRetry={fetchPatient360}
        />
      </PageContainer>
    );
  }

  const { patient, clinicalAlerts, encountersSummary } = data;

  const encounterColumns = [
    {
      key: 'encounterNumber',
      header: 'Encounter No.',
      sortable: true,
      render: (row: any) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.encounterNumber}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row: any) => (
        <Badge variant={row.type === 'EMERGENCY' ? 'rose' : row.type === 'IPD' ? 'purple' : 'blue'}>
          {row.type}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department / Unit',
      render: (row: any) => <span className="font-semibold text-slate-700">{row.department}</span>,
    },
    {
      key: 'reasonForVisit',
      header: 'Chief Complaint',
      render: (row: any) => <span className="text-slate-600 line-clamp-1">{row.reasonForVisit}</span>,
    },
    {
      key: 'startTime',
      header: 'Encounter Date',
      render: (row: any) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {new Date(row.startTime).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => (
        <Badge
          variant={
            row.status === 'COMPLETED'
              ? 'emerald'
              : row.status === 'IN_PROGRESS'
              ? 'blue'
              : row.status === 'CANCELLED'
              ? 'slate'
              : 'amber'
          }
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <PageContainer
      title={patient.fullName}
      subtitle={`Canonical UHID: ${patient.uhid} • Registered ${new Date(patient.createdAt).toLocaleDateString()}`}
      breadcrumbs={[
        { label: 'Patients', href: '/patients' },
        { label: patient.uhid, current: true },
      ]}
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchPatient360}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Sync
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsEncounterModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Clinical Encounter
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Canonical Header Cockpit */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg ring-4 ring-blue-50">
                {patient.firstName.charAt(0)}
                {patient.lastName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-900">{patient.fullName}</h2>
                  <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                    {patient.uhid}
                  </span>
                  <Badge variant={patient.status === 'ACTIVE' ? 'emerald' : 'slate'}>
                    {patient.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  <span>
                    <strong>Age:</strong> {patient.ageYears} Years ({new Date(patient.dateOfBirth).toLocaleDateString()})
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Gender:</strong> {patient.gender}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Blood Group:</strong>{' '}
                    <span className="font-semibold text-rose-600">
                      {patient.bloodGroup?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Primary Mobile:</strong> {patient.primaryPhone || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-center px-2">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Total Encounters</span>
                <span className="font-bold text-sm text-slate-800">{encountersSummary.totalEncounters}</span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="text-center px-2">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Open Visits</span>
                <span className="font-bold text-sm text-emerald-600">{encountersSummary.openEncountersCount}</span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="text-center px-2">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Active Allergies</span>
                <span className="font-bold text-sm text-rose-600">{clinicalAlerts.allergiesCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Alerts Strip */}
        {(clinicalAlerts.allergiesCount > 0 || clinicalAlerts.chronicConditionsCount > 0) && (
          <div className="space-y-2">
            {clinicalAlerts.allergiesCount > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md flex items-start space-x-3 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <span className="font-bold text-rose-900 mr-2">CLINICAL ALLERGY ALERT:</span>
                  <span className="text-rose-800">
                    Patient has {clinicalAlerts.allergiesCount} recorded active allergies:{' '}
                    {clinicalAlerts.activeAllergies.map((a: any, i: number) => (
                      <span key={i} className="font-bold inline-block mr-2">
                        • {a.allergen} ({a.severity}
                        {a.reaction ? ` — ${a.reaction}` : ''})
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            )}

            {clinicalAlerts.chronicConditionsCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start space-x-3 text-xs">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-amber-900 mr-2">CHRONIC CONDITIONS / RISK FLAGS:</span>
                  <span className="text-amber-800">
                    {clinicalAlerts.activeConditions.map((c: any, i: number) => (
                      <span key={i} className="font-semibold inline-block mr-3">
                        • {c.conditionName}
                        {c.conditionCode ? ` [${c.conditionCode}]` : ''}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation (10 Canonical Sub-Domains) */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-2 overflow-x-auto scrollbar-thin">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'clinical', label: 'Clinical & Flags' },
              { id: 'history', label: 'Encounters' },
              { id: 'vitals', label: 'Vitals' },
              { id: 'diagnosis', label: 'Diagnosis' },
              { id: 'orders', label: 'Orders' },
              { id: 'prescription', label: 'Prescriptions' },
              { id: 'reports', label: 'Reports' },
              { id: 'documents', label: 'Documents' },
              { id: 'timeline', label: 'Timeline' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
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
            <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Demographics & Master Record</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Legal Name</span>
                  <span className="font-semibold text-slate-800">{patient.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Gender / DOB</span>
                  <span className="font-semibold text-slate-800">
                    {patient.gender} • {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nationality</span>
                  <span className="font-semibold text-slate-800">{patient.nationality}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Marital Status</span>
                  <span className="font-semibold text-slate-800">{patient.maritalStatus || '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Occupation</span>
                  <span className="font-semibold text-slate-800">{patient.occupation || '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Institutional & External Identifiers</span>
              </h3>
              <div className="space-y-2 text-xs">
                {patient.identifiers?.map((ident: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200"
                  >
                    <div>
                      <span className="block font-semibold text-slate-700">{ident.type}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {ident.issuingAuthority || 'Local'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-blue-700">{ident.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
                <Home className="w-3.5 h-3.5 text-blue-600" />
                <span>Contact & Emergency</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block">Registered Address</span>
                  <span className="text-slate-700 leading-relaxed">
                    {patient.addresses?.[0]
                      ? `${patient.addresses[0].addressLine1}, ${patient.addresses[0].city}, ${patient.addresses[0].district}, ${patient.addresses[0].state} - ${patient.addresses[0].postalCode}`
                      : 'No address registered'}
                  </span>
                </div>

                {patient.emergencyContacts?.[0] && (
                  <div className="p-2 rounded bg-rose-50/50 border border-rose-200">
                    <span className="text-[10px] text-rose-500 uppercase block font-semibold">
                      Emergency Contact (Next of Kin)
                    </span>
                    <div className="font-bold text-slate-800">
                      {patient.emergencyContacts[0].name} ({patient.emergencyContacts[0].relationship})
                    </div>
                    <div className="font-mono text-slate-600">{patient.emergencyContacts[0].phone}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clinical & Flags */}
        {activeTab === 'clinical' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase text-slate-700 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Documented Allergies</span>
                </h3>
                <Badge variant="rose">{patient.allergies?.length || 0}</Badge>
              </div>

              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="space-y-2">
                  {patient.allergies.map((al: any, i: number) => (
                    <div key={i} className="p-3 rounded bg-rose-50/50 border border-rose-200 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{al.allergen}</span>
                        <Badge variant="rose" size="sm">
                          {al.severity}
                        </Badge>
                      </div>
                      <div className="text-slate-600 mt-1">
                        Reaction: {al.reaction || 'Not specified'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Allergies Recorded"
                  description="No active drug, food, or environmental allergies are documented for this patient."
                />
              )}
            </div>

            <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase text-slate-700 flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span>Chronic Conditions</span>
                </h3>
                <Badge variant="blue">{patient.conditions?.length || 0}</Badge>
              </div>

              {patient.conditions && patient.conditions.length > 0 ? (
                <div className="space-y-2">
                  {patient.conditions.map((cond: any, i: number) => (
                    <div key={i} className="p-3 rounded bg-blue-50/50 border border-blue-200 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{cond.conditionName}</span>
                        <span className="font-mono text-slate-500">{cond.conditionCode || ''}</span>
                      </div>
                      <div className="text-slate-600 mt-1">Status: {cond.clinicalStatus}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Chronic Conditions"
                  description="No chronic clinical problems or comorbidities documented in master record."
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Encounters */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hospital Visits & Encounters</h3>
                <p className="text-xs text-slate-500">
                  Chronological history of OPD consultations, emergency admissions, and inpatient stays
                </p>
              </div>
              <Button size="sm" variant="primary" onClick={() => setIsEncounterModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Encounter
              </Button>
            </div>

            <DataTable
              columns={encounterColumns}
              data={encountersSummary.recentEncounters || []}
              emptyTitle="No Encounters Yet"
              emptyDescription="No clinical visits or encounters have been initiated for this patient."
            />
          </div>
        )}

        {/* Other Tabs: Clinical Stubs Ready for Subsequent CODEx Phases */}
        {['vitals', 'diagnosis', 'orders', 'prescription', 'reports', 'documents', 'timeline'].includes(
          activeTab
        ) && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <EmptyState
              title={`${activeTab.toUpperCase()} Subsystem Ready`}
              description={`The canonical Patient Master (${patient.uhid}) is established and ready to anchor ${activeTab} data in subsequent clinical modules.`}
            />
          </div>
        )}
      </div>

      {/* New Encounter Dialog */}
      <Modal
        isOpen={isEncounterModalOpen}
        onClose={() => setIsEncounterModalOpen(false)}
        title="Initialize Clinical Encounter"
        description={`Create a new clinical visit for ${patient.fullName} (${patient.uhid})`}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEncounterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreatingEncounter}
              onClick={handleCreateEncounter}
            >
              Confirm & Start Encounter
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateEncounter} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Encounter Type" required>
              <Select
                value={encounterForm.type}
                onChange={(e) => setEncounterForm({ ...encounterForm, type: e.target.value })}
                options={[
                  { value: 'OPD', label: 'OPD — Outpatient Consultation' },
                  { value: 'EMERGENCY', label: 'Emergency & Trauma Triage' },
                  { value: 'IPD', label: 'IPD — Inpatient Ward Admission' },
                  { value: 'DAY_CARE', label: 'Day Care Procedure' },
                  { value: 'TELEMEDICINE', label: 'Telemedicine Consultation' },
                  { value: 'FOLLOW_UP', label: 'Follow Up Visit' },
                ]}
              />
            </FormField>

            <FormField label="Triage Priority" required>
              <Select
                value={encounterForm.priority}
                onChange={(e) => setEncounterForm({ ...encounterForm, priority: e.target.value })}
                options={[
                  { value: 'ROUTINE', label: 'Routine' },
                  { value: 'URGENT', label: 'Urgent' },
                  { value: 'EMERGENCY', label: 'Emergency (Red)' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Target Department / Specialty" required>
            <Select
              value={encounterForm.department}
              onChange={(e) => setEncounterForm({ ...encounterForm, department: e.target.value })}
              options={[
                { value: 'GENERAL_MEDICINE', label: 'General Medicine' },
                { value: 'EMERGENCY_TRAUMA', label: 'Emergency & Trauma Care' },
                { value: 'CARDIOLOGY', label: 'Cardiology' },
                { value: 'NEUROLOGY', label: 'Neurology' },
                { value: 'PEDIATRICS', label: 'Pediatrics' },
                { value: 'ORTHOPEDICS', label: 'Orthopedics' },
                { value: 'GENERAL_SURGERY', label: 'General Surgery' },
              ]}
            />
          </FormField>

          <FormField label="Chief Complaint / Reason for Visit" required>
            <Textarea
              required
              rows={3}
              value={encounterForm.reasonForVisit}
              onChange={(e) =>
                setEncounterForm({ ...encounterForm, reasonForVisit: e.target.value })
              }
              placeholder="e.g. Acute severe abdominal pain radiating to back for 6 hours..."
            />
          </FormField>
        </form>
      </Modal>
    </PageContainer>
  );
}
