'use client'

import { useCallback, useRef, useState } from 'react'
import type { DomainResult, DomainStatus, SseEvent, TLD } from '@/lib/types'

type SearchStatus = 'idle' | 'searching' | 'done' | 'error'

interface DomainSearchState {
  results: DomainResult[]
  status: SearchStatus
  currentRound: number
  errorMessage: string | null
}

export function useDomainSearch() {
  const [state, setState] = useState<DomainSearchState>({
    results: [],
    status: 'idle',
    currentRound: 0,
    errorMessage: null,
  })
  const [isCheckingCustom, setIsCheckingCustom] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const lastDescriptionRef = useRef<string>('')
  const lastTldsRef = useRef<TLD[]>([])

  const runSearch = useCallback(async (
    description: string,
    tlds: TLD[],
    exclude: string[],
    appendResults: boolean,
  ) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState((prev) => ({
      results: appendResults ? prev.results : [],
      status: 'searching',
      currentRound: appendResults ? prev.currentRound : 1,
      errorMessage: null,
    }))

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, tlds, exclude }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        const text = await response.text()
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: text || 'Request failed',
        }))
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages (separated by \n\n)
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue

          try {
            const event = JSON.parse(line.slice(6)) as SseEvent

            if (event.type === 'round_start') {
              setState((prev) => ({ ...prev, currentRound: event.round }))
            } else if (event.type === 'domain_result') {
              setState((prev) => {
                const existingIndex = prev.results.findIndex(
                  (r) => r.fullDomain === event.data.fullDomain
                )
                if (existingIndex >= 0) {
                  const updated = [...prev.results]
                  updated[existingIndex] = event.data
                  return { ...prev, results: updated }
                }
                return { ...prev, results: [...prev.results, event.data] }
              })
            } else if (event.type === 'done') {
              setState((prev) => ({ ...prev, status: 'done' }))
            } else if (event.type === 'error') {
              setState((prev) => ({
                ...prev,
                status: 'error',
                errorMessage: event.message,
              }))
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Cancelled — do nothing, cancel() already set state
        return
      }
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }, [])

  const search = useCallback(async (description: string, tlds: TLD[]) => {
    lastDescriptionRef.current = description
    lastTldsRef.current = tlds
    await runSearch(description, tlds, [], false)
  }, [runSearch])

  const generateMore = useCallback(async (currentBaseNames: string[]) => {
    await runSearch(
      lastDescriptionRef.current,
      lastTldsRef.current,
      currentBaseNames,
      true,
    )
  }, [runSearch])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setState((prev) => ({ ...prev, status: 'idle' }))
  }, [])

  const setActiveTlds = useCallback((tlds: TLD[]) => {
    lastTldsRef.current = tlds
  }, [])

  const checkNewTld = useCallback(async (newTld: TLD, baseNames: string[]) => {
    if (baseNames.length === 0) return

    // Add CHECKING placeholders for all base names × new TLD
    setState((prev) => {
      const next = [...prev.results]
      for (const baseName of baseNames) {
        const fullDomain = `${baseName}${newTld}`
        const placeholder: DomainResult = { baseName, tld: newTld, fullDomain, status: 'CHECKING' as DomainStatus }
        const idx = next.findIndex((r) => r.fullDomain === fullDomain)
        if (idx >= 0) next[idx] = placeholder
        else next.push(placeholder)
      }
      return { ...prev, results: next }
    })

    await Promise.all(baseNames.map(async (baseName) => {
      try {
        const response = await fetch('/api/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ baseName, tlds: [newTld] }),
        })
        if (!response.ok || !response.body) return

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''
          for (const part of parts) {
            const line = part.trim()
            if (!line.startsWith('data: ')) continue
            try {
              const event = JSON.parse(line.slice(6)) as SseEvent
              if (event.type === 'domain_result') {
                setState((prev) => {
                  const idx = prev.results.findIndex((r) => r.fullDomain === event.data.fullDomain)
                  if (idx >= 0) {
                    const updated = [...prev.results]
                    updated[idx] = event.data
                    return { ...prev, results: updated }
                  }
                  return { ...prev, results: [...prev.results, event.data] }
                })
              }
            } catch { /* skip */ }
          }
        }
      } catch { /* ignore network errors */ }
    }))
  }, [])

  const checkCustom = useCallback(async (baseName: string) => {
    const tlds = lastTldsRef.current
    if (!baseName || tlds.length === 0) return

    // Optimistically add CHECKING placeholders
    setState((prev) => {
      const next = [...prev.results]
      for (const tld of tlds) {
        const fullDomain = `${baseName}${tld}`
        const placeholder: DomainResult = { baseName, tld, fullDomain, status: 'CHECKING' as DomainStatus }
        const idx = next.findIndex((r) => r.fullDomain === fullDomain)
        if (idx >= 0) {
          next[idx] = placeholder
        } else {
          next.push(placeholder)
        }
      }
      return { ...prev, results: next }
    })

    setIsCheckingCustom(true)
    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseName, tlds }),
      })

      if (!response.ok || !response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6)) as SseEvent
            if (event.type === 'domain_result') {
              setState((prev) => {
                const idx = prev.results.findIndex((r) => r.fullDomain === event.data.fullDomain)
                if (idx >= 0) {
                  const updated = [...prev.results]
                  updated[idx] = event.data
                  return { ...prev, results: updated }
                }
                return { ...prev, results: [...prev.results, event.data] }
              })
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch {
      // ignore network errors for custom check
    } finally {
      setIsCheckingCustom(false)
    }
  }, [])

  return { ...state, isCheckingCustom, search, generateMore, cancel, checkCustom, checkNewTld, setActiveTlds }
}
