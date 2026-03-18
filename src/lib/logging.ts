function isDebugLoggingEnabled() {
  return process.env.DEBUG_LOGGING === 'true'
}

export function logDebug(message: string, details?: Record<string, unknown>) {
  if (!isDebugLoggingEnabled()) return

  if (details) {
    console.info(message, details)
    return
  }

  console.info(message)
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
