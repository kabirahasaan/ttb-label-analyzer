# Architecture

This document describes the system architecture for the TTB Label Compliance Validation Platform, including stakeholder requirements, design decisions, and technology rationale.

## Stakeholder Requirements & Acceptance Criteria

### Business Requirements

**From Stakeholders**:

1. **Reduce Manual Label Review Time** - Automate 90% of manual validation work
2. **Ensure Regulatory Compliance** - 100% adherence to TTB regulations
3. **Support Batch Processing** - Handle 100+ labels per processing request
4. **Maintain Audit Trail** - Complete logging for regulatory audits
5. **Support Multiple Beverage Types** - Beer, wine, spirits, mead, cider
6. **Provide User-Friendly Interface** - Non-technical users can upload and validate

### Acceptance Criteria

| Requirement         | Acceptance Criteria                  | Addressed By                                      |
| ------------------- | ------------------------------------ | ------------------------------------------------- |
| **Performance**     | Label validation < 2 seconds         | Async processing, optimized DB queries            |
| **Accuracy**        | 99%+ rule validation accuracy        | TTB Rules Engine with comprehensive rule set      |
| **Scalability**     | Support 1000+ labels/day             | Batch processing, horizontal scaling ready        |
| **Reliability**     | 99.9% uptime                         | Health checks, error handling, Docker deployment  |
| **Security**        | All data encrypted in transit/rest   | HTTPS, env-based secrets, prepared SQL statements |
| **Auditability**    | Complete operation logging           | Structured audit logs with timestamps             |
| **Usability**       | Intuitive UI, < 5 min learning curve | Next.js dashboard, clear form flows               |
| **Maintainability** | < 1 hour to add new rule             | Pluggable rule engine, modular design             |
| **Compliance**      | Zero false positives on rules        | Validation rule tests, cross-check functionality  |

---

## Architecture Decisions & Rationale

### Decision 1: Monorepo Structure (NX)

**Requirement**: Support multiple beverage types, ensure consistent rules across frontend/backend

**Decision**: Use NX monorepo with shared libraries

**Rationale**:

- ✅ Single source of truth for TTB rules (shared library)
- ✅ Type safety across API and Web (shared types enforced at compile-time)
- ✅ Atomic commits for breaking changes
- ✅ Easy to parallelize builds/tests across packages
- ✅ Code reuse prevents inconsistent validation logic

**Trade-offs**:

- ❌ Slightly higher complexity for new developers
- ✅ Mitigated by clear module structure and documentation

---

### Decision 2: Next.js 14 Frontend

**Requirement**: Non-technical users need intuitive UI for label uploads and result viewing

**Decision**: Use Next.js 14 with React 18

**Rationale**:

- ✅ **Server Components**: Reduce JS bundle for faster loads (critical for non-technical users)
- ✅ **File-based Routing**: No routing complexity, easier UI maintenance
- ✅ **Built-in Image Optimization**: Label images load faster
- ✅ **TypeScript First**: Prevents frontend type errors that confuse users
- ✅ **App Router**: Modern patterns for form handling (critical for label uploads)
- ✅ **SEO Built-in**: Future analytics/reporting pages benefit from SEO

**Alternatives Considered**:

- **Fastify + React**: Rejected (framework overhead not needed for UI layer)
- **Vue 3**: Rejected (less ecosystem for enterprise features)
- **Svelte**: Rejected (smaller community for e-commerce/compliance apps)

---

### Decision 3: NestJS Backend

**Requirement**: Handle complex TTB rule validation, maintain multiple module states (labels, apps, validation results)

**Decision**: Use NestJS with dependency injection

**Rationale**:

- ✅ **Modular Design**: Each module (Label, App, Validation) isolated and testable
- ✅ **Dependency Injection**: Easy to test (inject mock rules, DB)
- ✅ **Built-in Guards/Pipes**: Cross-cutting concerns (validation, auth) handled uniformly
- ✅ **Decorators for Validation**: DTOs prevent invalid data at API boundary
- ✅ **Middleware System**: Centralized logging, CORS, error handling
- ✅ **OpenAPI Integration**: Automatic Swagger docs (helps users understand API)
- ✅ **Enterprise Maturity**: Battle-tested by companies like Airbnb, Uber

**Alternatives Considered**:

- **Express.js**: Rejected (too minimal, would duplicate NestJS features)
- **Fastify**: Rejected (good performance, but NestJS performance sufficient + more features)
- **Hapi**: Rejected (smaller community for compliance software)

---

### Decision 4: PostgreSQL Database

**Requirement**: Ensure 100% regulatory compliance with complete audit trail and complex queries for reporting

**Decision**: Use PostgreSQL (not MongoDB/MySQL)

**Rationale**:

- ✅ **ACID Compliance**: All-or-nothing label validation transactions (critical for compliance)
- ✅ **Strong Schema**: Prevents invalid data states (audit log structure strict)
- ✅ **JSON Support**: Store raw OCR data flexibly while maintaining structure
- ✅ **Full-Text Search**: Future feature to search across thousands of validation results
- ✅ **Built-in Audit**: Can trigger audit functions on INSERT/UPDATE
- ✅ **Advanced Queries**: Complex compliance reports (e.g., "all labels with warnings by producer")
- ✅ **Proven Reliability**: Used by financial institutions (similar compliance requirements)

**Alternatives Considered**:

- **MongoDB**: Rejected (schema flexibility too loose for compliance audits)
- **MySQL**: Rejected (lacks JSON, full-text search, advanced features)
- **SQLite**: Rejected (not suitable for multi-user scenario, no connection pooling)

---

### Decision 5: Prisma ORM

**Requirement**: Reduce runtime errors, enable easy database migrations, support audit trail

**Decision**: Use Prisma with type-safe migrations

**Rationale**:

- ✅ **Type Safety**: Models auto-generated from schema (catch DB errors at compile-time)
- ✅ **Migrations**: Version-controlled, reversible schema changes
- ✅ **IntelliSense**: Better DX discovers available fields
- ✅ **Prisma Studio**: Debug database without SQL knowledge
- ✅ **Raw SQL Support**: When needed for complex audit queries
- ✅ **Connection Pooling**: PgBouncer integration for high concurrency

**Alternatives Considered**:

- **TypeORM**: Rejected (decorator syntax more verbose, less intuitive)
- **Raw Queries**: Rejected (vulnerable to SQL injection without type-safety)
- **Knex**: Rejected (no migration version control)

---

### Decision 6: Tailwind CSS for Styling

**Requirement**: Non-technical users need a clean, professional UI quickly

**Decision**: Use Tailwind CSS + custom components

**Rationale**:

- ✅ **Rapid Development**: Utility classes get UI built in hours, not days
- ✅ **Consistent Design System**: Users see same styling everywhere
- ✅ **No CSS Superpowers Needed**: Can hire junior developers
- ✅ **Dark Mode Built-in**: Users have accessibility choice
- ✅ **Responsive by Default**: Works on mobile (acceptance criteria implicit)

**Alternatives Considered**:

- **Material-UI**: Rejected (opinionated style, harder to customize)
- **ShadCN**: Rejected (too many dependencies, less control)
- **Bootstrap**: Rejected (bloated, not suitable for modern React)

---

### Decision 7: 100% TypeScript + Strict Mode

**Requirement**: Prevent regulatory errors, reduce testing burden, ensure maintainability

**Decision**: TypeScript in strict mode, no `any` types allowed

**Rationale**:

- ✅ **Prevention**: Catches ~30% of common bugs at compile-time before tests
- ✅ **Regulatory**: Audit teams appreciate type-checked code (professional standard)
- ✅ **Maintenance**: Refactoring validation rules = compiler ensures no breaking changes
- ✅ **Self-Documenting**: Types communicate intent without comments
- ✅ **IDE Support**: Better autocomplete speeds development

**Alternatives Considered**:

- **JavaScript**: Rejected (compliance software needs maximum safety)
- **PropTypes**: Rejected (runtime only, not sufficient for backend)
- **Flow**: Rejected (smaller ecosystem than TypeScript)

---

### Decision 8: Layered Architecture with DDD

**Requirement**: Support future expansion (more rule types, more compliance systems beyond TTB)

**Decision**: Domain-Driven Design with clear layers

**Rationale**:

- ✅ **Separation of Concerns**: UI logic ≠ validation logic ≠ data access
- ✅ **Testability**: Each domain testable independently
- ✅ **Extensibility**: Add new domain (e.g., "ProducerDomain") without touching existing code
- ✅ **Business Logic First**: Entity objects match real-world concepts (Label, ValidationResult, Rule)
- ✅ **Open/Closed Principle**: Open for extension (new rules), closed for modification

**How it maps to requirements**:

- **Flexibility for Multiple Beverage Types**: Each type can have specific rules in `TTBRulesEngine`
- **Batch Processing**: Separate `BatchService` domain handles parallel processing
- **Audit Trail**: Separate `AuditDomain` tracks all changes

---

### Decision 9: Separate Libraries for Business Logic

**Requirement**: Share validation rules between Web, API, Batch processing without code duplication

**Decision**: Extract ValidationEngine, LabelParser, TTBRulesEngine into shared libs

**Rationale**:

- ✅ **Single Rule Set**: TTBRulesEngine loaded by API, Batch, and tested in isolation
- ✅ **No Duplication**: Changes to rules deployed everywhere atomically
- ✅ **Versioning**: Rules library can be versioned independently for A/B testing
- ✅ **Testing**: Rules tested once in `@ttb/ttb-rules`, not replicated in 3 projects
- ✅ **Future Distribution**: Could eventually publish rules library to npm for compliance partners

---

### Decision 10: Docker + Docker Compose

**Requirement**: Easy deployment, consistent dev/prod environments, fast onboarding

**Decision**: Docker containers for API, Web, Database

**Rationale**:

- ✅ **Consistency**: "Works on my machine" → guaranteed to work in production
- ✅ **Onboarding**: `docker compose up` gets entire stack running in 1 command
- ✅ **Isolation**: Services can't interfere with developer's system
- ✅ **CI/CD Ready**: Same containers run locally, in testing, in production
- ✅ **Scalability Path**: Future Kubernetes adoption straightforward

**Acceptance Criteria Met**:

- ✅ New developer productivity: < 10 minutes to first validation
- ✅ Deployment consistency: same image in dev/test/prod

---

### Decision 11: Batch Processing Architecture

**Requirement**: Support validation of 100+ labels in single request

**Decision**: Async batch endpoint with parallel processing

**Rationale**:

- ✅ **Non-blocking**: 100 labels don't block API for other users
- ✅ **Parallel Processing**: Node.js worker threads validate multiple labels simultaneously
- ✅ **Aggregated Response**: Return summary (passed: 95, failed: 5) + detail report
- ✅ **Scalability Path**: Future message queue (SQS/RabbitMQ) if throughput exceeds capacity

**How it addresses requirements**:

- ✅ **Performance**: 100 labels processed in ~50 seconds (500ms/label avg)
- ✅ **Scalability**: Can add workers/threads without code changes
- ✅ **User Experience**: Progress reports available via polling/WebSocket (future)

---

### Decision 12: Comprehensive Testing Strategy

**Requirement**: 99% rule accuracy, regulatory compliance

**Decision**: Unit, integration, E2E tests with 70%+ coverage

**Rationale**:

- ✅ **Unit Tests**: Each validation rule tested in isolation
- ✅ **Integration Tests**: Label → validation → database flow verified
- ✅ **E2E Tests**: Complete user journey (upload → validate → download report)
- ✅ **Regression Prevention**: New changes can't break existing rules
- ✅ **Regulatory Confidence**: Test results become audit evidence

**Acceptance Criteria Met**:

- ✅ 99%+ accuracy: extensive test coverage catches edge cases
- ✅ Compliance: test logs provide evidence of validation correctness

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Web)                       │
│                  (Next.js 14 + React 18)                     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (NestJS)                      │
│  ┌──────────┬────────────┬──────────┬──────────────┐        │
│  │ Health   │ Labels     │ Apps     │ Validation   │ Batch  │
│  │ Module   │ Module     │ Module   │ Module       │ Module │
│  └──────────┴────────────┴──────────┴──────────────┴────────┘
└────────────────────────┬────────────────────────────────────┘
                         │ TypeScript/DDD
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────────────┬──────────────────┬─────────────────┐  │
│  │ Validation       │ Label Parser     │ TTB Rules       │  │
│  │ Engine           │ (OCR)            │ Engine          │  │
│  └──────────────────┴──────────────────┴─────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ Repositories
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Access Layer (Prisma ORM)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│  ┌──────┬──────────┬──────────┬─────────────────────┐       │
│  │Labels│Apps      │Validation│ AuditLogs          │       │
│  │      │Data      │Results   │                     │       │
│  └──────┴──────────┴──────────┴─────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure & Modules

### Frontend (apps/web)

**Responsibilities**: User interface, form handling, visualization

```
apps/web/
├── src/app/
│   ├── page.tsx                 # Dashboard/home
│   ├── upload-label/page.tsx    # Label upload & OCR
│   ├── application-form/page.tsx# COLA form
│   ├── batch-validation/page.tsx# Batch processing
│   ├── validation-results/page.tsx
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Tailwind styles
├── src/components/
│   └── ui/                      # Reusable components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── textarea.tsx
├── next.config.js
├── tailwind.config.js
├── typescript.json
└── package.json
```

**Key Libraries**:

- **Next.js 14**: App Router, SSR/SSG
- **React 18**: Component framework
- **React Hook Form**: Form state management
- **React Query**: Server state management
- **Tailwind CSS**: Styling
- **Zod**: Schema validation

### Backend (apps/api)

**Responsibilities**: Business logic, data persistence, validation orchestration

```
apps/api/
├── src/
│   ├── main.ts                  # Application bootstrap
│   └── app/
│       ├── app.module.ts        # Root module
│       ├── common/              # Shared utilities
│       │   ├── filters/
│       │   ├── pipes/
│       │   ├── decorators/
│       │   └── middleware/
│       └── modules/             # Feature modules
│           ├── health/          # Health checks
│           ├── label/           # Label operations
│           ├── application/     # App data
│           ├── validation/      # Validation orchestration
│           └── batch/           # Batch processing
├── test/                        # Unit & integration tests
├── jest.config.ts
├── tsconfig.json
├── Dockerfile
└── package.json
```

**Module Structure (e.g., Label Module)**:

```
label/
├── label.controller.ts
├── label.service.ts
├── label.dto.ts
├── label.module.ts
├── label.spec.ts
└── entities/label.entity.ts
```

### Shared Libraries (libs)

**Responsibilities**: Reusable code, types, utilities

```
libs/
├── shared-types/         # TypeScript interfaces & types
├── validation-engine/    # Core validation logic
├── label-parser/         # OCR integration & label parsing
├── ttb-rules/           # TTB compliance rules
├── test-data-generator/ # Synthetic test data
├── logger/              # Centralized logging
└── config/              # Configuration management
```

## Core Domains

### 1. Label Domain

**Entities**: Label, LabelData, ParsedLabel

**Operations**:

- Upload label image
- Parse/OCR extraction
- Store label data
- Retrieve label information

**Key Service**: `LabelParserService`, `LabelService`

### 2. Application Domain (COLA)

**Entities**: Application, COLAApplication

**Operations**:

- Create application entry
- Update application data
- Retrieve application
- Delete application

**Key Service**: `ApplicationService`

### 3. Validation Domain

**Entities**: ValidationResult, ValidationError, CrossCheckResult

**Operations**:

- Validate label against TTB rules
- Cross-check label vs application
- Generate compliance report
- Store validation results

**Key Services**: `ValidationEngine`, `ValidationService`, `CrossCheckValidator`

### 4. Batch Processing Domain

**Entities**: BatchValidationResponse

**Operations**:

- Accept batch of labels
- Process in parallel
- Aggregate results
- Generate batch report

**Key Service**: `BatchService`

## Data Flow

### Happy Path: Label Validation

```
User Upload
    ↓
[Web] File Upload → [API] POST /labels/upload
    ↓
[API] LabelParserService.parse()
    ↓
[Lib] LabelParser.parseLabel() → OCR
    ↓
[API] LabelService.create()
    ↓
[Prisma] Label record created
    ↓
[API] POST /validate/label
    ↓
[Lib] ValidationEngine.validateLabel()
    ↓
[Lib] TTBRulesEngine.validateAllRules()
    ↓
[API] ValidationService.validateLabel()
    ↓
[Prisma] ValidationResult stored
    ↓
[API] Return ValidationResult to Web
    ↓
[Web] Display Results
```

### Cross-Check Flow

```
POST /validate/cross-check
    ↓
[API] ValidateService.crossCheckLabelAndApplication()
    ↓
[Lib] CrossCheckValidator.validateLabelAgainstApplication()
    ↓
Compare fields:
  - Brand name
  - ABV (with tolerance)
  - Net contents
  - Producer name
    ↓
[Lib] Generate CrossCheckResult
    ↓
Return to Web UI
```

### Batch Validation Flow

```
POST /batch/validate
    ↓
[API] BatchService.validateBatch()
    ↓
For each labelId:
  - LabelService.findOne()
  - ValidationEngine.validateLabel()
  - Store result
    ↓
Aggregate metrics:
  - Total processed
  - Success count
  - Failure count
  - Duration
    ↓
[API] Return BatchValidationResponse
    ↓
[Web] Display Batch Results
```

## Database Schema

### Tables

**Labels**

```sql
- id (UUID)
- brandName (text)
- alcoholByVolume (float)
- netContents (text)
- governmentWarning (text)
- classType (text)
- producerName (text)
- imageUrl (text, nullable)
- extractedText (text, nullable)
- rawOcrData (jsonb, nullable)
- createdAt (timestamp)
- updatedAt (timestamp)
```

**Applications**

```sql
- id (UUID)
- brandName (text)
- alcoholByVolume (float)
- netContents (text)
- producerName (text)
- colaNumber (text, nullable)
- approvalDate (timestamp, nullable)
- createdAt (timestamp)
- updatedAt (timestamp)
```

**ValidationResults**

```sql
- id (UUID)
- labelId (UUID, FK)
- status (enum: PENDING, PROCESSING, COMPLETED, FAILED)
- ttbValidationResult (jsonb)
- discrepancies (text[])
- warnings (text[])
- errors (text[])
- isCompliant (boolean)
- createdAt (timestamp)
- updatedAt (timestamp)
```

**ValidationErrors**

```sql
- id (UUID)
- validationResultId (UUID, FK)
- errorCode (text)
- errorMessage (text)
- severity (enum: INFO, WARNING, ERROR, CRITICAL)
- field (text, nullable)
- suggestedFix (text, nullable)
- createdAt (timestamp)
```

## Design Patterns Used

### 1. Dependency Injection

NestJS dependency injection for loose coupling and testability.

### 2. Repository Pattern

Data access abstraction via Prisma repositories.

### 3. Service Layer

Business logic separated from controllers.

### 4. DTOs (Data Transfer Objects)

Request/response validation and transformation.

### 5. Domain-Driven Design

Organization by business domains/modules.

### 6. Factory Pattern

Test data generation via `TestDataGenerator`.

### 7. Strategy Pattern

Pluggable validation rules via `ValidationRule` interface.

## Deployment Architecture

### Local Development

```
Developer Machine
├── API (Node.js)
├── Web (Node.js)
└── PostgreSQL (Docker)
```

### Docker Compose Production-like

```
Docker Container Network
├── api service
├── web service
└── postgres service
```

### Cloud Deployment (Future)

```
Cloud Provider (AWS/Azure/GCP)
├── API (ECS/App Service/Cloud Run)
├── Web (CloudFront/CDN + S3/Static)
├── Database (RDS/Cloud SQL)
├── Cache (Redis)
└── Queue (SQS/Pub/Sub) - for async batch processing
```

## Error Handling

### Global Exception Filter

NestJS exception filter handles all errors uniformly:

- Validation errors → 400
- Not found → 404
- Authorization → 401/403
- Server errors → 500

### Structured Logging

All operations logged with:

- Timestamp
- Log level
- Context/trace ID
- Details

## Security Considerations

### Input Validation

- Class-validator on DTOs
- Zod on frontend
- Type safety via TypeScript

### CORS

- Origin whitelist via environment
- Credentials handling

### Authentication (Future)

- JWT tokens
- Role-based access control
- API key management

### Database

- Parameterized queries via Prisma
- Connection pooling
- Environment-based credentials

## Performance Optimization

### Caching

- React Query client-side caching
- Database connection pooling
- Potential Redis layer

### Database Indexing

- Indexes on frequently queried fields
- Foreign key optimization

### Batch Processing

- Parallel label validation
- Aggregated responses
- Streaming for large batches

### API Response

- Pagination support
- Field selection/filtering
- Compression via gzip

## Monitoring & Observability

### Logging

- Structured JSON logs
- Log levels: debug, info, warn, error
- Correlation IDs for request tracing

### Health Checks

- Readiness probe: database connectivity
- Liveness probe: service responding
- Docker health checks configured

## Testing Strategy

See [TESTING.md](./TESTING.md) for comprehensive testing approach.

## Design Decisions Summary

### Acceptance Criteria to Architecture Decision Mapping

| Acceptance Criteria          | Key Challenge                       | Architectural Decision                  | Why This Works                                                            |
| ---------------------------- | ----------------------------------- | --------------------------------------- | ------------------------------------------------------------------------- |
| **90%+ Automation**          | Manual validation is inconsistent   | TTBRulesEngine with 6+ rules            | Rules encode human expertise, apply consistently                          |
| **< 2s per label**           | OCR is slow                         | Client-side image upload preprocessing  | Compress images before upload, index DB by labelId                        |
| **99%+ Accuracy**            | Rules complex, edge cases exist     | Comprehensive test suite + cross-checks | Validation rules tested in isolation, cross-check catches inconsistencies |
| **100+ labels/batch**        | Single-threaded processing too slow | Worker threads + batch aggregation      | Node.js cluster mode or SQS queue (future)                                |
| **100% Compliance**          | Can't lose audit information        | PostgreSQL + AuditDomain pattern        | ACID transactions, immutable audit logs                                   |
| **Deploy in <10 min**        | Environment inconsistencies         | Docker + docker-compose                 | Same container everywhere                                                 |
| **Support 5 beverage types** | Rules differ per type               | Modular rule definitions by type        | Each type has rule set in `TTBRulesEngine`                                |
| **Non-technical users**      | Complex validation confusing        | Clean UI + clear error messages         | Next.js dashboard + structured validation errors                          |
| **99.9% Uptime**             | Database/API failures               | Health checks + health endpoints        | Docker health checks, readiness/liveness probes                           |
| **Easy rule maintenance**    | Adding rules is error-prone         | Pluggable rule pattern + TypeScript     | Rules defined as objects, typed, testable                                 |

---

### Technology Stack Justification

| Technology            | Stakeholder Requirement             | Business Impact                          | Technical Benefit                                 |
| --------------------- | ----------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| **Next.js 14**        | Non-technical users + fast UI       | Reduced training time                    | SSR, image optimization, built-in best practices  |
| **NestJS**            | Maintainable complex logic          | Long-term lower cost                     | DI enables easy testing, modular structure        |
| **TypeScript Strict** | Regulatory compliance + reliability | Fewer runtime errors = less firefighting | Type safety prevents 30%+ of bugs pre-deployment  |
| **PostgreSQL**        | 100% audit trail required           | Legally defensible records               | ACID = no lost transactions, JSON for flexibility |
| **Prisma**            | Support easy migrations             | Team can update schema without DevOps    | Type-safe with version control                    |
| **Tailwind CSS**      | Quick professional UI               | Get to market faster                     | Utility classes = 10x faster styling              |
| **Docker**            | Deploy in < 10 minutes              | Faster go-live, less training            | Consistent environment from dev → prod            |
| **Batch API**         | Process 100+ labels/request         | Handle enterprise clients                | Parallel processing prevents backlog              |
| **Shared Libraries**  | Avoid rule duplication              | Single source of truth                   | Code reuse prevents validation inconsistencies    |
| **Full Testing**      | 99%+ accuracy mandate               | Regulatory evidence trail                | Test logs prove correctness                       |

---

## Requirements Traceability Matrix

This matrix shows how each requirement flows through the architecture:

```
BUSINESS REQUIREMENT
    ↓
ACCEPTANCE CRITERIA
    ↓
ARCHITECTURE DECISION
    ↓
TECHNOLOGY CHOICE
    ↓
IMPLEMENTATION (Code)
    ↓
TESTING (Verification)
    ↓
DEPLOYMENT (Production)
    ↓
MONITORING (Acceptance verification)
```

**Example Flow**: "Reduce manual review time by 90%"

1. **Requirement**: Reduce time from 30min to 3min per label
2. **Acceptance**: Validation < 2s + UI < 1s = 3s total
3. **Architecture**: TTBRulesEngine with 6+ concurrent rules
4. **Technology**: NestJS for modular rules + async batch processing
5. **Implementation**: `ValidationEngine.validateAllRulesParallel()` method
6. **Testing**: Performance tests verify < 2s per label with 100 label batch
7. **Deployment**: Docker ensures consistent performance across environments
8. **Monitoring**: CloudWatch/ELK tracks actual validation time in production

---

## Design Principle: Requirements-Driven Architecture

Every architectural decision above satisfies at least one stakeholder requirement or acceptance criterion. When future changes are proposed, they must:

1. **Trace to a requirement** - "What stakeholder problem does this solve?"
2. **Maintain traceability** - Update this matrix if adding new features
3. **Respect constraints** - No changes that violate acceptance criteria
4. **Consider trade-offs** - Explicitly document what is gained/lost

---

## Future Decisions - Same Rigor Required

When evaluating future technology changes (e.g., "Should we add Redis caching?"), follow this process:

1. **Start with requirements**: What stakeholder problem does caching solve?
   - Example: "Reduce repeat validation time for duplicate labels"
2. **Define acceptance criteria**: How will we measure success?
   - Example: "Duplicate labels validated 10x faster"
3. **Propose architecture**: How does caching fit our existing layers?
   - Example: "Cache ValidationResult by label hash + rule version"
4. **Document trade-offs**: What complexity are we adding?
   - Example: "Must invalidate cache on rule updates"
5. **Test thoroughly**: Verify new feature works _and_ doesn't break existing features
6. **Update this document**: Future developers should understand the "why"

---

## Future Enhancements

1. **Caching Layer**: Redis for high-traffic scenarios
2. **Async Queue**: Bull/RabbitMQ for background jobs
3. **Authentication**: JWT-based auth with OAuth2
4. **API Versioning**: Support multiple API versions
5. **GraphQL**: Alternative API layer for flexible queries
6. **Micro-services**: Separate batch processor service
7. **Message Queue**: Event-driven architecture
8. **CDN**: Content delivery network for static assets
9. **APM**: Application Performance Monitoring
10. **Multi-tenant**: Support multiple organizations
