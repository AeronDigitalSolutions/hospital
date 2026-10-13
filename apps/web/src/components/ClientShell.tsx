'use client';

import React from 'react';
import { HospitalLayout } from '@chikitsaalye/ui';

export interface ClientShellProps {
  children: React.ReactNode;
}

export const ClientShell: React.FC<ClientShellProps> = ({ children }) => {
  return (
    <HospitalLayout
      headerProps={{
        hospitalName: 'Uttar Pradesh University of Medical Sciences Hospital',
        facilityCode: 'UPUMS-MAIN',
        activeDepartment: 'Emergency & Trauma Center',
        activeShift: 'MORNING',
        currentUser: {
          name: 'Dr. S. K. Sharma',
          role: 'Lead Clinician (HOD)',
          department: 'General Medicine',
        },
        emergencyAlertCount: 2,
      }}
    >
      {children}
    </HospitalLayout>
  );
};
