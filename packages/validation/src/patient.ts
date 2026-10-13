import { z } from 'zod';
import { paginationQuerySchema } from './common.js';

export const patientSearchSchema = paginationQuerySchema.extend({
  uhid: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  name: z.string().trim().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  department: z.string().optional(),
});

export type PatientSearchInput = z.infer<typeof patientSearchSchema>;
