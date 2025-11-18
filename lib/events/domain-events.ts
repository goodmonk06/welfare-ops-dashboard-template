/**
 * Domain event system for cross-module communication
 */

export type DomainEventType =
  | "resident.created"
  | "resident.updated"
  | "resident.deleted"
  | "resident.admitted"
  | "resident.discharged"
  | "staff.created"
  | "staff.updated"
  | "staff.deleted"
  | "staff.hired"
  | "staff.terminated"
  | "incident.created"
  | "incident.updated"
  | "incident.resolved"
  | "shift.created"
  | "shift.updated"
  | "shift.cancelled"
  | "assessment.created"
  | "assessment.completed"
  | "medication.prescribed"
  | "medication.discontinued"
  | "task.created"
  | "task.completed"
  | "note.created";

export interface BaseDomainEvent<T = unknown> {
  type: DomainEventType;
  timestamp: Date;
  data: T;
  metadata?: Record<string, unknown>;
}

// Specific event types
export interface ResidentCreatedEvent extends BaseDomainEvent {
  type: "resident.created";
  data: {
    residentId: string;
    name: string;
    careLevel: number;
  };
}

export interface IncidentCreatedEvent extends BaseDomainEvent {
  type: "incident.created";
  data: {
    incidentId: string;
    severity: string;
    residentId?: string;
    reportedById?: string;
  };
}

export interface AssessmentCompletedEvent extends BaseDomainEvent {
  type: "assessment.completed";
  data: {
    assessmentId: string;
    residentId: string;
    nextReviewDate?: Date;
  };
}

export type DomainEvent =
  | ResidentCreatedEvent
  | IncidentCreatedEvent
  | AssessmentCompletedEvent
  | BaseDomainEvent;

// Event handler type
export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T
) => Promise<void> | void;

/**
 * Simple in-memory event bus
 * In production, this would integrate with a message queue (RabbitMQ, Redis, etc.)
 */
export class EventBus {
  private handlers: Map<DomainEventType, EventHandler[]> = new Map();
  private globalHandlers: EventHandler[] = [];

  /**
   * Subscribe to a specific event type
   */
  on<T extends DomainEvent>(type: DomainEventType, handler: EventHandler<T>) {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler as EventHandler);
    this.handlers.set(type, handlers);
  }

  /**
   * Subscribe to all events
   */
  onAll(handler: EventHandler) {
    this.globalHandlers.push(handler);
  }

  /**
   * Emit an event
   */
  async emit(event: DomainEvent): Promise<void> {
    // Log event
    console.log("[EVENT]", event.type, event.data);

    // Call type-specific handlers
    const handlers = this.handlers.get(event.type) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }

    // Call global handlers
    for (const handler of this.globalHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in global event handler:`, error);
      }
    }
  }

  /**
   * Remove all handlers for a specific event type
   */
  off(type: DomainEventType) {
    this.handlers.delete(type);
  }

  /**
   * Clear all handlers
   */
  clear() {
    this.handlers.clear();
    this.globalHandlers = [];
  }
}

export const eventBus = new EventBus();

// Helper function to create and emit events
export async function emitEvent<T extends DomainEvent>(event: T): Promise<void> {
  await eventBus.emit(event);
}
