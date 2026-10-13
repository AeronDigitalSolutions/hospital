export interface IIcuService {
  findMany(filter?: Record<string, unknown>): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
}

export class IcuService implements IIcuService {
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

export const icuService = new IcuService();
