# API Reference

Complete reference for all tRPC API endpoints in the welfare operations dashboard.

## Base URL

All API calls are made through tRPC via `/api/trpc`.

## Authentication

**Current State**: No authentication (all endpoints use `publicProcedure`)

**Production**: Implement authentication middleware and use `protectedProcedure`

---

## Resident API

### `resident.list`

Get all residents with optional filtering.

**Type**: `query`

**Input**: (optional)
```typescript
{
  status?: "active" | "discharged"
}
```

**Output**:
```typescript
Array<{
  id: string;
  name: string;
  age: number;
  roomNumber: string;
  admissionDate: Date;
  dischargeDate?: Date;
  careLevel: number;  // 1-5
  status: string;
  medicalInfo?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  primaryCareWorkerId?: string;
  tags: string[];
  metadata?: Json;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Example**:
```typescript
const residents = await trpc.resident.list.useQuery({ status: "active" });
```

### `resident.getById`

Get a single resident by ID.

**Type**: `query`

**Input**:
```typescript
{
  id: string;
}
```

**Output**: Same as list item, or `null` if not found

### `resident.create`

Create a new resident.

**Type**: `mutation`

**Input**:
```typescript
{
  name: string;              // Required, min 1 char
  age: number;               // Required, min 0
  roomNumber: string;        // Required
  careLevel: number;         // Required, 1-5
  medicalInfo?: string;
  status?: "active" | "discharged";
}
```

**Output**: Created resident object

**Example**:
```typescript
const createMutation = trpc.resident.create.useMutation();
await createMutation.mutateAsync({
  name: "山田 太郎",
  age: 75,
  roomNumber: "101",
  careLevel: 3,
  medicalInfo: "高血圧症"
});
```

### `resident.update`

Update an existing resident.

**Type**: `mutation`

**Input**:
```typescript
{
  id: string;                // Required
  name?: string;
  age?: number;
  roomNumber?: string;
  careLevel?: number;
  medicalInfo?: string;
  status?: "active" | "discharged";
}
```

**Output**: Updated resident object

### `resident.delete`

Delete a resident.

**Type**: `mutation`

**Input**:
```typescript
{
  id: string;
}
```

**Output**: Deleted resident object

---

## Staff API

### `staff.list`

Get all staff members with optional filtering.

**Type**: `query`

**Input**: (optional)
```typescript
{
  department?: string;
  status?: string;
  role?: string;
}
```

**Output**:
```typescript
Array<{
  id: string;
  name: string;
  role: string;
  department?: string;
  email: string;
  phoneNumber?: string;
  hireDate: Date;
  terminationDate?: Date;
  status: string;
  certifications: string[];
  tags: string[];
  metadata?: Json;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    shifts: number;
  };
}>
```

**Example**:
```typescript
const nurses = await trpc.staff.list.useQuery({
  department: "看護部",
  status: "active"
});
```

### `staff.getById`

Get a single staff member by ID with related data.

**Type**: `query`

**Input**:
```typescript
{
  id: string;
}
```

**Output**: Staff object with:
- Last 10 shifts
- Last 5 reported incidents

### `staff.create`

Create a new staff member.

**Type**: `mutation`

**Input**:
```typescript
{
  name: string;              // Required, min 1 char
  role: string;              // Required, min 1 char
  department?: string;
  email: string;             // Required, valid email
  phoneNumber?: string;
  hireDate: Date;            // Required
  certifications?: string[];
  tags?: string[];
}
```

**Output**: Created staff object

**Logging**: Emits audit log and metrics

**Example**:
```typescript
const createStaff = trpc.staff.create.useMutation();
await createStaff.mutateAsync({
  name: "中村 健",
  role: "看護師",
  email: "nakamura@example.com",
  phoneNumber: "090-1234-5678",
  hireDate: new Date("2024-01-01"),
  certifications: ["正看護師"],
  tags: ["夜勤可"]
});
```

### `staff.update`

Update an existing staff member.

**Type**: `mutation`

**Input**:
```typescript
{
  id: string;                // Required
  name?: string;
  role?: string;
  department?: string;
  email?: string;            // Must be valid email
  phoneNumber?: string;
  status?: "active" | "inactive" | "on_leave";
  certifications?: string[];
  tags?: string[];
}
```

**Output**: Updated staff object

**Logging**: Emits audit log with changes

### `staff.delete`

Delete a staff member.

**Type**: `mutation`

**Input**:
```typescript
{
  id: string;
}
```

**Output**: Deleted staff object

**Logging**: Emits audit log with staff name

---

## Incident API

### `incident.list`

Get all incidents with optional filtering.

**Type**: `query`

**Input**: (optional)
```typescript
{
  status?: string;
  severity?: string;
  residentId?: string;
}
```

**Output**:
```typescript
Array<{
  id: string;
  title: string;
  description: string;
  occurredAt: Date;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  reportedBy?: string;
  reportedById?: string;
  residentId?: string;
  location?: string;
  status: string;
  witnesses: string[];
  actionsTaken?: string;
  preventiveMeasures?: string;
  tags: string[];
  metadata?: Json;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  reportedBy?: {
    id: string;
    name: string;
    role: string;
  };
  resident?: {
    id: string;
    name: string;
    roomNumber: string;
  };
}>
```

**Ordering**: Descending by `occurredAt`

**Metrics**: Tracks `incidents.total` business metric

**Example**:
```typescript
const criticalIncidents = await trpc.incident.list.useQuery({
  severity: "critical",
  status: "investigating"
});
```

### `incident.getById`

Get a single incident by ID with all related data.

**Type**: `query`

**Input**:
```typescript
{
  id: string;
}
```

**Output**: Incident object with:
- Full `reportedBy` staff object
- Full `resident` object
- All associated `documents`

### `incident.create`

Create a new incident.

**Type**: `mutation`

**Input**:
```typescript
{
  title: string;             // Required, min 1 char
  description: string;       // Required, min 1 char
  occurredAt: Date;          // Required
  severity: "low" | "medium" | "high" | "critical";  // Required
  category: string;          // Required
  reportedById?: string;
  residentId?: string;
  location?: string;
  witnesses?: string[];
  actionsTaken?: string;
  tags?: string[];
}
```

**Output**: Created incident object

**Side Effects**:
- Logs creation with title and severity
- Emits audit log
- Records `incidents.created` metric
- **Emits `incident.created` domain event**

**Example**:
```typescript
const createIncident = trpc.incident.create.useMutation();
await createIncident.mutateAsync({
  title: "居室内での転倒",
  description: "入所者が居室内で転倒。外傷なし。",
  occurredAt: new Date(),
  severity: "medium",
  category: "転倒",
  reportedById: staffId,
  residentId: residentId,
  location: "101号室",
  witnesses: ["小林 さくら"],
  actionsTaken: "医療スタッフによる確認実施",
  tags: ["要注意"]
});
```

### `incident.update`

Update an existing incident.

**Type**: `mutation`

**Input**:
```typescript
{
  id: string;                // Required
  title?: string;
  description?: string;
  severity?: "low" | "medium" | "high" | "critical";
  status?: string;
  actionsTaken?: string;
  preventiveMeasures?: string;
  tags?: string[];
}
```

**Output**: Updated incident object

**Side Effects**:
- Logs update with incident ID
- Emits audit log with changes
- **If status changed to "resolved"**: Emits `incident.resolved` domain event

**Example**:
```typescript
const updateIncident = trpc.incident.update.useMutation();
await updateIncident.mutateAsync({
  id: incidentId,
  status: "resolved",
  preventiveMeasures: "手順マニュアルを更新、スタッフに再教育実施"
});
```

### `incident.delete`

Delete an incident.

**Type**: `mutation`

**Input**:
```typescript
{
  id: string;
}
```

**Output**: Deleted incident object

---

## Shift API

### `shift.list`

Get all shifts with optional filtering.

**Type**: `query`

**Input**: (optional)
```typescript
{
  staffId?: string;
  startDate?: Date;
  endDate?: Date;
}
```

**Output**:
```typescript
Array<{
  id: string;
  staffId: string;
  date: Date;
  startTime: string;  // HH:MM format
  endTime: string;
  shiftType: string;
  status?: string;
  notes?: string;
  tags: string[];
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  staff: {
    id: string;
    name: string;
    role: string;
  };
}>
```

### `shift.create`

Create a new shift.

**Type**: `mutation`

**Input**:
```typescript
{
  staffId: string;           // Required
  date: Date;                // Required
  startTime: string;         // Required, HH:MM format
  endTime: string;           // Required, HH:MM format
  shiftType: string;         // Required (e.g., "早番", "日勤", "夜勤")
}
```

**Output**: Created shift object

### `shift.delete`

Delete a shift.

**Type**: `mutation`

**Input**:
```typescript
{
  id: string;
}
```

**Output**: Deleted shift object

---

## Domain Events

Domain events are emitted for significant business actions. Subscribe to events using the event bus:

```typescript
import { eventBus } from "@/lib/events/domain-events";

eventBus.on("incident.created", async (event) => {
  console.log("New incident:", event.data);
});
```

### Available Events

#### Resident Events
- `resident.created` - New resident admitted
- `resident.updated` - Resident info updated
- `resident.deleted` - Resident record deleted
- `resident.admitted` - (Reserved for future use)
- `resident.discharged` - (Reserved for future use)

#### Staff Events
- `staff.created` - New staff member added
- `staff.updated` - Staff info updated
- `staff.deleted` - Staff record deleted
- `staff.hired` - (Reserved for future use)
- `staff.terminated` - (Reserved for future use)

#### Incident Events
- `incident.created` - New incident reported
  - Data: `{ incidentId, severity, residentId?, reportedById? }`
- `incident.updated` - Incident updated
- `incident.resolved` - Incident marked as resolved
  - Data: `{ incidentId }`

#### Other Events
- `shift.created`, `shift.updated`, `shift.cancelled`
- `assessment.created`, `assessment.completed`
- `medication.prescribed`, `medication.discontinued`
- `task.created`, `task.completed`
- `note.created`

---

## Error Handling

### tRPC Errors

All errors follow the tRPC error format:

```typescript
{
  message: string;
  code: TRPCErrorCode;
  data?: {
    code: string;
    httpStatus: number;
    path: string;
    stack?: string;
  };
}
```

### Common Error Codes
- `BAD_REQUEST`: Invalid input (Zod validation failed)
- `NOT_FOUND`: Resource not found
- `INTERNAL_SERVER_ERROR`: Server error
- `UNAUTHORIZED`: Not authenticated (when auth is implemented)
- `FORBIDDEN`: Not authorized (when RBAC is implemented)

### Validation Errors

Zod validation errors return detailed field-level errors:

```typescript
try {
  await trpc.resident.create.mutate({ name: "", age: -5 });
} catch (error) {
  // error.data.zodError contains:
  // [
  //   { path: ["name"], message: "Name is required" },
  //   { path: ["age"], message: "Age must be positive" }
  // ]
}
```

---

## Rate Limiting

**Current State**: No rate limiting

**Production**: Implement rate limiting middleware:
- Per-user limits
- Per-IP limits
- Endpoint-specific limits

---

## Best Practices

### 1. Use TanStack Query hooks

```typescript
// Query
const { data, isLoading, error } = trpc.resident.list.useQuery();

// Mutation with optimistic updates
const utils = trpc.useUtils();
const createMutation = trpc.resident.create.useMutation({
  onSuccess: () => {
    utils.resident.list.invalidate();
  }
});
```

### 2. Handle loading and error states

```typescript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error.message} />;
return <ResidentList residents={data} />;
```

### 3. Use proper TypeScript types

```typescript
import type { RouterOutputs } from "@/lib/trpc/client";

type Resident = RouterOutputs["resident"]["list"][number];
```

### 4. Batch queries when possible

```typescript
const [residents, staff, incidents] = await Promise.all([
  trpc.resident.list.query(),
  trpc.staff.list.query(),
  trpc.incident.list.query({ severity: "high" }),
]);
```

### 5. Subscribe to relevant events

```typescript
useEffect(() => {
  const handler = (event: IncidentCreatedEvent) => {
    if (event.data.severity === "critical") {
      toast.error("Critical incident reported!");
    }
  };

  eventBus.on("incident.created", handler);
  return () => eventBus.off("incident.created");
}, []);
```

---

## Changelog

### Phase 3 (Current)
- Added Staff router with filtering and certifications
- Added Incident router with events and relations
- Implemented domain events system
- Added comprehensive logging and metrics
- Expanded data models with tags, metadata, soft deletes

### Phase 2
- Complete Resident CRUD with vertical slice
- Added update mutation
- Implemented comprehensive testing

### Phase 1
- Initial Resident, Staff, Shift, Incident routers
- Basic CRUD operations
- Seed data
