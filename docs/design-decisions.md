---
title: Design Decisions & Assumptions
layout: default
nav_order: 7
---

# Design Decisions & Assumptions

This document outlines key design decisions, assumptions, and UX choices made during the development of the TTB Label Analyzer.

## Overview

While building this system, we analyzed both **explicit requirements** (clearly stated) and **implicit/ambiguous requirements** (open-ended or unstated). This document explains our reasoning and the decisions made to deliver a functional, user-friendly system.

---

## Key Design Decisions

### 1. Application Data Source & Management

#### **Problem Statement**
The requirements didn't specify:
- Do users already have application data in the system?
- Should application data come from an external COLA system?
- Do users need to enter it manually?
- What's the primary workflow?

#### **Decision Made**
For this implementation, we assumed users would manage application data through:
1. **Manual entry** via the Application Form page
2. **Batch upload** via CSV import
3. **Pre-seeded test data** for development/testing

#### **Rationale**
- **Rapid development**: Manual entry allows immediate user feedback without external system integration
- **Flexibility**: Users can test the system without dependencies
- **Clear demonstration**: Shows both single-entry and bulk-upload workflows
- **Future-ready**: Architecture supports COLA system integration as an enhancement

#### **Future Enhancement Path**
The system can be extended to:
- Integrate with existing COLA database via API
- Auto-sync applications from TTB systems
- Scheduled data pipeline imports
- Webhook-based real-time updates

**Code Location**: `apps/api/src/app/modules/application/` - designed with repository pattern for easy data source swapping

---

### 2. Single vs. Batch Validation Pages

#### **Problem Statement**
Should label validation be a single unified page or separate workflows?

#### **Decision Made**
Created **two separate pages**:
1. **Upload Label** (`/upload-label`) - Single label validation
2. **Batch Validation** (`/batch-validation`) - Multiple labels at once

#### **Rationale**
- **Feature demonstration**: Showcases both use cases clearly
- **User clarity**: Different workflows for different needs
- **Rich features**: Each page optimized for its specific use case
- **Stakeholder feedback**: Easier to gather feedback on distinct workflows

#### **Can Be Changed**
These pages can easily be merged into a unified interface if stakeholders prefer:
- Single page with tabs (Single / Batch)
- Unified uploader detecting file type (image vs CSV)
- Progressive disclosure (starts simple, expands for batch)

The code is componentized to support either approach.

**Code Location**: 
- `apps/web/src/app/upload-label/page.tsx`
- `apps/web/src/app/batch-validation/page.tsx`

---

### 3. Validation Workflow Structure

#### **Decision Made**
**Step-by-step validation workflow**:
1. Upload image/data
2. OCR extraction (automatic)
3. Rules validation (automatic)
4. COLA cross-check (automatic)
5. Results display

#### **Rationale**
- **Transparency**: Users see what's happening at each step
- **Trust**: Progress indicators build confidence
- **Debugging**: Easier to identify where issues occur
- **Educational**: Users learn the validation process

#### **Alternative Considered**
- Single-click "validate and done" (too opaque)
- Manual step progression (too slow)

**Code Location**: `apps/web/src/components/ui/validation-progress.tsx`

---

### 4. Test Data Strategy

#### **Problem Statement**
How should users access test data for development and validation?

#### **Decision Made**
- **9 pre-seeded applications** loaded automatically on API startup
- **12 test images** included in repository
- **Sample CSV files** in documentation
- **Auto-seeding on every server start** (development)

#### **Rationale**
- **Zero setup**: Users can test immediately
- **Consistent testing**: Everyone uses same baseline data
- **Documentation examples**: Test data referenced in guides
- **Development speed**: No manual database setup needed

#### **Production Behavior**
In production (Railway deployment):
- Test data still auto-seeds for demonstration
- Users can add real production data
- Test data can be cleared if needed

**Code Location**: `libs/test-data-generator/test-data/applications.json`

---

### 5. Error Handling Philosophy

#### **Decision Made**
**User-friendly error messages** with actionable guidance:
- Clear error titles
- Specific problem descriptions
- Suggested fixes
- Visual severity indicators (color, icons)

#### **Example**
Instead of:
```
Error: Validation failed
```

We show:
```
⚠️ Minor Issues Detected

ABV Discrepancy: Label shows 5.6%, application shows 5.5% (0.1% difference)
→ Review and confirm if this is acceptable within tolerance

Producer Name Mismatch: Label shows "Coca-Cola Company", application shows "Coca-Cola Co."
→ May be acceptable as abbreviation
```

#### **Rationale**
- Reduces support burden
- Builds user confidence
- Teaches users about TTB requirements
- Actionable next steps

**Code Location**: `apps/web/src/components/validation/`

---

### 6. API Design Principles

#### **Decision Made**
**RESTful API with clear semantics**:
- Resource-based routes (`/applications`, `/labels`, `/validate`)
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent response format
- Comprehensive Swagger documentation

#### **Example Endpoints**
```
POST   /applications          # Create application
GET    /applications          # List all
GET    /applications/:id      # Get one
POST   /applications/batch    # Bulk create

POST   /validate/label        # Validate single
POST   /validate/batch        # Validate multiple
GET    /validate/results      # Get history
```

#### **Rationale**
- **Standard conventions**: Easy for developers to understand
- **Self-documenting**: Swagger UI provides interactive docs
- **Future integration**: Easy to consume by other systems
- **Versioning ready**: Can add `/v2` routes if needed

**Code Location**: `apps/api/src/app/modules/`

---

### 7. Frontend Framework & Architecture

#### **Decision Made**
**Next.js 14 with App Router**:
- Server components where beneficial
- Client components for interactivity
- File-based routing
- TypeScript throughout

#### **Rationale**
- **Performance**: Server components reduce JavaScript bundle
- **SEO**: Server-side rendering for documentation
- **Developer experience**: Hot reload, TypeScript, modern tooling
- **Production-ready**: Vercel deployment optimized for Next.js

#### **Alternative Considered**
- Plain React (more setup, less optimized)
- Vue/Angular (team familiarity with React)

**Code Location**: `apps/web/src/app/`

---

### 8. Styling Approach

#### **Decision Made**
**Tailwind CSS + Radix UI components**:
- Utility-first styling (Tailwind)
- Accessible primitives (Radix)
- Custom design system
- Responsive by design

#### **Rationale**
- **Speed**: Rapid UI development
- **Accessibility**: Radix ensures WCAG compliance
- **Consistency**: Design tokens enforce standards
- **Maintainability**: No CSS file sprawl

**Code Location**: 
- `apps/web/src/components/ui/` (Radix components)
- `apps/web/src/styles/` (Tailwind config)

---

### 9. Database Choice

#### **Decision Made**
**PostgreSQL** for persistence:
- Relational structure
- ACID compliance
- JSON support for flexibility
- Railway managed database in production

#### **Rationale**
- **Data integrity**: Relational model fits COLA applications
- **Query power**: Complex filters and joins
- **Production-ready**: Robust, proven, scalable
- **TypeScript integration**: Prisma ORM for type safety

#### **Alternative Considered**
- In-memory (too ephemeral for production)
- MongoDB (relationships are clearer in SQL)

**Code Location**: `prisma/schema.prisma`

---

### 10. Deployment Strategy

#### **Decision Made**
**Separate frontend and backend deployments**:
- **Frontend**: Vercel (Next.js optimized)
- **Backend**: Railway (Node.js + PostgreSQL)
- **Communication**: HTTPS REST API with CORS

#### **Rationale**
- **Scalability**: Scale frontend and backend independently
- **Performance**: CDN for frontend, dedicated compute for backend
- **Cost**: Free tiers sufficient for demonstration
- **Simplicity**: No container orchestration needed

#### **Future Scaling**
Can move to:
- Kubernetes for more control
- AWS/Azure for enterprise requirements
- Separate API gateway
- Microservices if needed

**Code Location**: 
- `vercel.json` (frontend config)
- `Dockerfile` (backend container)

---

## Assumptions Made

### User Personas

We assumed three primary user types:

1. **Compliance Officer**
   - Validates labels before submission to TTB
   - Needs batch validation for efficiency
   - Values detailed compliance reports

2. **QA Engineer**
   - Tests label validation during product development
   - Needs single-label workflow
   - Values visual feedback and progress

3. **Operations Manager**
   - Reviews validation history
   - Needs export/reporting features
   - Values dashboard view

### Workflow Assumptions

1. **Application data exists or can be created** before label validation
2. **Labels are digital images** (JPG/PNG), not physical labels requiring scanning
3. **Users have modern browsers** (Chrome, Firefox, Safari, Edge)
4. **Internet connectivity** is available (not offline-first)
5. **OCR accuracy is sufficient** for most commercial labels
6. **English language** labels primarily (can extend to multi-language)

### Data Assumptions

1. **ABV tolerance**: ±0.5% is acceptable variance
2. **Net contents format**: Flexible (12 oz, 750ml, 1.75L all valid)
3. **Brand name matching**: Fuzzy matching acceptable for minor differences
4. **Producer name**: Can be abbreviated or full legal name
5. **COLA numbers**: Follow format "COLA-YYYY-###"

### Technical Assumptions

1. **Average label image size**: 1-5 MB
2. **OCR processing time**: 2-10 seconds per image
3. **Concurrent users**: < 100 simultaneous users initially
4. **Data retention**: Validation results stored indefinitely
5. **API rate limiting**: Not required for initial deployment

---

## Trade-offs & Compromises

### 1. In-Memory Database for Development

**Trade-off**: Data resets on server restart  
**Benefit**: Zero setup, instant feedback  
**Mitigation**: Use PostgreSQL in production

### 2. Simplified OCR vs. Enterprise OCR

**Trade-off**: May miss some edge cases  
**Benefit**: Fast implementation, lower cost  
**Future**: Can upgrade to Tesseract/Google Vision API

### 3. Manual Application Entry

**Trade-off**: More user effort  
**Benefit**: No external system dependencies  
**Future**: COLA system integration removes this burden

### 4. Single-Page Workflows

**Trade-off**: Some navigation overhead  
**Benefit**: Clear separation of concerns  
**Future**: Can combine into unified interface

### 5. Client-Side Image Preview

**Trade-off**: Large images sent to browser  
**Benefit**: Immediate visual feedback  
**Mitigation**: 10MB file size limit

---

## Not Implemented (Out of Scope)

These features were considered but deliberately excluded:

1. **User Authentication**
   - Reason: Not in requirements, adds complexity
   - Future: Can add Auth0, Clerk, or similar

2. **Multi-Tenancy**
   - Reason: Single organization assumed
   - Future: Add organization/tenant scoping

3. **Real-Time Collaboration**
   - Reason: Not in requirements
   - Future: WebSocket-based updates

4. **Mobile Apps**
   - Reason: Responsive web sufficient
   - Future: React Native wrapper possible

5. **Offline Mode**
   - Reason: Requires significant PWA work
   - Future: Service workers for caching

6. **Advanced Analytics**
   - Reason: Basic reporting sufficient
   - Future: Dashboard with charts/trends

7. **Email Notifications**
   - Reason: Not in requirements
   - Future: SendGrid/Mailgun integration

---

## Questions for Stakeholders

### Workflow Questions

1. **Should single and batch validation be combined or kept separate?**
   - Current: Separate pages
   - Can merge into unified interface

2. **What's the preferred application data source?**
   - Current: Manual entry + CSV upload
   - Can integrate with COLA API

3. **What confidence threshold qualifies as "Valid"?**
   - Current: 85%+
   - Can adjust based on real-world data

### Data Questions

1. **Should validation history be permanent or expire?**
   - Current: Permanent storage
   - Can add TTL or archival policies

2. **What ABV tolerance is acceptable?**
   - Current: ±0.5%
   - Can tighten or loosen

3. **Should we support multiple languages?**
   - Current: English only
   - Can add i18n support

### Integration Questions

1. **Will this integrate with existing COLA systems?**
   - Current: Standalone
   - Can build API integration

2. **Should validation results feed back to COLA system?**
   - Current: One-way (read applications)
   - Can add bidirectional sync

3. **Will this replace existing validation or supplement it?**
   - Current: Standalone tool
   - Can build as microservice in larger system

---

## Technical Debt

Items we'd improve with more time:

1. **OCR Service**: Replace mock with real OCR (Tesseract/Google Vision)
2. **Caching Layer**: Add Redis for validation results
3. **Image Processing**: Optimize/compress images before storage
4. **Background Jobs**: Queue system for batch processing
5. **Monitoring**: Add observability (Datadog, New Relic)
6. **Security**: Rate limiting, API keys, RBAC
7. **Performance**: Database query optimization, indices
8. **Testing**: Increase E2E coverage to 100% workflows

---

## Change Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-07 | Separate validation pages | Demonstrate rich features |
| 2026-03-07 | Manual application entry | No COLA system dependency |
| 2026-03-07 | PostgreSQL in production | Data persistence required |
| 2026-03-08 | Pre-seed test data | Zero-setup user experience |
| 2026-03-08 | Vercel + Railway deployment | Rapid deployment, free tiers |

---

## Summary

All design decisions prioritized:
1. **User experience** - Clear, intuitive workflows
2. **Rapid development** - Fast iteration and feedback
3. **Future flexibility** - Easy to extend or modify
4. **Production readiness** - Deployed and functional
5. **Stakeholder feedback** - Built to gather real-world input

The system is intentionally designed to evolve based on stakeholder feedback and real-world usage patterns.

---

**Questions?** Contact the development team or refer to:
- [Getting Started Guide](./quick-start/index.md)
- [Architecture Docs](./ARCHITECTURE.md)
- [API Documentation](https://ttb-label-analyzer-production.up.railway.app/api/docs)
