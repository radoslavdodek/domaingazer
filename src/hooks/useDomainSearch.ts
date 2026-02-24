'use client'

import { useCallback, useRef, useState } from 'react'
import type { DomainResult, DomainStatus, SseEvent, TLD } from '@/lib/types'

type SearchStatus = 'idle' | 'searching' | 'done' | 'cancelled' | 'error'

interface DomainSearchState {
  results: DomainResult[]
  nameBatches: string[][]
  status: SearchStatus
  errorMessage: string | null
  isWaitingForNewRows: boolean
}

// A promise that resolves with { done: true } as soon as the given AbortSignal fires.
// Used in Promise.race to immediately break out of reader.read() loops on cancel.
function makeAbortDone(signal: AbortSignal): Promise<ReadableStreamReadResult<Uint8Array>> {
  const done: ReadableStreamReadResult<Uint8Array> = { done: true, value: undefined }
  if (signal.aborted) return Promise.resolve(done)
  return new Promise(resolve => signal.addEventListener('abort', () => resolve(done), { once: true }))
}

export function useDomainSearch() {
  const [state, setState] = useState<DomainSearchState>({
    results: [],
    nameBatches: [],
    status: 'idle',
    errorMessage: null,
    isWaitingForNewRows: false,
  })
  const [isCheckingCustom, setIsCheckingCustom] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const pendingControllersRef = useRef<Set<AbortController>>(new Set())
  const generationRef = useRef(0)
  const cancelGenerationRef = useRef(0)
  const lastBatchIndexRef = useRef(-1)
  const lastDescriptionRef = useRef<string>('')
  const lastTldsRef = useRef<TLD[]>([])

  const runSearch = useCallback(async (
    description: string,
    tlds: TLD[],
    exclude: string[],
    appendResults: boolean,
    hint?: string,
  ) => {
    abortRef.current?.abort()
    const generation = ++generationRef.current
    const cancelGeneration = cancelGenerationRef.current
    const controller = new AbortController()
    abortRef.current = controller
    pendingControllersRef.current.add(controller)

    const isStale = () => (
      generationRef.current !== generation
      || cancelGenerationRef.current !== cancelGeneration
    )

    const batchIndex = appendResults ? lastBatchIndexRef.current + 1 : 0
    lastBatchIndexRef.current = batchIndex

    setState((prev) => ({
      results: appendResults ? prev.results : [],
      nameBatches: appendResults
        ? prev.nameBatches.map((batch) => [...batch]).concat([[]])
        : [[]],
      status: 'searching',
      errorMessage: null,
      isWaitingForNewRows: true,
    }))

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, tlds, exclude, hint }),
        signal: controller.signal,
      })

      if (isStale()) return

      if (!response.ok || !response.body) {
        const text = await response.text()
        if (isStale()) return
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

      // Races reader.read() against the abort signal so the loop exits immediately
      // when cancel() is called, rather than waiting for the next chunk to arrive.
      const abortDone = makeAbortDone(controller.signal)

      while (true) {
        const result = await Promise.race([
          reader.read().catch((): ReadableStreamReadResult<Uint8Array> => ({ done: true, value: undefined })),
          abortDone,
        ])

        if (result.done || isStale()) {
          reader.cancel().catch(() => {})
          break
        }

        buffer += decoder.decode(result.value as Uint8Array, { stream: true })

        // Process complete SSE messages (separated by \n\n)
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (isStale()) break
          const line = part.trim()
          if (!line.startsWith('data: ')) continue

          try {
            const event = JSON.parse(line.slice(6)) as SseEvent

            if (event.type === 'domain_result') {
              setState((prev) => {
                if (isStale()) return prev
                const existingIndex = prev.results.findIndex(
                  (r) => r.fullDomain === event.data.fullDomain
                )
                const hasBaseName = prev.results.some((r) => r.baseName === event.data.baseName)
                let nextNameBatches = prev.nameBatches
                if (!hasBaseName) {
                  nextNameBatches = prev.nameBatches.map((batch) => [...batch])
                  if (!nextNameBatches[batchIndex]) nextNameBatches[batchIndex] = []
                  if (!nextNameBatches[batchIndex].includes(event.data.baseName)) {
                    nextNameBatches[batchIndex].push(event.data.baseName)
                  }
                }
                if (existingIndex >= 0) {
                  const updated = [...prev.results]
                  updated[existingIndex] = event.data
                  return { ...prev, results: updated, nameBatches: nextNameBatches }
                }
                return {
                  ...prev,
                  results: [...prev.results, event.data],
                  nameBatches: nextNameBatches,
                  isWaitingForNewRows: hasBaseName ? prev.isWaitingForNewRows : false,
                }
              })
            } else if (event.type === 'done') {
              setState((prev) => {
                if (isStale()) return prev
                return { ...prev, status: 'done', isWaitingForNewRows: false }
              })
            } else if (event.type === 'error') {
              setState((prev) => {
                if (isStale()) return prev
                return { ...prev, status: 'error', errorMessage: event.message, isWaitingForNewRows: false }
              })
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      if (isStale()) return
      if (err instanceof Error && err.name === 'AbortError') return
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        isWaitingForNewRows: false,
      }))
    } finally {
      pendingControllersRef.current.delete(controller)
    }
  }, [])

  const search = useCallback(async (description: string, tlds: TLD[]) => {
    lastDescriptionRef.current = description
    lastTldsRef.current = tlds
    await runSearch(description, tlds, [], false)
  }, [runSearch])

  const generateMore = useCallback(async (currentBaseNames: string[], hint?: string) => {
    await runSearch(
      lastDescriptionRef.current,
      lastTldsRef.current,
      currentBaseNames,
      true,
      hint,
    )
  }, [runSearch])

  const cancel = useCallback(() => {
    generationRef.current++
    cancelGenerationRef.current++
    abortRef.current?.abort()
    pendingControllersRef.current.forEach((controller) => {
      controller.abort()
    })
    pendingControllersRef.current.clear()
    // Freeze the current state and mark in-flight checks as stopped.
    setState((prev) => ({
      ...prev,
      status: 'cancelled',
      isWaitingForNewRows: false,
      results: prev.results.map((result) => (
        result.status === 'CHECKING'
          ? { ...result, status: 'STOPPED' as DomainStatus }
          : result
      )),
    }))
    setIsCheckingCustom(false)
  }, [])

  const setActiveTlds = useCallback((tlds: TLD[]) => {
    lastTldsRef.current = tlds
  }, [])

  const checkNewTld = useCallback(async (newTld: TLD, baseNames: string[]) => {
    if (baseNames.length === 0) return
    const cancelGeneration = cancelGenerationRef.current
    const controller = new AbortController()
    pendingControllersRef.current.add(controller)
    const isCancelled = () => cancelGenerationRef.current !== cancelGeneration

    try {
      // Add CHECKING placeholders for all base names × new TLD
      setState((prev) => {
        if (isCancelled()) return prev
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
            signal: controller.signal,
          })
          if (!response.ok || !response.body) return

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            if (isCancelled()) return
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const parts = buffer.split('\n\n')
            buffer = parts.pop() ?? ''
            for (const part of parts) {
              if (isCancelled()) return
              const line = part.trim()
              if (!line.startsWith('data: ')) continue
              try {
                const event = JSON.parse(line.slice(6)) as SseEvent
                if (event.type === 'domain_result') {
                  setState((prev) => {
                    if (isCancelled()) return prev
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
    } finally {
      pendingControllersRef.current.delete(controller)
    }
  }, [])

  const checkCustom = useCallback(async (baseName: string) => {
    const tlds = lastTldsRef.current
    if (!baseName || tlds.length === 0) return
    const cancelGeneration = cancelGenerationRef.current
    const controller = new AbortController()
    pendingControllersRef.current.add(controller)
    const isCancelled = () => cancelGenerationRef.current !== cancelGeneration

    // Optimistically add CHECKING placeholders
    setState((prev) => {
      if (isCancelled()) return prev
      const next = [...prev.results]
      const hasBaseName = prev.results.some((r) => r.baseName === baseName)
      let nextNameBatches = prev.nameBatches
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
      if (!hasBaseName) {
        nextNameBatches = prev.nameBatches.map((batch) => [...batch])
        if (nextNameBatches.length === 0) nextNameBatches = [[]]
        const lastIndex = nextNameBatches.length - 1
        if (!nextNameBatches[lastIndex].includes(baseName)) {
          nextNameBatches[lastIndex].push(baseName)
        }
      }
      return { ...prev, results: next, nameBatches: nextNameBatches }
    })

    setIsCheckingCustom(true)
    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseName, tlds }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        if (isCancelled()) return
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (isCancelled()) return
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6)) as SseEvent
            if (event.type === 'domain_result') {
              setState((prev) => {
                if (isCancelled()) return prev
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
      pendingControllersRef.current.delete(controller)
      setIsCheckingCustom(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    generationRef.current++
    cancelGenerationRef.current++
    abortRef.current?.abort()
    pendingControllersRef.current.forEach((controller) => {
      controller.abort()
    })
    pendingControllersRef.current.clear()
    lastBatchIndexRef.current = -1
    setState({ results: [], nameBatches: [], status: 'idle', errorMessage: null, isWaitingForNewRows: false })
    setIsCheckingCustom(false)
  }, [])

  return { ...state, isCheckingCustom, search, generateMore, cancel, clearResults, checkCustom, checkNewTld, setActiveTlds }
}
