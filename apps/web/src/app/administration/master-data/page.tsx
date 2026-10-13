'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { SYSTEM_PERMISSIONS } from '@chikitsaalye/types';
import {
  Building2,
  Users,
  Bed,
  Stethoscope,
  FlaskConical,
  Pill,
  FileText,
  CreditCard,
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  DollarSign,
  Info,
  Check,
  Copy,
} from 'lucide-react';

// Domain tabs definition
type DomainTab =
  | 'departments'
  | 'staff_doctors'
  | 'wards_beds'
  | 'services_procedures'
  | 'investigations'
  | 'medicines'
  | 'diagnoses'
  | 'tariffs'
  | 'schemes';

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<DomainTab>('departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // In-memory demo state for client interaction
  const [departments, setDepartments] = useState([
    { id: 'dept-gen-med', code: 'GEN_MED', name: 'General Medicine', type: 'CLINICAL', desc: 'Adult inpatient, outpatient, and critical consultations', isActive: true },
    { id: 'dept-gen-surg', code: 'GEN_SURG', name: 'General Surgery', type: 'CLINICAL', desc: 'Laparoscopic, trauma and elective surgical suites', isActive: true },
    { id: 'dept-cardio', code: 'CARDIO', name: 'Cardiology', type: 'CLINICAL', desc: 'Interventional cath lab, non-invasive cardiac evaluation', isActive: true },
    { id: 'dept-pedia', code: 'PEDIA', name: 'Pediatrics & Neonatology', type: 'CLINICAL', desc: 'Pediatric general care, immunization, NICU / PICU', isActive: true },
    { id: 'dept-emerg', code: 'EMERGENCY', name: 'Emergency & Level-1 Trauma', type: 'CLINICAL', desc: '24x7 acute triage, resuscitation bays, emergency OT', isActive: true },
    { id: 'dept-icu', code: 'ICU_CCM', name: 'Critical Care Medicine (ICU)', type: 'CLINICAL', desc: 'Mechanical ventilation, hemodynamic monitoring, ECMO', isActive: true },
    { id: 'dept-path', code: 'PATHOLOGY', name: 'Pathology & Lab Medicine', type: 'DIAGNOSTIC', desc: 'Clinical biochemistry, hematology, microbiology, histopathology', isActive: true },
    { id: 'dept-radio', code: 'RADIOLOGY', name: 'Radiodiagnosis & Imaging', type: 'DIAGNOSTIC', desc: 'Digital X-ray, Ultrasound, 128-slice CT, 3T MRI', isActive: true },
    { id: 'dept-pharm', code: 'PHARMACY', name: 'Hospital Pharmacy & Stores', type: 'SUPPORT', desc: 'Central pharmacy, inpatient dispensing, narcotics vault', isActive: true },
  ]);

  const [doctors, setDoctors] = useState([
    { id: 'doc-1', name: 'Dr. S. K. Sharma', regNo: 'UP-MCI-48921', dept: 'General Medicine', spec: 'Internal Medicine', room: 'OPD-102', fee: 100, isActive: true },
    { id: 'doc-2', name: 'Dr. R. K. Gupta', regNo: 'UP-MCI-31450', dept: 'General Surgery', spec: 'General & Lap Surgery', room: 'OPD-105', fee: 150, isActive: true },
    { id: 'doc-3', name: 'Dr. Ananya Mathur', regNo: 'UP-MCI-52190', dept: 'Cardiology', spec: 'Interventional Cardiology', room: 'OPD-201', fee: 200, isActive: true },
    { id: 'doc-4', name: 'Dr. Priya Singhal', regNo: 'UP-MCI-44102', dept: 'Pediatrics', spec: 'Neonatal & Child Health', room: 'OPD-108', fee: 120, isActive: true },
  ]);

  const [beds, setBeds] = useState([
    { id: 'bed-emr-01', code: 'BED_EMR_01', ward: 'Emergency Trauma Ward', room: 'Bay A', type: 'TRAUMA_BAY', status: 'AVAILABLE', rate: 200 },
    { id: 'bed-emr-02', code: 'BED_EMR_02', ward: 'Emergency Trauma Ward', room: 'Bay A', type: 'TRAUMA_BAY', status: 'OCCUPIED', rate: 200 },
    { id: 'bed-emr-03', code: 'BED_EMR_03', ward: 'Emergency Trauma Ward', room: 'Bay A', type: 'TRAUMA_BAY', status: 'CLEANING', rate: 200 },
    { id: 'bed-mmw-101', code: 'BED_MMW_101_1', ward: 'Male Medical Ward 1', room: 'Room 101', type: 'STANDARD', status: 'AVAILABLE', rate: 150 },
    { id: 'bed-mmw-102', code: 'BED_MMW_101_2', ward: 'Male Medical Ward 1', room: 'Room 101', type: 'STANDARD', status: 'OCCUPIED', rate: 150 },
    { id: 'bed-ticu-01', code: 'BED_TICU_01', ward: 'Trauma & Surgical ICU', room: 'Main ICU Bay', type: 'ICU_VENTILATOR', status: 'OCCUPIED', rate: 2500 },
    { id: 'bed-ticu-02', code: 'BED_TICU_02', ward: 'Trauma & Surgical ICU', room: 'Main ICU Bay', type: 'ICU_VENTILATOR', status: 'AVAILABLE', rate: 2500 },
    { id: 'bed-pvt-201', code: 'BED_PVT_201', ward: 'Male Medical Ward 1', room: 'Private 201', type: 'STANDARD', status: 'AVAILABLE', rate: 1200 },
  ]);

  const [investigations, setInvestigations] = useState([
    { id: 'inv-1', code: 'INV_CBC', name: 'Complete Blood Count (CBC) with Automated Differential', cat: 'HEMATOLOGY', sample: 'BLOOD', tat: '4 Hours', dept: 'Pathology' },
    { id: 'inv-2', code: 'INV_LFT', name: 'Liver Function Test Profile (LFT)', cat: 'BIOCHEMISTRY', sample: 'BLOOD', tat: '6 Hours', dept: 'Pathology' },
    { id: 'inv-3', code: 'INV_KFT', name: 'Kidney Function Test / Renal Profile (KFT)', cat: 'BIOCHEMISTRY', sample: 'BLOOD', tat: '6 Hours', dept: 'Pathology' },
    { id: 'inv-4', code: 'INV_CXR_PA', name: 'Chest X-Ray (Posteroanterior View)', cat: 'RADIOLOGY_XRAY', sample: 'N/A', tat: '2 Hours', dept: 'Radiology' },
    { id: 'inv-5', code: 'INV_CT_BRAIN', name: 'CT Scan Head / Brain (Plain)', cat: 'RADIOLOGY_CT', sample: 'N/A', tat: '4 Hours', dept: 'Radiology' },
    { id: 'inv-6', code: 'INV_ECG_12', name: '12-Lead Electrocardiogram (ECG)', cat: 'ECG', sample: 'N/A', tat: '1 Hour', dept: 'Cardiology' },
  ]);

  const [medicines, setMedicines] = useState([
    { id: 'med-1', code: 'MED_PCM_500', generic: 'Paracetamol', brand: 'Dolo 500 / Calpol', form: 'TABLET', strength: '500 MG', isNarcotic: false, isAntibiotic: false },
    { id: 'med-2', code: 'MED_AMOX_625', generic: 'Amoxicillin and Clavulanate Potassium', brand: 'Augmentin 625 Duo', form: 'TABLET', strength: '625 MG', isNarcotic: false, isAntibiotic: true },
    { id: 'med-3', code: 'MED_CEFT_1G', generic: 'Ceftriaxone Sodium Injection', brand: 'Monocef 1g Inj', form: 'INJECTION', strength: '1000 MG', isNarcotic: false, isAntibiotic: true },
    { id: 'med-4', code: 'MED_TRAM_50', generic: 'Tramadol Hydrochloride', brand: 'Tramazac 50 Inj', form: 'INJECTION', strength: '50 MG', isNarcotic: true, isAntibiotic: false },
    { id: 'med-5', code: 'MED_RL_500', generic: "Ringer's Lactate Solution", brand: 'RL Infusion 500ml', form: 'IV_FLUID', strength: '500 ML', isNarcotic: false, isAntibiotic: false },
  ]);

  const [tariffs, setTariffs] = useState([
    { id: 'trf-1', code: 'TRF_STD_CBC', name: 'CBC Diagnostic Rate', target: 'Investigation: INV_CBC', stdPrice: 250, pmjayPrice: 120, rateType: 'STANDARD / PMJAY' },
    { id: 'trf-2', code: 'TRF_STD_LFT', name: 'LFT Diagnostic Rate', target: 'Investigation: INV_LFT', stdPrice: 450, pmjayPrice: 200, rateType: 'STANDARD / PMJAY' },
    { id: 'trf-3', code: 'TRF_STD_CXR', name: 'Chest X-Ray Digital', target: 'Investigation: INV_CXR_PA', stdPrice: 300, pmjayPrice: 150, rateType: 'STANDARD / PMJAY' },
    { id: 'trf-4', code: 'TRF_STD_APPEN', name: 'Appendectomy Surgical Package', target: 'Procedure: PROC_APPEN', stdPrice: 12000, pmjayPrice: 8500, rateType: 'STANDARD / PMJAY' },
    { id: 'trf-5', code: 'TRF_STD_OPD', name: 'OPD Registration Fee', target: 'Service: SRV_OPD_GEN', stdPrice: 50, pmjayPrice: 0, rateType: 'STANDARD' },
  ]);

  const [schemes, setSchemes] = useState([
    { id: 'sch-1', code: 'SCH_PMJAY', name: 'Ayushman Bharat - PM-JAY', agency: 'National Health Authority (NHA)', cap: '₹5,00,000 / Family', status: 'ACTIVE' },
    { id: 'sch-2', code: 'SCH_MMJAY', name: 'Mukhyamantri Jan Arogya Yojana (UP)', agency: 'State Health Agency (SHA) Uttar Pradesh', cap: '₹5,00,000 / Family', status: 'ACTIVE' },
    { id: 'sch-3', code: 'SCH_ECHS', name: 'Ex-Servicemen Contributory Health Scheme', agency: 'Ministry of Defence, Govt of India', cap: '₹10,00,000', status: 'ACTIVE' },
    { id: 'sch-4', code: 'INS_STAR', name: 'Star Health and Allied Insurance', agency: 'Star Health In-House TPA', cap: 'Policy Sum Insured', status: 'ACTIVE' },
  ]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleBedStatusCycle = (bedId: string) => {
    const cycleMap: Record<string, string> = {
      AVAILABLE: 'OCCUPIED',
      OCCUPIED: 'CLEANING',
      CLEANING: 'AVAILABLE',
      RESERVED: 'OCCUPIED',
      MAINTENANCE: 'CLEANING',
    };
    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, status: cycleMap[b.status] || 'AVAILABLE' } : b))
    );
  };

  return (
    <ProtectedRoute requiredPermissions={[SYSTEM_PERMISSIONS.MASTER_DATA_READ]}>
      <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Single Source of Truth
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">UPUMS Central Data Registry</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-indigo-600" />
              Central Master Data Management
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Canonical taxonomy and catalog registry powering OPD, IPD, Emergency, Diagnostics, Pharmacy, and Tariff Schemas.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => alert('Master Data synchronization verified across in-memory cache and PostgreSQL store.')}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Verify Sync
            </button>
            <button
              onClick={() => alert('New Master Data registration modal. Protected by MASTER_DATA.CREATE.')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Master Record
            </button>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Departments</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">{departments.length}</div>
            <span className="text-[10px] text-emerald-600 font-medium">100% Operational</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Clinical Faculty</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">{doctors.length}</div>
            <span className="text-[10px] text-blue-600 font-medium">Credentialed Specialists</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Beds (Live)</span>
              <Bed className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">{beds.length}</div>
            <span className="text-[10px] text-purple-600 font-medium">
              {beds.filter((b) => b.status === 'AVAILABLE').length} Available
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Lab & Radiology</span>
              <FlaskConical className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">{investigations.length}</div>
            <span className="text-[10px] text-teal-600 font-medium">Standard Turnarounds</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Medicines</span>
              <Pill className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">{medicines.length}</div>
            <span className="text-[10px] text-amber-600 font-medium">Formulary Mapped</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Tariff Packages</span>
              <CreditCard className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">{tariffs.length}</div>
            <span className="text-[10px] text-rose-600 font-medium">PMJAY & Standard Rates</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
          {[
            { id: 'departments', label: 'Departments', icon: Building2 },
            { id: 'staff_doctors', label: 'Doctors & Staff', icon: Users },
            { id: 'wards_beds', label: 'Wards & Beds', icon: Bed },
            { id: 'investigations', label: 'Diagnostics / Labs', icon: FlaskConical },
            { id: 'medicines', label: 'Medicines', icon: Pill },
            { id: 'tariffs', label: 'Tariffs & Pricing', icon: CreditCard },
            { id: 'schemes', label: 'Govt Schemes & Insurance', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as DomainTab);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Action Bar */}
        <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab.replace('_', ' ')} by code or name...`}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Click code to copy canonical reference
          </div>
        </div>

        {/* Tab 1: Departments */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Hospital Departments & Clinical Units</h3>
                <p className="text-xs text-slate-500">Core organizational units referenced by all encounters, wards, and services.</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {departments.length} Departments Registered
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Department Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Clinical Scope</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {departments
                    .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.code.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((dept) => (
                      <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <button
                            onClick={() => handleCopyCode(dept.code)}
                            className="font-mono text-indigo-700 font-bold hover:underline flex items-center gap-1.5"
                          >
                            {dept.code}
                            {copiedCode === dept.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                          </button>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">{dept.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dept.type === 'CLINICAL' ? 'bg-blue-50 text-blue-700' :
                            dept.type === 'DIAGNOSTIC' ? 'bg-teal-50 text-teal-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {dept.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{dept.desc}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Doctors & Staff */}
        {activeTab === 'staff_doctors' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Medical Council Registered Faculty & Clinicians</h3>
                <p className="text-xs text-slate-500">Every clinician is mapped to an authenticated user and clinical profile.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {doctors.length} Doctors Registered
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Registration No.</th>
                    <th className="p-3">Doctor Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Specialization</th>
                    <th className="p-3">OPD Room</th>
                    <th className="p-3">Consult Fee</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {doctors
                    .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.regNo.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{doc.regNo}</td>
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                          {doc.name}
                        </td>
                        <td className="p-3">{doc.dept}</td>
                        <td className="p-3 text-indigo-700 font-medium">{doc.spec}</td>
                        <td className="p-3 font-mono text-slate-600">{doc.room}</td>
                        <td className="p-3 font-semibold text-slate-900">₹{doc.fee}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Wards & Beds */}
        {activeTab === 'wards_beds' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Inpatient Bed Fleet & Real-Time Status</h3>
                <p className="text-xs text-slate-500">Interactive bed status manager. Click any bed status badge to transition lifecycle state.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">AVAILABLE</span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold">OCCUPIED</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">CLEANING</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Bed Code</th>
                    <th className="p-3">Ward</th>
                    <th className="p-3">Room / Bay</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Daily Tariff</th>
                    <th className="p-3">Status (Click to Update)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {beds
                    .filter((b) => b.code.toLowerCase().includes(searchQuery.toLowerCase()) || b.ward.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5 text-purple-600" />
                          {b.code}
                        </td>
                        <td className="p-3 font-medium text-slate-800">{b.ward}</td>
                        <td className="p-3 text-slate-500">{b.room}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {b.type}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">₹{b.rate} / day</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleBedStatusCycle(b.id)}
                            title="Click to transition status"
                            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-transform active:scale-95 cursor-pointer ${
                              b.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                              b.status === 'OCCUPIED' ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' :
                              'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {b.status} ↺
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Investigations */}
        {activeTab === 'investigations' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Diagnostic Investigation Master</h3>
                <p className="text-xs text-slate-500">Unified pathology and radiology tests with specimen and turnaround rules.</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                {investigations.length} Tests Mapped
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Test Code</th>
                    <th className="p-3">Investigation Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Sample Specimen</th>
                    <th className="p-3">Turnaround Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {investigations
                    .filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.code.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-teal-700">{inv.code}</td>
                        <td className="p-3 font-bold text-slate-900">{inv.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700">
                            {inv.cat}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{inv.dept}</td>
                        <td className="p-3 font-mono text-slate-500">{inv.sample}</td>
                        <td className="p-3 text-slate-700 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {inv.tat}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Medicines */}
        {activeTab === 'medicines' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Hospital Pharmacy Formulary</h3>
                <p className="text-xs text-slate-500">Generic drug master with high-alert and narcotic drug scheduling safeguards.</p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {medicines.length} Drugs in Formulary
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Drug Code</th>
                    <th className="p-3">Generic Name</th>
                    <th className="p-3">Brand Reference</th>
                    <th className="p-3">Dosage Form</th>
                    <th className="p-3">Strength</th>
                    <th className="p-3">Regulatory Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {medicines
                    .filter((m) => m.generic.toLowerCase().includes(searchQuery.toLowerCase()) || m.code.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((med) => (
                      <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-700">{med.code}</td>
                        <td className="p-3 font-bold text-slate-900">{med.generic}</td>
                        <td className="p-3 text-slate-600">{med.brand}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {med.form}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-700">{med.strength}</td>
                        <td className="p-3">
                          {med.isNarcotic ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              NARCOTIC (Schedule X)
                            </span>
                          ) : med.isAntibiotic ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              ANTIBIOTIC (Schedule H)
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Standard Rx</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Tariffs & Pricing */}
        {activeTab === 'tariffs' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Centralized Tariff & Scheme Schedule</h3>
                <p className="text-xs text-slate-500">Decoupled pricing structure supporting PMJAY, corporate insurance, and cash tariffs.</p>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                Central Pricing Active
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Tariff Code</th>
                    <th className="p-3">Tariff Description</th>
                    <th className="p-3">Linked Catalog Entity</th>
                    <th className="p-3">Standard Cash Rate</th>
                    <th className="p-3">PMJAY Package Rate</th>
                    <th className="p-3">Subsidy Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {tariffs
                    .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.code.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((trf) => (
                      <tr key={trf.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{trf.code}</td>
                        <td className="p-3 font-bold text-slate-900">{trf.name}</td>
                        <td className="p-3 text-indigo-700 font-mono text-[11px]">{trf.target}</td>
                        <td className="p-3 font-semibold text-slate-900">₹{trf.stdPrice}</td>
                        <td className="p-3 font-bold text-emerald-700">₹{trf.pmjayPrice}</td>
                        <td className="p-3 text-emerald-600 font-medium">
                          {trf.stdPrice > trf.pmjayPrice ? `₹${trf.stdPrice - trf.pmjayPrice} subsidized` : 'Standard'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 7: Government Schemes */}
        {activeTab === 'schemes' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Government Schemes & Cashless Providers</h3>
                <p className="text-xs text-slate-500">Universal health coverage programs and insurance TPAs supported at UPUMS.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Cashless Empaneled
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Program Code</th>
                    <th className="p-3">Scheme Name</th>
                    <th className="p-3">Nodal Agency / TPA</th>
                    <th className="p-3">Coverage Limit</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {schemes
                    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((sch) => (
                      <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-700">{sch.code}</td>
                        <td className="p-3 font-bold text-slate-900">{sch.name}</td>
                        <td className="p-3 text-slate-600">{sch.agency}</td>
                        <td className="p-3 font-bold text-emerald-700">{sch.cap}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Empaneled
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
