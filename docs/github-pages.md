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

## Expected repository settings

- Repository → Settings → Pages
- Source: GitHub Actions

## Verification after deployment

- Ensure the site renders the Home, Reviewer Guide, and Traceability pages.
- Validate cross-links between all reviewer-focused docs pages.
- Confirm repository link and search behavior in the theme header.
