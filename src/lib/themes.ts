import type { DomainStatus } from './types'

type DisplayStatus = DomainStatus | 'PENDING'

export interface Theme {
  layout: {
    body: string
  }
  page: {
    title: string
    subtitle: string
    searchCard: string
  }
  searchForm: {
    label: string
    textarea: string
    validationText: string
    submitButton: string
    cancelButton: string
    clearButton: string
  }
  tldSelector: {
    selected: string
    unselected: string
  }
  domainRow: {
    badgeClassByStatus: Record<DisplayStatus, string>
    compactBadgeClassByStatus: Record<DisplayStatus, string>
    spinner: string
    rowDefault: string
    rowAvailable: string
    textDefault: string
    textAvailable: string
    compactRowDefault: string
    compactRowAvailable: string
    compactText: string
  }
  resultsPanel: {
    container: string
  }
  resultsHeader: {
    wrapper: string
    searchingDot: string
    searchingPing: string
    availableText: string
    cancelledText: string
    errorText: string
    checkboxAccent: string
    actionLink: string
    actionLinkDisabled: string
  }
  baseNameGroupList: {
    skeleton: string
    batchDividerLine: string
    batchDividerText: string
    card: string
    variationButton: string
    explainButton: string
    explanationBox: string
    explanationText: string
    explanationErrorText: string
    explanationLoadingText: string
    emptyState: string
    workingRow: string
    workingDot: string
    workingPing: string
  }
  refinementCard: {
    wrapper: string
    label: string
    input: string
    button: string
  }
  clearResultsModal: {
    overlay: string
    dialog: string
    title: string
    body: string
    cancelButton: string
    confirmButton: string
  }
}

export type ThemeName = 'classic' | 'midnight'

export const classicTheme: Theme = {
  layout: {
    body: 'min-h-screen bg-gray-50 font-sans',
  },
  page: {
    title: 'mb-3 text-3xl font-extrabold text-gray-900 sm:text-4xl',
    subtitle: 'mx-auto max-w-2xl text-sm text-gray-500',
    searchCard: 'mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6',
  },
  searchForm: {
    label: 'mb-1 block text-sm font-medium text-gray-700',
    textarea: 'w-full min-h-[120px] resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500',
    validationText: 'mt-1 text-xs text-red-600',
    submitButton: 'w-full rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto',
    cancelButton: 'w-full rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto',
    clearButton: 'text-sm text-gray-500 transition-colors hover:text-blue-600',
  },
  tldSelector: {
    selected: 'bg-blue-600 text-white shadow-sm',
    unselected: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  },
  domainRow: {
    badgeClassByStatus: {
      CHECKING: 'bg-blue-50 text-blue-600',
      STOPPED: 'bg-gray-100 text-gray-600',
      AVAILABLE: 'bg-green-100 text-green-700',
      UNAVAILABLE: 'bg-red-50 text-red-600',
      RESERVED: 'bg-amber-50 text-amber-700',
      UNSUPPORTED: 'bg-gray-100 text-gray-400',
      ERROR: 'bg-orange-50 text-orange-600',
      PENDING: 'bg-gray-100 text-gray-500',
    },
    compactBadgeClassByStatus: {
      CHECKING: 'border border-blue-200 bg-blue-50 text-blue-600 font-medium',
      STOPPED: 'border border-gray-200 bg-gray-100 text-gray-600 font-medium',
      AVAILABLE: 'border border-green-300 bg-green-100 text-green-800 font-bold',
      UNAVAILABLE: 'border border-red-200 bg-red-50 text-red-700 font-semibold',
      RESERVED: 'border border-amber-200 bg-amber-50 text-amber-700 font-medium',
      UNSUPPORTED: 'border border-gray-200 bg-gray-100 text-gray-500 font-medium',
      ERROR: 'border border-orange-200 bg-orange-50 text-orange-700 font-medium',
      PENDING: 'border border-gray-200 bg-gray-100 text-gray-500 font-medium',
    },
    spinner: 'h-3 w-3 animate-spin rounded-full border border-blue-400 border-t-transparent',
    rowDefault: 'border-gray-200 bg-white',
    rowAvailable: 'border-green-200 bg-green-50',
    textDefault: 'text-gray-700',
    textAvailable: 'font-semibold text-green-800',
    compactRowDefault: 'border-gray-200 bg-white',
    compactRowAvailable: 'border-green-200 bg-green-50',
    compactText: 'text-gray-700',
  },
  resultsPanel: {
    container: 'rounded-xl border border-gray-200 bg-white shadow-sm',
  },
  resultsHeader: {
    wrapper: 'sticky top-0 z-30 rounded-t-xl border-b border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 sm:p-5',
    searchingDot: 'relative inline-block h-2.5 w-2.5 rounded-full bg-blue-500',
    searchingPing: 'absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75',
    availableText: 'font-semibold text-green-700',
    cancelledText: 'text-gray-500',
    errorText: 'text-red-600',
    checkboxAccent: 'h-4 w-4 cursor-pointer rounded border-gray-300 accent-blue-600',
    actionLink: 'text-sm text-gray-500 transition-colors hover:text-blue-600',
    actionLinkDisabled: 'text-sm text-gray-500 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:text-gray-400',
  },
  baseNameGroupList: {
    skeleton: 'h-10 animate-pulse rounded-lg border border-gray-200 bg-gray-100',
    batchDividerLine: 'h-px flex-1 bg-gray-200',
    batchDividerText: 'text-[11px] font-medium uppercase tracking-wide text-gray-400',
    card: 'scroll-mt-24 rounded-lg border border-gray-200 bg-white px-3 py-2 sm:px-3.5',
    variationButton: 'rounded-lg border border-blue-200 bg-white px-2 py-0.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50',
    explainButton: 'rounded-lg border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
    explanationBox: 'mt-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2',
    explanationText: 'text-xs leading-relaxed text-gray-700',
    explanationErrorText: 'text-xs text-red-600',
    explanationLoadingText: 'text-xs text-gray-500',
    emptyState: 'rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500',
    workingRow: 'rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700',
    workingDot: 'relative inline-block h-2 w-2 rounded-full bg-blue-500',
    workingPing: 'absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75',
  },
  refinementCard: {
    wrapper: 'space-y-4 rounded-b-xl border-t border-gray-200 bg-gray-50 p-4 sm:p-5',
    label: 'block text-sm font-semibold text-gray-700',
    input: 'flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50',
    button: 'w-full rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white sm:w-auto',
  },
  clearResultsModal: {
    overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4',
    dialog: 'w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl',
    title: 'text-base font-semibold text-gray-900',
    body: 'mt-2 text-sm leading-relaxed text-gray-600',
    cancelButton: 'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50',
    confirmButton: 'rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700',
  },
}

export const midnightTheme: Theme = {
  layout: {
    body: 'min-h-screen bg-zinc-950 font-sans',
  },
  page: {
    title: 'mb-3 text-3xl font-extrabold text-zinc-100 sm:text-4xl',
    subtitle: 'mx-auto max-w-2xl text-sm text-zinc-500',
    searchCard: 'mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg shadow-black/20 sm:p-6',
  },
  searchForm: {
    label: 'mb-1 block text-sm font-medium text-zinc-400',
    textarea: 'w-full min-h-[120px] resize-none rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-zinc-800/50 disabled:text-zinc-600',
    validationText: 'mt-1 text-xs text-red-400',
    submitButton: 'w-full rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto',
    cancelButton: 'w-full rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 sm:w-auto',
    clearButton: 'text-sm text-zinc-500 transition-colors hover:text-sky-400',
  },
  tldSelector: {
    selected: 'bg-sky-600 text-white shadow-sm shadow-sky-500/20',
    unselected: 'border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-750 hover:text-zinc-300',
  },
  domainRow: {
    badgeClassByStatus: {
      CHECKING: 'bg-sky-950 text-sky-400',
      STOPPED: 'bg-zinc-800 text-zinc-500',
      AVAILABLE: 'bg-emerald-950 text-emerald-400',
      UNAVAILABLE: 'bg-red-950 text-red-400',
      RESERVED: 'bg-amber-950 text-amber-400',
      UNSUPPORTED: 'bg-zinc-800 text-zinc-600',
      ERROR: 'bg-orange-950 text-orange-400',
      PENDING: 'bg-zinc-800 text-zinc-500',
    },
    compactBadgeClassByStatus: {
      CHECKING: 'border border-sky-800 bg-sky-950 text-sky-400 font-medium',
      STOPPED: 'border border-zinc-700 bg-zinc-800 text-zinc-500 font-medium',
      AVAILABLE: 'border border-emerald-700 bg-emerald-950 text-emerald-400 font-bold',
      UNAVAILABLE: 'border border-red-800 bg-red-950 text-red-400 font-semibold',
      RESERVED: 'border border-amber-800 bg-amber-950 text-amber-400 font-medium',
      UNSUPPORTED: 'border border-zinc-700 bg-zinc-800 text-zinc-600 font-medium',
      ERROR: 'border border-orange-800 bg-orange-950 text-orange-400 font-medium',
      PENDING: 'border border-zinc-700 bg-zinc-800 text-zinc-500 font-medium',
    },
    spinner: 'h-3 w-3 animate-spin rounded-full border border-sky-400 border-t-transparent',
    rowDefault: 'border-zinc-800 bg-zinc-900',
    rowAvailable: 'border-emerald-800 bg-emerald-950/50',
    textDefault: 'text-zinc-300',
    textAvailable: 'font-semibold text-emerald-400',
    compactRowDefault: 'border-zinc-800 bg-zinc-900',
    compactRowAvailable: 'border-emerald-800 bg-emerald-950/50',
    compactText: 'text-zinc-300',
  },
  resultsPanel: {
    container: 'rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/20',
  },
  resultsHeader: {
    wrapper: 'sticky top-0 z-30 rounded-t-2xl border-b border-zinc-800 bg-zinc-800/60 p-4 text-sm text-zinc-400 backdrop-blur-xl sm:p-5',
    searchingDot: 'relative inline-block h-2.5 w-2.5 rounded-full bg-sky-500',
    searchingPing: 'absolute inset-0 animate-ping rounded-full bg-sky-400 opacity-75',
    availableText: 'font-semibold text-emerald-400',
    cancelledText: 'text-zinc-500',
    errorText: 'text-red-400',
    checkboxAccent: 'h-4 w-4 cursor-pointer rounded border-zinc-600 accent-sky-500',
    actionLink: 'text-sm text-zinc-500 transition-colors hover:text-sky-400',
    actionLinkDisabled: 'text-sm text-zinc-500 transition-colors hover:text-sky-400 disabled:cursor-not-allowed disabled:text-zinc-600',
  },
  baseNameGroupList: {
    skeleton: 'h-10 animate-pulse rounded-xl border border-zinc-800 bg-zinc-800/50',
    batchDividerLine: 'h-px flex-1 bg-zinc-800',
    batchDividerText: 'text-[11px] font-medium uppercase tracking-wide text-zinc-600',
    card: 'scroll-mt-24 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 sm:px-3.5',
    variationButton: 'rounded-lg border border-sky-800 bg-zinc-800 px-2 py-0.5 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-950 disabled:cursor-not-allowed disabled:opacity-50',
    explainButton: 'rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-750 disabled:cursor-not-allowed disabled:opacity-50',
    explanationBox: 'mt-2 rounded-md border border-zinc-700 bg-zinc-800/80 px-2.5 py-2',
    explanationText: 'text-xs leading-relaxed text-zinc-300',
    explanationErrorText: 'text-xs text-red-400',
    explanationLoadingText: 'text-xs text-zinc-500',
    emptyState: 'rounded-xl border border-dashed border-zinc-700 px-4 py-6 text-center text-sm text-zinc-500',
    workingRow: 'rounded-xl border border-sky-800/40 bg-sky-950/30 px-4 py-3 text-sm text-sky-400',
    workingDot: 'relative inline-block h-2 w-2 rounded-full bg-sky-500',
    workingPing: 'absolute inset-0 animate-ping rounded-full bg-sky-400 opacity-75',
  },
  refinementCard: {
    wrapper: 'space-y-4 rounded-b-2xl border-t border-zinc-800 bg-zinc-900/80 p-4 sm:p-5',
    label: 'block text-sm font-semibold text-zinc-300',
    input: 'flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50',
    button: 'w-full rounded-xl border border-sky-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-sky-400 transition-colors hover:bg-sky-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-zinc-800 sm:w-auto',
  },
  clearResultsModal: {
    overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md',
    dialog: 'w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/40',
    title: 'text-base font-semibold text-zinc-100',
    body: 'mt-2 text-sm leading-relaxed text-zinc-400',
    cancelButton: 'rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-750',
    confirmButton: 'rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500',
  },
}

export const themes: Record<ThemeName, Theme> = {
  classic: classicTheme,
  midnight: midnightTheme,
}
