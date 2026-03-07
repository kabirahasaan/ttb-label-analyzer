/**
 * PAGE CONSISTENCY GUIDE
 * =====================
 * Standardized styles, spacing, and layout patterns used across all validation
 * and application pages to ensure visual consistency and unified UX.
 */

// TYPOGRAPHY
export const typography = {
  pageTitle: 'text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl',
  pageSubtitle: 'mt-4 text-lg text-gray-600',
  sectionHeading: 'text-xl font-bold text-gray-900',
  cardTitle: 'text-lg font-semibold text-gray-900',
  cardDescription: 'text-sm text-gray-600',
  labelText: 'text-sm font-medium text-gray-700',
  helperText: 'text-sm text-gray-500',
  badgeText: 'text-xs font-semibold px-2.5 py-1 rounded',
};

// COLORS - Status & Severity
export const statusColors = {
  compliant: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800',
    icon: 'text-green-600',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    icon: 'text-amber-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    icon: 'text-red-600',
  },
  nonCompliant: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    icon: 'text-red-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    icon: 'text-blue-600',
  },
};

// SPACING
export const spacing = {
  pageContainer: 'mx-auto max-w-7xl px-6 lg:px-8',
  pageVertical: 'py-16',
  headerSection: 'mb-10',
  sectionGap: 'space-y-6',
  cardGap: 'space-y-4',
  controlGap: 'gap-3',
};

// CARDS & CONTAINERS
export const cards = {
  base: 'border border-slate-200 shadow-sm overflow-hidden rounded-lg',
  elevated: 'border border-slate-200 shadow-md overflow-hidden rounded-lg',
  interactive:
    'border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden rounded-lg',
};

// BUTTONS
export const buttons = {
  primary:
    'inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
  secondary:
    'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  danger:
    'inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  subtle:
    'inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2',
};

// STEP INDICATORS
export const stepIndicators = {
  container: 'mb-8 flex items-center justify-center gap-4 flex-wrap',
  step: {
    complete:
      'flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-500 bg-green-500 text-white',
    active:
      'flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-500 text-white',
    inactive:
      'flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 text-gray-500',
  },
  separator: 'h-0.5 w-8 bg-gray-300 hidden sm:block',
};

// RESULT CARDS & ACCORDION
export const resultCards = {
  container: 'space-y-4',
  header:
    'flex items-center justify-between gap-4 cursor-pointer hover:opacity-80 transition-opacity',
  content: 'space-y-5 mt-5',
  expandIcon: 'flex-shrink-0',
  infoText: 'text-sm text-slate-500',
};

// DISCREPANCY DISPLAY
export const discrepancies = {
  container: 'space-y-3',
  item: 'rounded-lg border p-4',
  fieldHeader: 'mb-3 flex items-center gap-2',
  fieldNumber:
    'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
  fieldName: 'font-semibold',
  comparison: 'gap-3 grid sm:grid-cols-2',
  comparisonBox: 'rounded-lg border p-3',
  comparisonLabel: 'mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide',
  comparisonValue: 'break-words text-sm',
  actionBox: 'mt-3 rounded bg-opacity-100 px-3 py-2 text-sm',
};

// FORM & INPUT STYLES
export const forms = {
  inputBase:
    'rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  selectBase:
    'rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  checkboxBase:
    'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer',
};

// PAGE HEADER PATTERN
export const pageHeader = {
  container: 'text-center',
  title: `${typography.pageTitle}`,
  subtitle: `${typography.pageSubtitle}`,
};

// EMPTY STATE
export const emptyState = {
  container: 'rounded-lg border border-slate-200 bg-slate-50 p-12 text-center',
  icon: 'mx-auto h-16 w-16 text-slate-300',
  title: 'mt-4 text-lg font-semibold text-slate-900',
  description: 'mt-2 text-sm text-slate-600',
};

// DIVIDER PATTERN
export const dividers = {
  horizontal: 'border-t border-slate-200',
  vertical: 'border-l border-slate-300',
  withText: 'relative flex items-center',
};
