# Architecture Documentation

## Overview

This welfare operations dashboard is built as a modern, production-ready Next.js application using a layered architecture with clear separation of concerns. The system is designed for extensibility, maintainability, and type safety.

## Technology Stack

### Core Framework
- **Next.js 15** (App Router): Server-side rendering, routing, and API routes
- **React 18**: UI component library
- **TypeScript**: Type-safe development

### API & Data Layer
- **tRPC**: Type-safe API layer with automatic TypeScript inference
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Zod**: Runtime validation for API inputs and data schemas

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Radix UI**: Accessible, unstyled component primitives

### Infrastructure
- **PostgreSQL**: Primary database
- **Docker**: Containerization for development and deployment
- **Vitest**: Modern testing framework

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (Next.js Pages, React Components, UI Components)        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                      API Layer                           │
│         (tRPC Routers, Procedures, Validators)           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Business Logic                         │
│    (Domain Events, Metrics, Logging, Adapters)          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    Data Layer                            │
│         (Prisma ORM, Database Schema, Models)            │
└─────────────────────────────────────────────────────────┘
```

## Key Design Patterns

### 1. **Repository Pattern (via Prisma)**
All database access goes through Prisma Client, providing:
- Type-safe queries
- Automatic migrations
- Query optimization
- Connection pooling

**Example:**
```typescript
// In tRPC router
const residents = await ctx.prisma.resident.findMany({
  where: { status: "active" },
  include: { primaryCareWorker: true }
});
```

### 2. **Adapter Pattern**
External services (storage, notifications) use adapters for pluggability:

**Interface:**
```typescript
export interface INotificationAdapter {
  send(payload: NotificationPayload): Promise<void>;
  sendBulk(payloads: NotificationPayload[]): Promise<void>;
}
```

**Implementations:**
- `ConsoleNotificationAdapter` - Development/testing
- `EmailNotificationAdapter` - Email via SendGrid/SES
- `SmsNotificationAdapter` - SMS via Twilio/SNS

**Benefits:**
- Easy to swap providers
- Testing with mocks
- Environment-specific configuration

### 3. **Event-Driven Architecture**
Domain events decouple modules and enable reactive workflows:

```typescript
// Emit event after creating incident
await emitEvent({
  type: "incident.created",
  timestamp: new Date(),
  data: { incidentId: incident.id, severity: incident.severity }
});

// React to events
eventBus.on("incident.created", async (event) => {
  if (event.data.severity === "critical") {
    await notificationAdapter.send({
      to: managerEmail,
      subject: "Critical Incident",
      message: `Incident ${event.data.incidentId} requires immediate attention`
    });
  }
});
```

**Event Types:**
- `resident.*` - Resident lifecycle events
- `staff.*` - Staff management events
- `incident.*` - Incident tracking events
- `assessment.*`, `medication.*`, `task.*`, `note.*`

### 4. **Dependency Injection (via Context)**
tRPC context provides dependency injection:

```typescript
export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  return {
    prisma,
    notificationAdapter: createNotificationAdapter(),
    storageAdapter: createStorageAdapter(),
  };
};
```

## Core Infrastructure

### Logging (`lib/core/logger.ts`)
Centralized structured logging with JSON output:

```typescript
// Basic logging
logger.info("User logged in", { userId: "123" });

// Audit logging
logger.logAudit("create", "Resident", residentId, { createdBy: staffId });

// Request logging
logger.logRequest("GET", "/api/residents", { statusCode: 200, duration: 45 });
```

**Log Format:**
```json
{
  "timestamp": "2025-11-18T20:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "context": {},
  "userId": "123"
}
```

### Metrics (`lib/core/metrics.ts`)
Business and performance metrics collection:

```typescript
// Counter
metrics.recordCounter("api.requests", 1, { endpoint: "/residents" });

// Gauge
metrics.recordGauge("active.connections", 150);

// Timing
await measureTime("database.query", async () => {
  return await prisma.resident.findMany();
});

// Business metrics
metrics.trackBusinessMetric("residents.total", 25);
```

### Event Bus (`lib/events/domain-events.ts`)
In-memory event bus for domain events:

```typescript
class EventBus {
  on<T>(type: DomainEventType, handler: EventHandler<T>): void
  onAll(handler: EventHandler): void
  async emit(event: DomainEvent): Promise<void>
  off(type: DomainEventType): void
  clear(): void
}
```

**Production Note:** Replace with RabbitMQ, Redis Pub/Sub, or AWS EventBridge for distributed systems.

## Data Model

### Core Entities

```prisma
Resident
  - Personal info, care level, admission/discharge
  - Relations: primaryCareWorker, incidents, notes, assessments, medications

Staff
  - Contact info, role, department, certifications
  - Relations: shifts, reportedIncidents, assignedResidents

Incident
  - Title, severity, category, witnesses
  - Relations: reportedBy (Staff), resident, documents
  - Audit fields: actionsTaken, preventiveMeasures

Shift
  - Date, time range, shift type
  - Relations: staff
  - Status tracking
```

### Supporting Entities

- **ActivityLog**: Audit trail for all entity changes
- **Document**: File metadata and storage references
- **Task**: Scheduled tasks and reminders
- **Note**: Daily notes and handover logs
- **CareAssessment**: Periodic resident assessments
- **Medication**: Medication schedules and tracking

### Cross-Cutting Patterns

All entities include:
- `tags: String[]` - Flexible categorization
- `metadata: Json?` - Extensible custom data
- `archivedAt: DateTime?` - Soft deletes
- `createdAt/updatedAt` - Timestamps

## API Layer (tRPC)

### Router Structure

```
server/routers/
├── resident.ts      - Resident CRUD + filtering
├── staff.ts         - Staff management + certifications
├── incident.ts      - Incident tracking + events
├── shift.ts         - Shift scheduling
└── index.ts         - Root router composition
```

### Standard CRUD Pattern

```typescript
export const entityRouter = router({
  list: publicProcedure
    .input(z.object({ /* filters */ }).optional())
    .query(async ({ ctx, input }) => {
      // Apply filters, include relations
      // Track metrics
      return await ctx.prisma.entity.findMany({ ... });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.entity.findUnique({ ... });
    }),

  create: publicProcedure
    .input(z.object({ /* validated fields */ }))
    .mutation(async ({ ctx, input }) => {
      // Log creation
      const entity = await ctx.prisma.entity.create({ ... });
      // Audit log
      logger.logAudit("create", "Entity", entity.id);
      // Emit event
      await emitEvent({ type: "entity.created", ... });
      // Track metric
      metrics.recordCounter("entity.created", 1);
      return entity;
    }),

  update: publicProcedure
    .input(z.object({ id: z.string(), /* optional fields */ }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      // Log update with changes
      // Update entity
      // Audit log
      // Emit event if status changed
      return await ctx.prisma.entity.update({ ... });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Audit log
      return await ctx.prisma.entity.delete({ ... });
    }),
});
```

### Input Validation

Zod schemas ensure type safety and runtime validation:

```typescript
z.object({
  title: z.string().min(1, "Title is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  occurredAt: z.date(),
  tags: z.array(z.string()).optional(),
})
```

## Security Considerations

### Current State (PoC Template)
- **No Authentication**: Uses `publicProcedure` for all endpoints
- **No Authorization**: No role-based access control
- **No Rate Limiting**: Unlimited API calls
- **No Input Sanitization**: Basic Zod validation only

### Production Recommendations

1. **Authentication**
   - Implement NextAuth.js or Clerk
   - Add `protectedProcedure` to tRPC
   - Verify session/token in context

2. **Authorization**
   - Role-based access control (RBAC)
   - Check user permissions in middleware
   - Audit all permission checks

3. **Data Protection**
   - Encrypt sensitive data (medical info, contact details)
   - HTTPS only in production
   - Secure session management

4. **Input Validation**
   - SQL injection prevention (Prisma handles this)
   - XSS prevention via React's escaping
   - CSRF tokens for mutations

## Performance Optimization

### Database
- **Indexes**: On foreign keys, frequently queried fields
- **Eager Loading**: Use `include` to prevent N+1 queries
- **Pagination**: Implement cursor-based pagination for large lists
- **Connection Pooling**: Prisma handles automatically

### Caching
- **tRPC Cache**: Client-side query caching via TanStack Query
- **Server Cache**: Implement Redis for frequently accessed data
- **Static Generation**: Use Next.js SSG for dashboard overviews

### Monitoring
- Metrics collection via `metrics.ts`
- Structured logging via `logger.ts`
- Database query logging (Prisma)
- Request duration tracking

## Testing Strategy

### Unit Tests
- **Domain Logic**: Entity validation, business rules
- **Utilities**: Helper functions, formatters
- **Infrastructure**: Logger, metrics, event bus

### Integration Tests
- **tRPC Routers**: API endpoint behavior
- **Adapters**: Notification and storage integrations
- **Event Handlers**: Domain event processing

### Test Coverage
Current: **78 tests** across 7 test files
- Router tests: Staff, Incident (14 tests)
- Event bus tests (8 tests)
- Adapter tests (19 tests)
- Infrastructure tests (28 tests)
- Validation tests (9 tests)

## Deployment

### Docker
Multi-stage build for optimized production image:

```dockerfile
# 1. Dependencies stage
# 2. Builder stage (Next.js build)
# 3. Runner stage (minimal runtime)
```

### Environment Variables
```env
DATABASE_URL=postgresql://...
STORAGE_PROVIDER=s3|local
NOTIFICATION_PROVIDER=email|sms|console
S3_BUCKET=...
EMAIL_API_KEY=...
```

### Scaling Considerations
- Horizontal scaling: Stateless Next.js instances
- Database: Read replicas for queries
- File storage: S3 or CDN
- Event bus: Redis Pub/Sub or RabbitMQ
- Background jobs: Bull Queue or BullMQ

## Extension Points

### Adding New Entity
1. Update `prisma/schema.prisma`
2. Create tRPC router in `server/routers/`
3. Add to root router
4. Create UI components
5. Add tests
6. Update seed data

### Adding New Integration
1. Create adapter interface in `lib/adapters/`
2. Implement concrete adapters
3. Add factory function with env config
4. Inject via tRPC context
5. Add tests

### Adding New Event Type
1. Add to `DomainEventType` enum
2. Create event interface
3. Emit in relevant router
4. Register handlers
5. Add tests

## Future Enhancements

- [ ] Authentication & Authorization
- [ ] Real-time updates (WebSockets)
- [ ] File upload & management
- [ ] Advanced reporting & analytics
- [ ] Mobile responsive UI improvements
- [ ] PWA support for offline access
- [ ] i18n for multiple languages
- [ ] Background job processing
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Export to Excel/PDF
