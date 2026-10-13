import type { AuditEvent, IAuditService, AuditActor } from '@chikitsaalye/types';
import crypto from 'crypto';

class AuditService implements IAuditService {
  private inMemoryEvents: AuditEvent[] = [];

  async logEvent(event: {
    actor: AuditActor;
    action: string;
    resource: string;
    resourceId?: string;
    requestId: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditEvent> {
    const fullEvent: AuditEvent = {
      id: `audit_${crypto.randomUUID().replace(/-/g, '')}`,
      timestamp: new Date(),
      ...event,
    };

    // Store in-memory buffer (will persist to DB table in production)
    this.inMemoryEvents.unshift(fullEvent);
    if (this.inMemoryEvents.length > 500) {
      this.inMemoryEvents.pop();
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log(
        `[Audit] [${fullEvent.requestId}] ${fullEvent.actor.type}:${fullEvent.actor.id} -> ${fullEvent.action} on ${fullEvent.resource}${
          fullEvent.resourceId ? `:${fullEvent.resourceId}` : ''
        }`
      );
    }

    return fullEvent;
  }

  async queryEvents(filter: {
    resource?: string;
    resourceId?: string;
    actorId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<AuditEvent[]> {
    return this.inMemoryEvents.filter((evt) => {
      if (filter.resource && evt.resource !== filter.resource) return false;
      if (filter.resourceId && evt.resourceId !== filter.resourceId) return false;
      if (filter.actorId && evt.actor.id !== filter.actorId) return false;
      if (filter.startDate && evt.timestamp < filter.startDate) return false;
      if (filter.endDate && evt.timestamp > filter.endDate) return false;
      return true;
    });
  }
}

export const auditService = new AuditService();
