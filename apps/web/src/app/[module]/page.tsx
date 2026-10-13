'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  PageContainer,
  AlertBanner,
  Badge,
  Button,
} from '@chikitsaalye/ui';
import {
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Database,
  Users,
  CheckCircle2,
  Stethoscope,
  Syringe,
  Bed,
  HeartPulse,
  Scissors,
  FileCheck2,
  FlaskConical,
  Scan,
  Pill,
  CreditCard,
  FileText,
  BarChart3,
  Calendar,
  Activity,
  Share2,
  Hospital,
  AlertTriangle,
} from 'lucide-react';
import { ProtectedRoute } from '../../components/ProtectedRoute';

interface ModuleMeta {
  name: string;
  department: string;
  phase: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  blueprintRole: string;
  activeAnchors: string[];
  deliverables: string[];
}

const MODULE_REGISTRY: Record<string, ModuleMeta> = {
  nursing: {
    name: 'Nursing Station & Inpatient Ward Care',
    department: 'Clinical Nursing Services',
    phase: 'CODEx-008',
    icon: Syringe,
    description: 'Inpatient ward nursing desk, vital signs flowsheets, medication administration records (eMAR), and shift handover logs.',
    blueprintRole: 'NURSE, ICU_STAFF, OT_STAFF',
    activeAnchors: ['Canonical Patient Master (UHID)', 'Master Wards, Rooms & Beds', 'Institutional Staff & Roles'],
    deliverables: ['Nurse Bedside Vitals Charting', 'Doctor Order Execution & Verification', 'Shift Handover & Patient Notes'],
  },
  opd: {
    name: 'Outpatient Department (OPD) Consultations',
    department: 'General & Specialty Clinics',
    phase: 'CODEx-006 (Upcoming Next)',
    icon: Stethoscope,
    description: 'Doctor consultation desk, chief complaint capture, clinical examination, ICD-10 provisional diagnosis, and CPOE order entry.',
    blueprintRole: 'DOCTOR, CONSULTANT',
    activeAnchors: ['Canonical Patient Master (UHID)', 'Master Medical Specialties', 'Diagnostic Services Master'],
    deliverables: ['Clinic Patient Queue Management', 'Clinical Consultation Notes', 'e-Prescription & Lab Orders'],
  },
  emergency: {
    name: 'Emergency & Trauma Triage',
    department: 'Emergency & Acute Care',
    phase: 'CODEx-007',
    icon: HeartPulse,
    description: 'High-acuity triage (Red/Amber/Green), rapid resuscitation documentation, and priority admission workflows.',
    blueprintRole: 'DOCTOR, EMERGENCY_STAFF',
    activeAnchors: ['Canonical Patient Master (UHID)', 'Emergency Priority Encounters', 'Clinical Risk Flags'],
    deliverables: ['Emergency Rapid Registration', 'Trauma Resuscitation Logs', 'Immediate Transfer Protocols'],
  },
  ipd: {
    name: 'Inpatient Department (IPD) Ward & Bed Management',
    department: 'Inpatient Wards',
    phase: 'CODEx-008',
    icon: Bed,
    description: 'Bed occupancy tracking, inpatient ward admission, transfers, daily doctor rounds, and census management.',
    blueprintRole: 'HOSPITAL_ADMIN, NURSE, DOCTOR',
    activeAnchors: ['Master Wards, Rooms & Beds', 'Canonical Inpatient Encounters', 'Department Taxonomies'],
    deliverables: ['Visual Bed Grid & Occupancy Matrix', 'Ward Admission & Discharge', 'Inter-Ward Bed Transfers'],
  },
  icu: {
    name: 'Intensive Care Unit (ICU) Critical Monitoring',
    department: 'Critical Care Medicine',
    phase: 'CODEx-008',
    icon: HeartPulse,
    description: 'Continuous hemodynamic monitoring, ventilator charting, and critical alerts for acute intensive care.',
    blueprintRole: 'ICU_STAFF, DOCTOR',
    activeAnchors: ['Canonical Patient Master (UHID)', 'High-Risk Clinical Flags', 'Emergency Encounters'],
    deliverables: ['Continuous Hemodynamic Flowsheet', 'Ventilator & Inotrope Charting', 'High-Alert Notifications'],
  },
  ot: {
    name: 'Operation Theatres (OT) & Surgical Suites',
    department: 'Surgical Services',
    phase: 'CODEx-010',
    icon: Scissors,
    description: 'OT table scheduling, pre-op anesthesia assessment, intra-op surgical notes, and post-op recovery tracking.',
    blueprintRole: 'OT_STAFF, SURGEON, ANESTHESIOLOGIST',
    activeAnchors: ['Master Surgical Procedures', 'Master Operating Theatres', 'Canonical Patient Master'],
    deliverables: ['OT Schedule & Slot Booking', 'Surgical Safety Checklist (WHO)', 'Intra-Operative Record'],
  },
  discharge: {
    name: 'Discharge Summaries & Clinical Handover',
    department: 'Inpatient Care',
    phase: 'CODEx-009',
    icon: FileCheck2,
    description: 'Multi-disciplinary discharge summaries, follow-up instructions, discharge medications, and clearance.',
    blueprintRole: 'DOCTOR, NURSE, BILLING_OPERATOR',
    activeAnchors: ['Canonical Encounter Closeout', 'Pharmacy Master', 'Diagnostic Reports'],
    deliverables: ['Printable Formal Discharge Summary', 'Home Medication Reconciliation', 'Follow-up Clinic Schedule'],
  },
  lab: {
    name: 'Pathology & Laboratory Diagnostic System',
    department: 'Laboratory Medicine',
    phase: 'CODEx-007',
    icon: FlaskConical,
    description: 'Sample collection, barcode tube labeling, analyzer interfacing, result entry, and pathologist verification.',
    blueprintRole: 'LAB_TECHNICIAN, PATHOLOGIST',
    activeAnchors: ['Master Investigations & Test Tariffs', 'Specimen Type Taxonomies', 'Canonical Patient Master'],
    deliverables: ['Phlebotomy Specimen Worklist', 'Lab Analyzer Result Verification', 'Critical Value Panic Alerts'],
  },
  radiology: {
    name: 'Radiology & Imaging (RIS / PACS)',
    department: 'Radio-Diagnosis',
    phase: 'CODEx-007',
    icon: Scan,
    description: 'Imaging study scheduling (X-Ray, CT, MRI, Ultrasound), DICOM viewer linking, and radiologist reporting.',
    blueprintRole: 'RADIOLOGIST, RADIOLOGY_TECHNICIAN',
    activeAnchors: ['Master Imaging Modalities', 'Doctor Clinical Orders', 'Canonical Patient Master'],
    deliverables: ['Modality Worklist (MWL)', 'DICOM Study Integration', 'Structured Radiology Reports'],
  },
  pharmacy: {
    name: 'Pharmacy Dispensation & Formulary',
    department: 'Hospital Pharmacy',
    phase: 'CODEx-008',
    icon: Pill,
    description: 'OPD/IPD prescription dispensing, batch/expiry tracking, hospital formulary management, and inventory stock.',
    blueprintRole: 'PHARMACIST',
    activeAnchors: ['Central Medicines Master Data', 'Doctor e-Prescriptions', 'Canonical Patient Master'],
    deliverables: ['Prescription Dispensing Counter', 'Batch & Expiration Verification', 'Automated Stock Depletion'],
  },
  billing: {
    name: 'Hospital Billing, Counters & PMJAY Claims',
    department: 'Finance & Revenue Cycle',
    phase: 'CODEx-009',
    icon: CreditCard,
    description: 'Fee collection, investigation billing, package tariffs, insurance approval, PMJAY claim filing, and receipts.',
    blueprintRole: 'BILLING_OPERATOR, HOSPITAL_ADMIN',
    activeAnchors: ['Master Tariffs & Service Taxonomies', 'Canonical Encounters', 'Insurance & Schemes Master'],
    deliverables: ['Central Cashier Counter', 'Interim & Final Inpatient Billing', 'PMJAY Ayushman Claim Generator'],
  },
  reports: {
    name: 'Statutory Reports & Hospital Registers',
    department: 'Medical Records Department (MRD)',
    phase: 'CODEx-010',
    icon: FileText,
    description: 'Daily census, MLC register, birth/death reporting, notifiable disease alerts, and government compliance registers.',
    blueprintRole: 'HOSPITAL_LEADERSHIP, MRD_STAFF',
    activeAnchors: ['Patient Master & Encounters', 'Master Hospital Data', 'Central Audit Trail'],
    deliverables: ['Daily Bed & OPD Census', 'Statutory MLC / Police Register', 'Birth & Death Registry'],
  },
  analytics: {
    name: 'Hospital Executive Analytics & BI',
    department: 'Hospital Leadership',
    phase: 'CODEx-010',
    icon: BarChart3,
    description: 'Executive dashboards, bed occupancy rate, average length of stay (ALOS), revenue metrics, and department KPIs.',
    blueprintRole: 'HOSPITAL_LEADERSHIP, SUPER_ADMIN',
    activeAnchors: ['Central Master Data', 'Audit Events Store', 'Encounter Metrics'],
    deliverables: ['Real-time Bed Occupancy Dashboard', 'Doctor Outpatient Turnaround Times', 'Revenue & Billing Realization'],
  },
  appointments: {
    name: 'Outpatient Appointments & Scheduling',
    department: 'Central Registration & Reception',
    phase: 'CODEx-006',
    icon: Calendar,
    description: 'Doctor roster management, clinic appointment booking, slot allocation, and patient SMS notifications.',
    blueprintRole: 'REGISTRATION_DESK, PATIENT',
    activeAnchors: ['Master Doctor Profiles & Availability', 'Department Taxonomies', 'Canonical Patient Master'],
    deliverables: ['Doctor Clinic Slot Scheduler', 'Online & Desk Appointment Booking', 'Queue Token Generation'],
  },
  encounters: {
    name: 'Hospital Encounters & Clinical Visits',
    department: 'Clinical Administration',
    phase: 'CODEx-002 / CODEx-005',
    icon: Activity,
    description: 'Hospital visit administration, triage priority assignment, attending doctor linking, and visit status tracking.',
    blueprintRole: 'REGISTRATION_DESK, DOCTOR, NURSE',
    activeAnchors: ['Canonical Patient Master (UHID)', 'Master Departments', 'Attending Doctors'],
    deliverables: ['Global Encounter Directory', 'Triage Status Dashboard', 'Patient 360 Visit Linkage'],
  },
  integrations: {
    name: 'ABDM (Ayushman Bharat) & External Integrations',
    department: 'Health Informatics & IT',
    phase: 'CODEx-011',
    icon: Share2,
    description: 'ABHA creation, ABDM M1/M2/M3 milestone gateways, health information exchange, and FHIR API endpoints.',
    blueprintRole: 'SUPER_ADMIN, HOSPITAL_ADMIN',
    activeAnchors: ['Patient Identifiers (ABHA, National ID)', 'Institutional Consent Master', 'FHIR Profile Validation'],
    deliverables: ['ABHA OTP Verification Gateway', 'Health Information Provider (HIP)', 'Health Information User (HIU)'],
  },
};

export default function StandbyModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleKey = (params.module as string)?.toLowerCase();

  const moduleData = MODULE_REGISTRY[moduleKey] || {
    name: `${(params.module as string)?.toUpperCase()} Hospital Subsystem`,
    department: 'Hospital Specialized Services',
    phase: 'Upcoming Phase',
    icon: Hospital,
    description: 'Specialized enterprise clinical service being implemented in accordance with the Chikitsaalye architectural blueprint.',
    blueprintRole: 'CLINICAL_STAFF',
    activeAnchors: ['Canonical Patient Master (UHID)', 'Master Data Management', 'Granular RBAC Security'],
    deliverables: ['Clinical Documentation', 'Inter-department Orders', 'Audit Trail Recording'],
  };

  const Icon = moduleData.icon;

  return (
    <PageContainer
      title={moduleData.name}
      subtitle={`Hospital Module Roadmap • ${moduleData.department} • ${moduleData.phase}`}
      breadcrumbs={[
        { label: 'Clinical Modules', href: '/' },
        { label: moduleData.name, current: true },
      ]}
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/patients')}>
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Patient Directory
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/patients/new')}>
            Register New Patient
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Phased Rollout Status Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-xl p-6 shadow-md border border-blue-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold">{moduleData.name}</h2>
                  <Badge variant="blue">{moduleData.phase}</Badge>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">{moduleData.department}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono bg-blue-950/80 text-blue-300 px-2.5 py-1 rounded border border-blue-700">
                Authorized Roles: {moduleData.blueprintRole}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-blue-800/80">
            {moduleData.description}
          </p>
        </div>

        {/* Architectural Explanation */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Why is this module on standby?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                In strict accordance with the <strong>Chikitsaalye & UPUMS Architectural Blueprint</strong>, 
                hospital modules are rolled out in structured engineering phases. Clinical modules must never be built with isolated data silos; they must directly integrate with the central foundations established in phases <strong>CODEx-001 through CODEx-005</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            {/* Active Foundations */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Active Domain Anchors (Live in System)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {moduleData.activeAnchors.map((anchor, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{anchor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Upcoming Phase Deliverables */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Scheduled Phase Scope ({moduleData.phase})</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {moduleData.deliverables.map((deliv, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Live Workspaces Quick Navigation */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Explore Active Hospital Modules Ready Today:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => router.push('/patients')}
              className="p-3 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-left transition-colors shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600">
                  Master Patient Index (360)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Canonical UHID registry, clinical alerts, and longitudinal timeline.
              </p>
            </button>

            <button
              onClick={() => router.push('/patients/new')}
              className="p-3 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-left transition-colors shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600">
                  Patient Registration & Slip
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Issue canonical UHID, duplicate check, and print thermal registration slips.
              </p>
            </button>

            <button
              onClick={() => router.push('/administration/master-data')}
              className="p-3 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-left transition-colors shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600">
                  Master Data Management
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Manage Departments, Beds, Wards, Services, Tariffs, and Medicines.
              </p>
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
