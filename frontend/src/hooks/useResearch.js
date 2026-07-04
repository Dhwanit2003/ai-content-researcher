import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const STEP_LABELS = {
  start:      { label: 'Initializing',          pct: 5  },
  step1:      { label: 'Decomposing topic',      pct: 15 },
  step1_done: { label: 'Queries ready',          pct: 25 },
  step2:      { label: 'Searching the web',      pct: 40 },
  step2_done: { label: 'Search complete',        pct: 55 },
  step3:      { label: 'Synthesizing results',   pct: 70 },
  step3_done: { label: 'Synthesis complete',     pct: 82 },
  step4:      { label: 'Generating report',      pct: 92 },
  complete:   { label: 'Done',                   pct: 100 },
}

export function useResearch() {
  const [status, setStatus]   = useState('idle')  // idle | loading | done | error
  const [progress, setProgress] = useState({ step: '', label: '', pct: 0 })
  const [queries, setQueries] = useState([])
  const [report, setReport]   = useState('')
  const [sources, setSources] = useState([])
  const [error, setError]     = useState(null)

  const research = useCallback(async (topic) => {
    setStatus('loading')
    setError(null)
    setReport('')
    setSources([])
    setQueries([])

    try {
      const res = await fetch(`${API_BASE}/api/v1/research/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))
          const meta = STEP_LABELS[data.step] || {}

          setProgress({ step: data.step, label: meta.label || '', pct: meta.pct || 0 })

          if (data.queries)  setQueries(data.queries)
          if (data.report)   setReport(data.report)
          if (data.sources)  setSources(data.sources)
          if (data.step === 'complete') setStatus('done')
        }
      }
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress({ step: '', label: '', pct: 0 })
    setQueries([])
    setReport('')
    setSources([])
    setError(null)
  }, [])

  return { status, progress, queries, report, sources, error, research, reset }
}
