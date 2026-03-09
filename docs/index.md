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

1. [Reviewer Guide](./reviewer-guide.html)
2. [Hidden Requirements Analysis](./hidden-requirements.html)
3. [Requirement Traceability](./requirements-traceability.html)
4. [Implemented Features](./implemented-features.html)

### Path B: Product and UX Review (15-20 minutes)

1. [Getting Started for Users](./getting-started-users.html)
2. [Design Decisions and Assumptions](./design-decisions.html)
3. [Product and UX Decisions](./product-ux.html)
4. [Extra Features](./extra-features.html)

### Path C: Engineering and Quality Review (20-30 minutes)

1. [Architecture](./ARCHITECTURE.html)
2. [Testing Hub](./testing/)
3. [Test Coverage Report](./testing/03-test-coverage.html)
4. [Security](./SECURITY.html)
5. [Implementation Complete](./IMPLEMENTATION_COMPLETE.html)

## Documentation Catalog

### Core Reviewer Docs

| Document                                                     | Purpose                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [Reviewer Guide](./reviewer-guide.html)                      | Fast reviewer workflow and validation checklist              |
| [Hidden Requirements Analysis](./hidden-requirements.html)   | Implicit stakeholder requirements identified and implemented |
| [Requirement Traceability](./requirements-traceability.html) | Requirement-to-implementation mapping                        |
| [Implemented Features](./implemented-features.html)          | Delivered feature inventory                                  |
| [Extra Features](./extra-features.html)                      | Beyond-baseline functionality                                |
| [Design Decisions](./design-decisions.html)                  | Assumptions, trade-offs, and architecture rationale          |

### Hands-On Reviewer Guides

| Guide                                                     | Audience                            |
| --------------------------------------------------------- | ----------------------------------- |
| [Getting Started for Users](./getting-started-users.html) | Reviewer, QA, DevOps                |
| [Quick Start](./quick-start/)                             | Reviewer and developers             |
| [Testing Hub](./testing/)                                 | QA and engineering reviewers        |
| [Test Data](./test-data/)                                 | Test and demo users                 |
| [Application Data](./application-data/)                   | Data setup and management reviewers |
| [Label Images](./label-images/)                           | OCR and upload workflow reviewers   |

### Legacy Technical References

| Reference                                             | Focus                                   |
| ----------------------------------------------------- | --------------------------------------- |
| [Legacy Reference](./legacy-reference.html)           | Central index for legacy technical docs |
| [Getting Started (Legacy)](./GETTING_STARTED.html)    | Deep setup details                      |
| [Architecture](./ARCHITECTURE.html)                   | System architecture details             |
| [Testing (Legacy)](./TESTING.html)                    | Expanded testing strategy               |
| [Test Data (Legacy)](./TEST_DATA.html)                | Fixtures and scenarios                  |
| [Security](./SECURITY.html)                           | Security policy and practices           |
| [TTB Rules Quick Start](./TTB_RULES_QUICK_START.html) | Rules workflow bootstrapping            |
| [TTB Rules Integration](./TTB_RULES_INTEGRATION.html) | Integration details                     |
| [TTB System Overview](./TTB_SYSTEM_OVERVIEW.html)     | Rules system implementation             |
| [Accessibility Audit](./accessibility-audit.html)     | Accessibility findings and remediation  |

## Reviewer Evidence Map

- Business and product intent: [Hidden Requirements Analysis](./hidden-requirements.html)
- UX assumptions and trade-offs: [Design Decisions](./design-decisions.html)
- Delivery against requirements: [Requirement Traceability](./requirements-traceability.html)
- Build quality and verification: [Test Coverage](./testing/03-test-coverage.html)
- Deployment and docs publishing: [Deployment (GitHub Pages)](./github-pages.html)

## GitHub Pages Access

- Docs hub URL: `https://kabirahasaan.github.io/ttb-label-analyzer/docs/index.html`
- Full docs map: `https://kabirahasaan.github.io/ttb-label-analyzer/docs/site-map.html`

If the repository root URL shows README-style content, use the two links above for the reviewer docs experience.
