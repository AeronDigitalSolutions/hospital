export type AuditActorType = 'USER' | 'SYSTEM' | 'PATIENT' | 'INTEGRATION';

export interface AuditActor {
  id: string;
  type: AuditActorType;
  department?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditEvent {
  id: string;
  actor: AuditActor;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  requestId: string;
  metadata?: Record<string, unknown>;
}

export interface IAuditService {
  logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent>;
  queryEvents(filter: {
    resource?: string;
    resourceId?: string;
    actorId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditEvent[]>;
}
