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
} from 'lucide-react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

export default function NewPatientRegistrationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        router.push(`/patients/${json.data.id}`);
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
    </PageContainer>
    </ProtectedRoute>
  );
}
