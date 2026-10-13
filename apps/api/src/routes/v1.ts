import { Router } from 'express';
import { healthRouter } from '../modules/health/index.js';
import { authRouter } from '../modules/auth/index.js';
import { usersRouter } from '../modules/users/index.js';
import { rolesRouter } from '../modules/roles/index.js';
import { permissionsRouter } from '../modules/permissions/index.js';
import { masterDataRouter } from '../modules/master-data/index.js';
import { patientsRouter } from '../modules/patients/index.js';
import { encountersRouter } from '../modules/encounters/index.js';
import { appointmentsRouter } from '../modules/appointments/index.js';
import { opdRouter } from '../modules/opd/index.js';
import { ipdRouter } from '../modules/ipd/index.js';
import { emergencyRouter } from '../modules/emergency/index.js';
import { nursingRouter } from '../modules/nursing/index.js';
import { labRouter } from '../modules/lab/index.js';
import { radiologyRouter } from '../modules/radiology/index.js';
import { pharmacyRouter } from '../modules/pharmacy/index.js';
import { billingRouter } from '../modules/billing/index.js';
import { otRouter } from '../modules/ot/index.js';
import { icuRouter } from '../modules/icu/index.js';
import { dischargeRouter } from '../modules/discharge/index.js';
import { notificationsRouter } from '../modules/notifications/index.js';
import { reportsRouter } from '../modules/reports/index.js';
import { analyticsRouter } from '../modules/analytics/index.js';
import { adminRouter } from '../modules/admin/index.js';
import { integrationsRouter } from '../modules/integrations/index.js';

export const v1Router = Router();

// Core health & telemetry
v1Router.use('/health', healthRouter);

// Identity & Access
v1Router.use('/auth', authRouter);
v1Router.use('/users', usersRouter);
v1Router.use('/roles', rolesRouter);
v1Router.use('/permissions', permissionsRouter);
v1Router.use('/master-data', masterDataRouter);

// Clinical Core & Patients
v1Router.use('/patients', patientsRouter);
v1Router.use('/encounters', encountersRouter);
v1Router.use('/appointments', appointmentsRouter);
v1Router.use('/opd', opdRouter);
v1Router.use('/ipd', ipdRouter);
v1Router.use('/emergency', emergencyRouter);
v1Router.use('/nursing', nursingRouter);
v1Router.use('/ot', otRouter);
v1Router.use('/icu', icuRouter);
v1Router.use('/discharge', dischargeRouter);

// Diagnostics & Pharmacy
v1Router.use('/lab', labRouter);
v1Router.use('/radiology', radiologyRouter);
v1Router.use('/pharmacy', pharmacyRouter);

// Financials, Operations & Governance
v1Router.use('/billing', billingRouter);
v1Router.use('/notifications', notificationsRouter);
v1Router.use('/reports', reportsRouter);
v1Router.use('/analytics', analyticsRouter);
v1Router.use('/admin', adminRouter);
v1Router.use('/integrations', integrationsRouter);
