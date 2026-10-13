'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PageContainer,
  AlertBanner,
  Button,
  Input,
  Select,
  Textarea,
  FormField,
  Badge,
  Modal,
} from '@chikitsaalye/ui';
import {
  UserPlus,
  AlertTriangle,
  ArrowLeft,
  Save,
  CheckCircle2,
  Shield,
  FileCheck,
  Building,
  Heart,
  Phone,
  Home,
  AlertCircle,
  Printer,
  Copy,
  ExternalLink,
  Check,
  ArrowRight,
} from 'lucide-react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

export default function NewPatientRegistrationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<any | null>(null);
  const [copiedUhid, setCopiedUhid] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '1990-01-01',
    isEstimatedDob: false,
    bloodGroup: 'UNKNOWN',
    maritalStatus: 'SINGLE',
    nationality: 'Indian',
    religion: '',
    occupation: '',

    // Identifiers
    abhaNumber: '',
    nationalId: '',

    // Contact
    phone: '',
    email: '',

    // Address
    addressLine1: '',
    city: 'Saifai',
    district: 'Etawah',
    state: 'Uttar Pradesh',
    postalCode: '206130',

    // Emergency Contact
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',

    // Initial Allergies & Conditions (Doctor / Triage Workspace Ready)
    allergen: '',
    allergySeverity: 'MODERATE',
    allergyReaction: '',
    conditionName: '',
  });

  const checkDuplicates = async () => {
    if (!formData.phone && (!formData.firstName || !formData.lastName)) return;
    try {
      const res = await fetch('/api/v1/patients/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          identifierValue: formData.abhaNumber || formData.nationalId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.data.hasDuplicates) {
        setDuplicateWarning(data.data.candidates);
      } else {
        setDuplicateWarning([]);
      }
    } catch (e) {
      // Ignore background check failure
    }
  };

  const resetForm = () => {
    setRegisteredPatient(null);
    setDuplicateWarning([]);
    setShowDuplicateModal(false);
    setErrorMessage(null);
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      gender: 'MALE',
      dateOfBirth: '1990-01-01',
      isEstimatedDob: false,
      bloodGroup: 'UNKNOWN',
      maritalStatus: 'SINGLE',
      nationality: 'Indian',
      religion: '',
      occupation: '',
      abhaNumber: '',
      nationalId: '',
      phone: '',
      email: '',
      addressLine1: '',
      city: 'Saifai',
      district: 'Etawah',
      state: 'Uttar Pradesh',
      postalCode: '206130',
      emergencyName: '',
      emergencyRelationship: 'Spouse',
      emergencyPhone: '',
      allergen: '',
      allergySeverity: 'MODERATE',
      allergyReaction: '',
      conditionName: '',
    });
  };

  const handleCopyUhid = (uhid: string) => {
    navigator.clipboard.writeText(uhid);
    setCopiedUhid(true);
    setTimeout(() => setCopiedUhid(false), 2000);
  };

  const handleSubmit = async (e?: React.FormEvent, forceSubmit = false) => {
    if (e) e.preventDefault();

    // If duplicate candidates detected and not explicitly forced, trigger modal review
    if (duplicateWarning.length > 0 && !forceSubmit) {
      setShowDuplicateModal(true);
      return;
    }

    setShowDuplicateModal(false);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        isEstimatedDob: formData.isEstimatedDob,
        bloodGroup: formData.bloodGroup,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality,
        religion: formData.religion || undefined,
        occupation: formData.occupation || undefined,
        identifiers: [],
        contacts: [
          {
            type: 'PHONE',
            value: formData.phone,
            isPrimary: true,
          },
        ],
        addresses: [
          {
            type: 'CURRENT',
            addressLine1: formData.addressLine1 || 'Main Hospital Road',
            city: formData.city,
            district: formData.district,
            state: formData.state,
            postalCode: formData.postalCode,
            country: 'India',
            isPrimary: true,
          },
        ],
        emergencyContacts: formData.emergencyName
          ? [
              {
                name: formData.emergencyName,
                relationship: formData.emergencyRelationship,
                phone: formData.emergencyPhone || formData.phone,
                isPrimary: true,
              },
            ]
          : [],
        allergies: formData.allergen
          ? [
              {
                allergen: formData.allergen,
                allergenType: 'DRUG',
                severity: formData.allergySeverity,
                reaction: formData.allergyReaction || undefined,
                status: 'ACTIVE',
              },
            ]
          : [],
        conditions: formData.conditionName
          ? [
              {
                conditionName: formData.conditionName,
                clinicalStatus: 'ACTIVE',
                verificationStatus: 'CONFIRMED',
              },
            ]
          : [],
        consents: [
          {
            consentType: 'GENERAL_TREATMENT',
            status: 'GRANTED',
          },
        ],
      };

      if (formData.email) {
        payload.contacts.push({ type: 'EMAIL', value: formData.email, isPrimary: false });
      }

      if (formData.abhaNumber) {
        payload.identifiers.push({
          type: 'ABHA_NUMBER',
          value: formData.abhaNumber,
          issuingAuthority: 'ABDM',
          isPrimary: true,
        });
      }

      if (formData.nationalId) {
        payload.identifiers.push({
          type: 'NATIONAL_ID',
          value: formData.nationalId,
          issuingAuthority: 'UIDAI',
          isPrimary: false,
        });
      }

      const res = await fetch('/api/v1/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setRegisteredPatient(json.data);
      } else {
        const errorDetail = json.error?.details?.map((d: any) => d.message).join(', ');
        setErrorMessage(errorDetail || json.error?.message || 'Failed to register patient');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with patient registration service');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If patient has been successfully registered, render Confirmation Screen & Printable Slip
  if (registeredPatient) {
    return (
      <ProtectedRoute requiredPermissions={['PATIENT.CREATE']}>
        <PageContainer
          title="Registration Confirmation"
          subtitle="Canonical Master Patient Index record established with generated institutional UHID"
          breadcrumbs={[
            { label: 'Patients', href: '/patients' },
            { label: 'Registration Confirmation', current: true },
          ]}
          actions={
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print Registration Slip
              </Button>
              <Button variant="secondary" size="sm" onClick={resetForm}>
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Register Another Patient
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push(`/patients/${registeredPatient.id}`)}
              >
                Open Patient 360
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          }
        >
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Patient Registered Successfully
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Canonical UHID issued and patient master indexed across all departments.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUhid(registeredPatient.uhid)}
                  className="bg-white"
                >
                  {copiedUhid ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy UHID
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Printable Registration Slip / Card */}
            <div
              id="printable-slip"
              className="bg-white border-2 border-slate-300 rounded-xl p-8 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 space-y-6"
            >
              {/* Slip Header */}
              <div className="text-center pb-4 border-b-2 border-slate-200">
                <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                  Government of Uttar Pradesh
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Uttar Pradesh University of Medical Sciences (UPUMS)
                </h1>
                <p className="text-xs text-slate-600">
                  Saifai, Etawah, Uttar Pradesh - 206130 • Phone: 05688-276563
                </p>
                <div className="inline-block mt-2 px-3 py-0.5 bg-blue-100 text-blue-900 text-[11px] font-bold rounded-full uppercase tracking-wider">
                  Central Patient Registration Slip
                </div>
              </div>

              {/* Barcode & Canonical UHID Block */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Institutional UHID
                  </span>
                  <div className="text-2xl font-mono font-black text-blue-900 tracking-wider">
                    {registeredPatient.uhid}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Registration Date: {new Date(registeredPatient.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="mt-3 sm:mt-0 text-center">
                  {/* Barcode Graphic Simulation */}
                  <div className="font-mono text-2xl tracking-[0.25em] text-slate-800 select-none">
                    ||||| |||| | |||||||| |||| ||| |||||||
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 tracking-widest mt-0.5">
                    *{registeredPatient.uhid}*
                  </div>
                </div>
              </div>

              {/* Patient Core Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs text-slate-800">
                <div>
                  <span className="block text-slate-500 font-semibold">Patient Name</span>
                  <span className="text-sm font-bold text-slate-900">
                    {registeredPatient.fullName}
                  </span>
                </div>

                <div>
                  <span className="block text-slate-500 font-semibold">Age / Gender</span>
                  <span className="font-bold">
                    {registeredPatient.ageYears} Years / {registeredPatient.gender}
                  </span>
                </div>

                <div>
                  <span className="block text-slate-500 font-semibold">Date of Birth</span>
                  <span>{new Date(registeredPatient.dateOfBirth).toLocaleDateString()}</span>
                </div>

                <div>
                  <span className="block text-slate-500 font-semibold">Blood Group</span>
                  <span className="font-bold text-rose-700">
                    {registeredPatient.bloodGroup?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>

                <div>
                  <span className="block text-slate-500 font-semibold">Contact Mobile</span>
                  <span className="font-mono">{registeredPatient.primaryPhone || '—'}</span>
                </div>

                <div>
                  <span className="block text-slate-500 font-semibold">Marital Status</span>
                  <span>{registeredPatient.maritalStatus || 'Single'}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="block text-slate-500 font-semibold">Residential Address</span>
                  <span>{registeredPatient.primaryAddress || 'Saifai, Etawah, UP'}</span>
                </div>

                <div>
                  <span className="block text-slate-500 font-semibold">Emergency Contact</span>
                  <span>
                    {registeredPatient.emergencyContacts?.[0]?.name
                      ? `${registeredPatient.emergencyContacts[0].name} (${registeredPatient.emergencyContacts[0].relationship}) - ${registeredPatient.emergencyContacts[0].phone}`
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Linked External Identifiers */}
              {registeredPatient.identifiers && registeredPatient.identifiers.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Verified Linked Identifiers
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {registeredPatient.identifiers.map((ident: any, i: number) => (
                      <span
                        key={i}
                        className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] font-mono"
                      >
                        {ident.type}: <strong>{ident.value}</strong> ({ident.issuingAuthority || 'Institutional'})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Notice & Signature */}
              <div className="pt-6 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                <div>
                  <p>• Please bring this slip for all OPD consultations and investigations.</p>
                  <p>• Emergency Triage: Room 101 • Helpline: 1800-180-5145</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-slate-400 w-44 mb-1"></div>
                  <span className="font-semibold text-slate-700">Authorized Registration Officer</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" size="md" onClick={() => router.push('/patients')}>
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Patient Directory
              </Button>
              <div className="flex items-center space-x-3">
                <Button variant="secondary" size="md" onClick={resetForm}>
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Register Another Patient
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push(`/patients/${registeredPatient.id}`)}
                >
                  Go to Patient 360 Cockpit
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={['PATIENT.CREATE']}>
      <PageContainer
        title="Register Canonical Patient"
        subtitle="Issue new institutional UHID and establish Master Patient Index record"
        breadcrumbs={[
          { label: 'Patients', href: '/patients' },
          { label: 'New Patient Registration', current: true },
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Directory
            </Button>
          </div>
        }
      >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        {errorMessage && (
          <AlertBanner
            type="error"
            title="Registration Validation Failed"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {/* Proactive Duplicate Detection Warning */}
        {duplicateWarning.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-800 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Potential Duplicate Patient Record Detected!</span>
            </div>
            <p className="text-slate-600">
              The following patient(s) already exist with matching identifiers or phone numbers. Verify whether to use existing UHID to avoid duplicate hospital records:
            </p>
            <div className="space-y-1 mt-2">
              {duplicateWarning.map((candidate: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white border border-amber-200 rounded text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {candidate.patient.uhid}
                    </span>
                    <span className="font-semibold text-slate-800">{candidate.patient.fullName}</span>
                    <span className="text-slate-500">
                      ({candidate.patient.gender}, {candidate.patient.ageYears} yrs)
                    </span>
                    <span className="text-slate-500">Phone: {candidate.patient.primaryPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="amber">{candidate.confidenceLevel} MATCH</Badge>
                    <a
                      href={`/patients/${candidate.patient.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold hover:underline"
                    >
                      View Existing 360 →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 1: Demographics */}
        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">1. Demographics & Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="First Name" required>
              <Input
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                onBlur={checkDuplicates}
                placeholder="e.g. Ramesh"
              />
            </FormField>

            <FormField label="Middle Name">
              <Input
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                placeholder="e.g. Kumar"
              />
            </FormField>

            <FormField label="Last Name" required>
              <Input
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                onBlur={checkDuplicates}
                placeholder="e.g. Singh"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <FormField label="Gender" required>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                  { value: 'UNKNOWN', label: 'Unknown' },
                ]}
              />
            </FormField>

            <FormField label="Date of Birth" required>
              <Input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                onBlur={checkDuplicates}
              />
            </FormField>

            <FormField label="Blood Group">
              <Select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                options={[
                  { value: 'UNKNOWN', label: 'Unknown' },
                  { value: 'A_POSITIVE', label: 'A Positive (A+)' },
                  { value: 'A_NEGATIVE', label: 'A Negative (A-)' },
                  { value: 'B_POSITIVE', label: 'B Positive (B+)' },
                  { value: 'B_NEGATIVE', label: 'B Negative (B-)' },
                  { value: 'AB_POSITIVE', label: 'AB Positive (AB+)' },
                  { value: 'AB_NEGATIVE', label: 'AB Negative (AB-)' },
                  { value: 'O_POSITIVE', label: 'O Positive (O+)' },
                  { value: 'O_NEGATIVE', label: 'O Negative (O-)' },
                ]}
              />
            </FormField>

            <FormField label="Marital Status">
              <Select
                value={formData.maritalStatus}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                options={[
                  { value: 'SINGLE', label: 'Single' },
                  { value: 'MARRIED', label: 'Married' },
                  { value: 'DIVORCED', label: 'Divorced' },
                  { value: 'WIDOWED', label: 'Widowed' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Contact & Address */}
        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Phone className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">2. Contact & Residential Address</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Primary Mobile Number" required hint="Used for SMS alerts and duplicate matching">
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={checkDuplicates}
                placeholder="e.g. +91 9876543210"
              />
            </FormField>

            <FormField label="Email Address">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. patient@example.com"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <FormField label="Address Line 1" required>
                <Input
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Street / Village / Mohalla"
                />
              </FormField>
            </div>

            <FormField label="District" required>
              <Input
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Etawah"
              />
            </FormField>

            <FormField label="Postal Code" required>
              <Input
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="e.g. 206130"
              />
            </FormField>
          </div>
        </div>

        {/* Section 3: Health Identifiers & Emergency Contact */}
        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">3. Identifiers & Next of Kin</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="ABHA / Ayushman Bharat ID" hint="14-digit ABDM Health Number">
              <Input
                value={formData.abhaNumber}
                onChange={(e) => setFormData({ ...formData, abhaNumber: e.target.value })}
                onBlur={checkDuplicates}
                placeholder="e.g. 91-1234-5678-9012"
              />
            </FormField>

            <FormField label="Aadhaar / National ID" hint="National ID for PMJAY benefit verification">
              <Input
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                onBlur={checkDuplicates}
                placeholder="e.g. XXXX-XXXX-1234"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <FormField label="Emergency Contact Name">
              <Input
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                placeholder="e.g. Sunita Devi"
              />
            </FormField>

            <FormField label="Relationship">
              <Input
                value={formData.emergencyRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                placeholder="e.g. Spouse / Father / Mother"
              />
            </FormField>

            <FormField label="Emergency Phone">
              <Input
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="e.g. +91 9876543211"
              />
            </FormField>
          </div>
        </div>

        {/* Section 4: Clinical Flags Baseline */}
        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Heart className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">4. Baseline Clinical Flags (Doctor Workspace Ready)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Known Drug Allergy" hint="Triggers red alert in clinician workspace">
              <Input
                value={formData.allergen}
                onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                placeholder="e.g. Penicillin, NSAIDs"
              />
            </FormField>

            <FormField label="Allergy Severity">
              <Select
                value={formData.allergySeverity}
                onChange={(e) => setFormData({ ...formData, allergySeverity: e.target.value })}
                options={[
                  { value: 'MILD', label: 'Mild' },
                  { value: 'MODERATE', label: 'Moderate' },
                  { value: 'SEVERE', label: 'Severe' },
                  { value: 'LIFE_THREATENING', label: 'Life Threatening' },
                ]}
              />
            </FormField>

            <FormField label="Pre-Existing Chronic Condition">
              <Input
                value={formData.conditionName}
                onChange={(e) => setFormData({ ...formData, conditionName: e.target.value })}
                placeholder="e.g. Type 2 Diabetes, Hypertension"
              />
            </FormField>
          </div>
        </div>

        {/* Submission Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button type="button" variant="outline" size="md" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Issue UHID & Register Patient
          </Button>
        </div>
      </form>

      {/* Proactive Duplicate Prevention Modal */}
      <Modal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        title="Possible Duplicate Patient Record Detected"
        description="The Master Patient Index found one or more matching records based on contact phone, name, DOB, or external identifier."
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDuplicateModal(false)}
            >
              Cancel & Revise Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => handleSubmit(e, true)}
              isLoading={isSubmitting}
            >
              Continue Registration (Create New UHID)
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Duplicate Prevention Check:</strong> Creating another record will cause clinical data fragmentation. Please review the candidates below to verify if the patient is already registered:
            </div>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {duplicateWarning.map((candidate: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                      {candidate.patient.uhid}
                    </span>
                    <span className="font-bold text-slate-900">{candidate.patient.fullName}</span>
                    <Badge variant={candidate.confidenceScore >= 90 ? 'rose' : 'amber'}>
                      {candidate.confidenceLevel} ({candidate.confidenceScore}%)
                    </Badge>
                  </div>

                  <a
                    href={`/patients/${candidate.patient.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span>View Patient</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <strong>Age/Gender:</strong> {candidate.patient.ageYears} yrs • {candidate.patient.gender}
                  </div>
                  <div>
                    <strong>Phone:</strong> {candidate.patient.primaryPhone || '—'}
                  </div>
                  <div>
                    <strong>DOB:</strong> {new Date(candidate.patient.dateOfBirth).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>District:</strong> {candidate.patient.primaryAddress || '—'}
                  </div>
                </div>

                {candidate.matchedSignals && candidate.matchedSignals.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Matched Signals: </span>
                    {candidate.matchedSignals
                      .map((s: any) => `${s.field}: ${s.value}`)
                      .join(' • ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </PageContainer>
    </ProtectedRoute>
  );
}
