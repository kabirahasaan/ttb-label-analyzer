---
title: Deployment (GitHub Pages)
nav_order: 9
---

# Deployment (GitHub Pages)

This docs site is configured for GitHub Pages using Jekyll + Just the Docs.

## Included configuration

- Site config: `docs/_config.yml`
- Navigation data: `docs/_data/navigation.yml`
- Reviewer-focused content pages in `docs/`

## Deployment approach

A GitHub Actions workflow publishes the `docs/` directory as a Pages artifact and deploys it.

Primary public entry points:

- `https://kabirahasaan.github.io/ttb-label-analyzer/docs/reviewer-guide.html`
- `https://kabirahasaan.github.io/ttb-label-analyzer/docs/site-map.html`

Note:

- If `https://kabirahasaan.github.io/ttb-label-analyzer/` shows repository README content, open the Site Map link above. The full docs are currently served under `/docs/` paths.

## Expected repository settings

- Repository → Settings → Pages
- Source: GitHub Actions

If using branch-based Pages instead:

- Branch: `main`
- Folder: `/docs`

## Verification after deployment

- Ensure the site renders the Home, Reviewer Guide, and Traceability pages.
- Validate cross-links between all reviewer-focused docs pages.
- Confirm repository link and search behavior in the theme header.
- Verify these URLs return `200`: `/docs/reviewer-guide.html`
- Verify these URLs return `200`: `/docs/site-map.html`
- Verify these URLs return `200`: `/docs/getting-started-users.html`
- Verify these URLs return `200`: `/docs/legacy-reference.html`
