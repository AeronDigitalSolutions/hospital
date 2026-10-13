'use client';

import React, { useState, useEffect } from 'react';
import {
  PageContainer,
  DataTable,
  Badge,
  Button,
  Input,
  Select,
  LoadingState,
  EmptyState,
  ErrorState,
} from '@chikitsaalye/ui';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Activity,
  RefreshCw,
} from 'lucide-react';

export default function PatientsListPage() {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search.trim()) params.append('search', search.trim());
      if (genderFilter) params.append('gender', genderFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/v1/patients?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPatients(json.data || []);
        setTotal(json.meta?.pagination?.total || (json.data || []).length);
      } else {
        setError(json.error?.message || 'Failed to fetch patients list');
      }
    } catch (err: any) {
      setError(err.message || 'Network error connecting to patient master service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, genderFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  const columns = [
    {
      key: 'uhid',
      header: 'Canonical UHID',
      sortable: true,
      render: (row: any) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.uhid}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Patient Name',
      sortable: true,
      render: (row: any) => (
        <div>
          <div className="font-bold text-slate-900">{row.fullName}</div>
          <div className="text-[11px] text-slate-500">
            {row.gender} • {row.ageYears} yrs ({new Date(row.dateOfBirth).toLocaleDateString()})
          </div>
        </div>
      ),
    },
    {
      key: 'bloodGroup',
      header: 'Blood Group',
      render: (row: any) => (
        <Badge variant={row.bloodGroup === 'UNKNOWN' ? 'slate' : 'rose'} size="sm">
          {row.bloodGroup?.replace('_', ' ') || 'UNKNOWN'}
        </Badge>
      ),
    },
    {
      key: 'primaryPhone',
      header: 'Contact Mobile',
      render: (row: any) => (
        <span className="font-mono text-slate-700">{row.primaryPhone || '—'}</span>
      ),
    },
    {
      key: 'primaryAddress',
      header: 'District / State',
      render: (row: any) => (
        <span className="text-slate-600 truncate max-w-xs block">{row.primaryAddress || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Master Status',
      render: (row: any) => (
        <Badge
          variant={
            row.status === 'ACTIVE' ? 'emerald' : row.status === 'DECEASED' ? 'rose' : 'slate'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (row: any) => (
        <a
          href={`/patients/${row.id}`}
          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
        >
          <span>Patient 360</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      ),
    },
  ];

  return (
    <PageContainer
      title="Master Patient Index (MPI)"
      subtitle="Canonical patient registry across all OPD, IPD, Emergency and Diagnostic departments"
      breadcrumbs={[{ label: 'Patients', current: true }]}
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchPatients}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <a href="/patients/new">
            <Button variant="primary" size="sm">
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Register New Patient
            </Button>
          </a>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by UHID (e.g. UPUMS-2024-000001), Name, Phone, or Identifier..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Genders' },
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                ]}
                className="w-32"
              />

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                  { value: 'DECEASED', label: 'Deceased' },
                ]}
                className="w-32"
              />

              <Button type="submit" size="md" variant="secondary">
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Patients Table or Error State */}
        {error ? (
          <ErrorState
            title="Unable to Query Patient Master"
            message={error}
            onRetry={fetchPatients}
          />
        ) : (
          <DataTable
            columns={columns}
            data={patients}
            isLoading={isLoading}
            emptyTitle="No Patients Found in Master Registry"
            emptyDescription="No patient records matched the query. Try adjusting filters or register a new patient."
            page={page}
            totalPages={Math.max(1, Math.ceil(total / pageSize))}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
    </PageContainer>
  );
}
