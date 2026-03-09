---
title: Home
nav_order: 1
---

# Reviewer Documentation Hub

This is the single-page navigation hub for reviewers. Use this page to access every document quickly, follow a guided review path, and jump to technical evidence without searching through the repository.

<a href="./reviewer-guide.html" class="btn btn-primary">Start 10-Minute Review</a>
<a href="./site-map.html" class="btn">Open Full Site Map</a>
<a href="./hidden-requirements.html" class="btn">See Hidden Requirements</a>
<a href="./testing/03-test-coverage.html" class="btn">Open Test Coverage</a>

## Project Snapshot

- Stack: Next.js 14, NestJS 10, TypeScript, Nx monorepo, PostgreSQL
- Validation scope: OCR extraction, TTB rules, COLA cross-check, single + batch workflows
- Test scope: 55+ automated tests
- Coverage: 88% development coverage, 95% production validation pass rate
- Live app: `https://ttb-label-analyzer.vercel.app`
- Live API health: `https://ttb-label-analyzer-production.up.railway.app/health`

## Recommended Review Paths

### Path A: Executive Review (10 minutes)

1. [Reviewer Guide](./reviewer-guide.md)
2. [Hidden Requirements Analysis](./hidden-requirements.md)
3. [Requirement Traceability](./requirements-traceability.md)
4. [Implemented Features](./implemented-features.md)

### Path B: Product and UX Review (15-20 minutes)

1. [Getting Started for Users](./getting-started-users.md)
2. [Design Decisions and Assumptions](./design-decisions.md)
3. [Product and UX Decisions](./product-ux.md)
4. [Extra Features](./extra-features.md)

### Path C: Engineering and Quality Review (20-30 minutes)

1. [Architecture](./ARCHITECTURE.md)
2. [Testing Hub](./testing/index.md)
3. [Test Coverage Report](./testing/03-test-coverage.md)
4. [Security](./SECURITY.md)
5. [Implementation Complete](./IMPLEMENTATION_COMPLETE.md)

## Documentation Catalog

### Core Reviewer Docs

| Document                                                   | Purpose                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| [Reviewer Guide](./reviewer-guide.md)                      | Fast reviewer workflow and validation checklist              |
| [Hidden Requirements Analysis](./hidden-requirements.md)   | Implicit stakeholder requirements identified and implemented |
| [Requirement Traceability](./requirements-traceability.md) | Requirement-to-implementation mapping                        |
| [Implemented Features](./implemented-features.md)          | Delivered feature inventory                                  |
| [Extra Features](./extra-features.md)                      | Beyond-baseline functionality                                |
| [Design Decisions](./design-decisions.md)                  | Assumptions, trade-offs, and architecture rationale          |

### Hands-On Reviewer Guides

| Guide                                                   | Audience                            |
| ------------------------------------------------------- | ----------------------------------- |
| [Getting Started for Users](./getting-started-users.md) | Reviewer, QA, DevOps                |
| [Quick Start](./quick-start/index.md)                   | Reviewer and developers             |
| [Testing Hub](./testing/index.md)                       | QA and engineering reviewers        |
| [Test Data](./test-data/index.md)                       | Test and demo users                 |
| [Application Data](./application-data/index.md)         | Data setup and management reviewers |
| [Label Images](./label-images/index.md)                 | OCR and upload workflow reviewers   |

### Legacy Technical References

| Reference                                           | Focus                                   |
| --------------------------------------------------- | --------------------------------------- |
| [Legacy Reference](./legacy-reference.md)           | Central index for legacy technical docs |
| [Getting Started (Legacy)](./GETTING_STARTED.md)    | Deep setup details                      |
| [Architecture](./ARCHITECTURE.md)                   | System architecture details             |
| [Testing (Legacy)](./TESTING.md)                    | Expanded testing strategy               |
| [Test Data (Legacy)](./TEST_DATA.md)                | Fixtures and scenarios                  |
| [Security](./SECURITY.md)                           | Security policy and practices           |
| [TTB Rules Quick Start](./TTB_RULES_QUICK_START.md) | Rules workflow bootstrapping            |
| [TTB Rules Integration](./TTB_RULES_INTEGRATION.md) | Integration details                     |
| [TTB System Overview](./TTB_SYSTEM_OVERVIEW.md)     | Rules system implementation             |
| [Accessibility Audit](./accessibility-audit.md)     | Accessibility findings and remediation  |

## Reviewer Evidence Map

- Business and product intent: [Hidden Requirements Analysis](./hidden-requirements.md)
- UX assumptions and trade-offs: [Design Decisions](./design-decisions.md)
- Delivery against requirements: [Requirement Traceability](./requirements-traceability.md)
- Build quality and verification: [Test Coverage](./testing/03-test-coverage.md)
- Deployment and docs publishing: [Deployment (GitHub Pages)](./github-pages.md)

## GitHub Pages Access

- Docs hub URL: `https://kabirahasaan.github.io/ttb-label-analyzer/docs/index.html`
- Full docs map: `https://kabirahasaan.github.io/ttb-label-analyzer/docs/site-map.html`

If the repository root URL shows README-style content, use the two links above for the reviewer docs experience.
