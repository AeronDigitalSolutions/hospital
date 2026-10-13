import fs from 'fs';
import path from 'path';

const modules = [
  { name: 'users', title: 'System Users', route: 'users' },
  { name: 'roles', title: 'Roles & Access Control', route: 'roles' },
  { name: 'permissions', title: 'Granular Permissions', route: 'permissions' },
  { name: 'master-data', title: 'Master Data & Clinical Taxonomies', route: 'master-data' },
  { name: 'encounters', title: 'Patient Encounters', route: 'encounters' },
  { name: 'appointments', title: 'Patient Appointments & Queues', route: 'appointments' },
  { name: 'opd', title: 'Outpatient Department (OPD)', route: 'opd' },
  { name: 'ipd', title: 'Inpatient Department (IPD & Wards)', route: 'ipd' },
  { name: 'emergency', title: 'Emergency & Trauma Care', route: 'emergency' },
  { name: 'nursing', title: 'Nursing Care & Station', route: 'nursing' },
  { name: 'lab', title: 'Pathology & Laboratory Medicine', route: 'lab' },
  { name: 'radiology', title: 'Radiology & Imaging', route: 'radiology' },
  { name: 'pharmacy', title: 'Pharmacy & Drug Formulary', route: 'pharmacy' },
  { name: 'billing', title: 'Billing, Tariffs & Claims', route: 'billing' },
  { name: 'ot', title: 'Operation Theatre Management', route: 'ot' },
  { name: 'icu', title: 'Intensive Care Unit (ICU)', route: 'icu' },
  { name: 'discharge', title: 'Discharge Planning & Summaries', route: 'discharge' },
  { name: 'notifications', title: 'Notifications & Alerts', route: 'notifications' },
  { name: 'reports', title: 'Operational & Regulatory Reports', route: 'reports' },
  { name: 'analytics', title: 'Clinical & Hospital Analytics', route: 'analytics' },
  { name: 'admin', title: 'Hospital Administration & Governance', route: 'admin' },
  { name: 'integrations', title: 'ABDM, DICOM & FHIR Integrations', route: 'integrations' },
];

const baseDir = path.resolve(process.cwd(), 'apps/api/src/modules');

for (const mod of modules) {
  const modDir = path.join(baseDir, mod.name);
  if (!fs.existsSync(modDir)) {
    fs.mkdirSync(modDir, { recursive: true });
  }

  // Controller
  const controllerContent = `import { Request, Response } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';

export async function list${capitalize(mod.name)}(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;

  return sendPaginated(req, res, {
    items: [],
    total: 0,
    page,
    pageSize,
    totalPages: 0,
  });
}

export async function get${capitalize(mod.name)}ById(req: Request, res: Response) {
  const { id } = req.params;
  return sendSuccess(req, res, {
    id,
    module: '${mod.name}',
    name: '${mod.title}',
    status: 'FOUNDATION_ESTABLISHED',
  });
}

export async function create${capitalize(mod.name)}(req: Request, res: Response) {
  return sendSuccess(
    req,
    res,
    {
      module: '${mod.name}',
      status: 'ACCEPTED',
      message: '${mod.title} architectural boundary established. Business logic scheduled in subsequent CODEx phases.',
    },
    201
  );
}
`;
  fs.writeFileSync(path.join(modDir, `${mod.name}.controller.ts`), controllerContent);

  // Service
  const serviceContent = `export interface I${capitalize(mod.name)}Service {
  findMany(filter?: Record<string, unknown>): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
}

export class ${capitalize(mod.name)}Service implements I${capitalize(mod.name)}Service {
  async findMany(filter?: Record<string, unknown>): Promise<any[]> {
    return [];
  }

  async findById(id: string): Promise<any | null> {
    return null;
  }

  async create(data: any): Promise<any> {
    throw new Error('Method not implemented: Module boundary only in CODEx-001');
  }
}

export const ${camelCase(mod.name)}Service = new ${capitalize(mod.name)}Service();
`;
  fs.writeFileSync(path.join(modDir, `${mod.name}.service.ts`), serviceContent);

  // Routes
  const routesContent = `import { Router } from 'express';
import {
  list${capitalize(mod.name)},
  get${capitalize(mod.name)}ById,
  create${capitalize(mod.name)},
} from './${mod.name}.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const ${camelCase(mod.name)}Router = Router();

${camelCase(mod.name)}Router.get('/', list${capitalize(mod.name)});
${camelCase(mod.name)}Router.get('/:id', get${capitalize(mod.name)}ById);
${camelCase(mod.name)}Router.post('/', idempotencyMiddleware(), create${capitalize(mod.name)});
`;
  fs.writeFileSync(path.join(modDir, `${mod.name}.routes.ts`), routesContent);

  // Index
  const indexContent = `export * from './${mod.name}.routes.js';
export * from './${mod.name}.controller.js';
export * from './${mod.name}.service.js';
`;
  fs.writeFileSync(path.join(modDir, 'index.ts'), indexContent);

  console.log(`Generated boundary module: ${mod.name}`);
}

function capitalize(str) {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function camelCase(str) {
  const parts = str.split('-');
  return parts[0] + parts.slice(1).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

