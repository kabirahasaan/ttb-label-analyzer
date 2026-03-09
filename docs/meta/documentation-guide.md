---
title: Documentation Guide (Meta)
layout: default
permalink: /meta/documentation-guide
---

# Documentation Guide

> **Quick Navigation**: All documentation is in the `/docs` directory. Start with [docs/index.md](../).

## Documentation Structure

```
ttb-label-analyzer/
├── README.md                    # Project overview and quick start
├── DOCS_MIGRATION.md           # Documentation organization status
│
└── docs/                       # 📚 ALL DOCUMENTATION HERE
    ├── index.md                # 🏠 START HERE - Complete navigation guide
    │
    ├── Getting Started
    │   └── GETTING_STARTED.md  # Setup, installation, prerequisites
    │
    ├── Architecture & Design
    │   └── ARCHITECTURE.md     # System design, modules, data flow
    │
    ├── Testing & Quality
    │   ├── TESTING.md          # Unit, integration, E2E tests
    │   └── TEST_DATA.md        # ✨ Test fixtures, manual testing workflows
    │
    ├── Security
    │   └── SECURITY.md         # Security practices and guidelines
    │
    ├── TTB Rules System
    │   ├── TTB_RULES_QUICK_START.md    # Quick reference
    │   ├── TTB_RULES_INTEGRATION.md    # Integration guide
    │   ├── TTB_RULES_EXAMPLES.ts       # Code examples
    │   └── TTB_SYSTEM_OVERVIEW.md      # Complete overview
    │
    ├── Implementation Status
    │   ├── IMPLEMENTATION_COMPLETE.md   # Implementation summary
    │   └── AC_IMPLEMENTATION_SUMMARY.md # Acceptance criteria
    │
    └── Accessibility
        └── accessibility-audit.md       # Accessibility audit
```

## Quick Links

### For New Users

1. 🏠 **[Documentation Index](../)** - Start here!
2. 🚀 **[Getting Started](../GETTING_STARTED.html)** - Setup guide
3. 🧪 **[Test Data](../TEST_DATA.html)** - Pre-loaded test fixtures

### For Developers

1. 🏗️ **[Architecture](../ARCHITECTURE.html)** - System design
2. ✅ **[Testing](../TESTING.html)** - Testing strategies
3. 📊 **[TTB Rules Quick Start](../TTB_RULES_QUICK_START.html)** - Rules system

### For DevOps

1. 🚀 **[Getting Started](../GETTING_STARTED.html)** - Docker & deployment
2. 🔒 **[Security](../SECURITY.html)** - Security guidelines
3. 🏗️ **[Architecture](../ARCHITECTURE.html)** - Infrastructure

## Recent Updates (March 7, 2026)

### ✨ New Documentation

- **[TEST_DATA.md](../TEST_DATA.html)** - Comprehensive test data guide
  - 9 pre-seeded test applications
  - 10 label validation scenarios
  - Manual testing workflows
  - API test endpoints
  - Quick reference values

### 📝 Updated Documentation

- **[index.md](../)** - Added TEST_DATA.md reference
- **[TESTING.md](../TESTING.html)** - Added test fixtures overview
- **[README.md](./README.html)** - Updated documentation links

### 🗑️ Cleaned Up

- Removed scattered test data docs (consolidated to docs/TEST_DATA.md)
- Organized all documentation in /docs directory
- Added fixtures/README.md pointing to main docs

## Documentation Principles

1. **Single Source of Truth**: All docs in `/docs` directory
2. **Clear Navigation**: index.md provides complete guide
3. **Practical Examples**: Real code examples wherever possible
4. **Keep Updated**: Update docs with code changes
5. **Directory READMEs**: Only for directory-specific context

## How to Find What You Need

| I want to...                | See this document                                           |
| --------------------------- | ----------------------------------------------------------- |
| Set up the project          | [GETTING_STARTED.md](../GETTING_STARTED.html)                 |
| Understand the architecture | [ARCHITECTURE.md](../ARCHITECTURE.html)                       |
| Write or run tests          | [TESTING.md](../TESTING.html)                                 |
| Use test data for testing   | [TEST_DATA.md](../TEST_DATA.html)                             |
| Integrate TTB rules         | [TTB_RULES_QUICK_START.md](../TTB_RULES_QUICK_START.html)     |
| Learn security practices    | [SECURITY.md](../SECURITY.html)                               |
| Check implementation status | [IMPLEMENTATION_COMPLETE.md](../IMPLEMENTATION_COMPLETE.html) |
| See all documentation       | [index.md](../)                                     |

## Contributing to Documentation

When adding or updating documentation:

1. **Location**: Place in `/docs` directory
2. **Index**: Update `docs/index.md` with new links
3. **Format**: Use clear Markdown with examples
4. **Links**: Use relative paths from docs directory
5. **Code Examples**: Include working code snippets
6. **Date**: Add "Last Updated" timestamp

## Test Data Quick Start

The application includes **pre-seeded test data** for immediate testing:

```bash
# List all test applications (9 pre-loaded, showing COLA numbers)
curl http://localhost:3001/applications | jq '.[] | "\(.colaNumber || "No COLA") - \(.brandName)"'

# Test a perfect match scenario using COLA-2024-001
# COLA: COLA-2024-001
# Brand: Hoppy Trails IPA
# ABV: 6.5
# Contents: 12 fl oz (355 mL)
# Producer: Mountain View Brewery
```

**See [docs/TEST_DATA.md](../TEST_DATA.html) for complete testing guide.**

---

## Support

- 📚 **Documentation**: [docs/index.md](../)
- 🔧 **API Docs**: http://localhost:3001/api/docs (when running)
- 🚀 **Quick Start**: [docs/GETTING_STARTED.md](../GETTING_STARTED.html)
- 🧪 **Testing**: [docs/TEST_DATA.md](../TEST_DATA.html)

---

**Last Updated**: March 7, 2026  
**Status**: ✅ All documentation organized in `/docs`
