'use client'

import {useCallback, useEffect, useState} from 'react'
import {Issue, listReporterIssues} from '@/lib/api'

export function useIssueList() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextPage, setNextPage] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await listReporterIssues()
      setIssues(data.results || [])
      setNextPage(data.next)
      setHasNext(!!data.next)
    } catch {
      setError(true)
      setIssues([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!nextPage || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await listReporterIssues(nextPage)
      setIssues(prev => [...prev, ...(data.results || [])])
      setNextPage(data.next)
      setHasNext(!!data.next)
    } catch {
      // ignore
    } finally {
      setLoadingMore(false)
    }
  }, [nextPage, loadingMore])

  useEffect(() => {
    load()
  }, [load])

  return {issues, loading, loadingMore, hasNext, loadMore, refresh: load, error}
}
