import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useResearch } from './hooks/useResearch'

const Icon = ({ d, size = 16, stroke = 'currentColor', fill = 'none', strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const SearchIcon   = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
const CopyIcon     = () => <Icon d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2M8 4h8" />
const DownloadIcon = () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
const ResetIcon    = () => <Icon d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
const CheckIcon    = () => <Icon d="M20 6 9 17l-5-5" />

const STEPS = [
  { id: 'step1', label: 'Decompose',  sub: 'Breaking topic into queries',  icon: '⚡', color: '#5B6CF8' },
  { id: 'step2', label: 'Search',     sub: 'Scanning the web in parallel', icon: '🔍', color: '#00D4FF' },
  { id: 'step3', label: 'Synthesize', sub: 'Extracting key insights',      icon: '🧠', color: '#A78BFA' },
  { id: 'step4', label: 'Report',     sub: 'Writing final analysis',       icon: '📝', color: '#10B981' },
]

const EXAMPLE_TOPICS = [
  'Impact of LLMs on software engineering jobs',
  'Quantum computing breakthroughs in 2024',
  'Future of electric vehicles in India',
  'GPT-4 vs Claude vs Gemini comparison',
]

function PipelineVisualizer({ currentStep, queries }) {
  const activeIdx =
    ['step1','step1_done'].includes(currentStep) ? 0 :
    ['step2','step2_done'].includes(currentStep) ? 1 :
    ['step3','step3_done'].includes(currentStep) ? 2 :
    ['step4','complete'].includes(currentStep)   ? 3 : -1

  const doneIdx =
    currentStep === 'complete'                    ? 3 :
    currentStep === 'step4'                       ? 2 :
    ['step3','step3_done'].includes(currentStep)  ? 1 :
    currentStep === 'step2_done'                  ? 0 : -1

  return (
    <div style={{ background: '#0D1424', border: '1px solid #1A2540', borderRadius: 16, padding: '28px 32px', marginBottom: 20 }}>
      <p style={{ fontSize: 11, letterSpacing: '.12em', color: '#4A6080', textTransform: 'uppercase', marginBottom: 28, fontWeight: 600 }}>
        Research Pipeline
      </p>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {STEPS.map((s, i) => {
          const isActive = i === activeIdx
          const isDone   = i <= doneIdx
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
                {isActive && (
                  <div style={{
                    position: 'absolute', top: '30%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 52, height: 52, borderRadius: '50%',
                    border: `2px solid ${s.color}`,
                    animation: 'pulse-ring 1.2s ease-out infinite',
                    pointerEvents: 'none',
                  }} />
                )}
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: isDone ? s.color : isActive ? `${s.color}20` : '#0A1020',
                  border: `2px solid ${isDone || isActive ? s.color : '#1A2540'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, transition: 'all .4s ease',
                  position: 'relative', zIndex: 1,
                  boxShadow: isActive ? `0 0 24px ${s.color}66` : isDone ? `0 0 14px ${s.color}44` : 'none',
                }}>
                  {isDone ? '✓' : s.icon}
                </div>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isDone ? '#E2EAF8' : isActive ? s.color : '#4A6080', transition: 'color .3s' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#3A5070', marginTop: 3, lineHeight: 1.4 }}>
                    {s.sub}
                  </div>
                </div>
              </div>
              {i < 3 && (
                <div style={{ flex: 1, height: 2, margin: '0 10px', marginBottom: 36, position: 'relative', background: '#1A2540', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(90deg, ${STEPS[i].color}, ${STEPS[i+1].color})`,
                    borderRadius: 2,
                    transform: isDone ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform .7s ease',
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {queries.length > 0 && (
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #1A2540' }}>
          <p style={{ fontSize: 10, color: '#4A6080', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
            Sub-Queries Generated
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {queries.map((q, i) => (
              <div key={i} className="fade-up" style={{
                animationDelay: `${i * 80}ms`,
                background: '#0A1628', border: '1px solid #1E2D4A',
                borderRadius: 99, padding: '5px 14px',
                fontSize: 11, color: '#7A90B0',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#5B6CF8', flexShrink: 0 }} />
                {typeof q === 'string' ? q : q.query || JSON.stringify(q)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatsBar({ sources, report, elapsed }) {
  const wordCount = report ? report.split(/\s+/).length : 0
  const readTime  = Math.max(1, Math.round(wordCount / 200))
  const stats = [
    { label: 'Sources',      value: sources.length,             accent: '#5B6CF8', icon: '🔗' },
    { label: 'Words',        value: wordCount.toLocaleString(), accent: '#00D4FF', icon: '📄' },
    { label: 'Read time',    value: `${readTime} min`,          accent: '#A78BFA', icon: '⏱' },
    { label: 'Generated in', value: elapsed ? `${elapsed}s` : '—', accent: '#10B981', icon: '⚡' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: '#0D1424', border: '1px solid #1A2540', borderRadius: 12,
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
            background: `${s.accent}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>{s.icon}</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#4A6080', marginTop: 5 }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SourceCard({ source, index }) {
  const domain = (() => { try { return new URL(source.url).hostname.replace('www.','') } catch { return source.url } })()
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-card"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: '#0A1020', border: '1px solid #1A2540',
        borderRadius: 10, padding: '11px 13px',
        textDecoration: 'none', cursor: 'pointer',
        animation: 'fadeUp .3s ease both',
        animationDelay: `${index * 40}ms`,
      }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, background: '#131C30', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={favicon} width={14} height={14} alt="" onError={e => { e.target.style.display='none' }} />
        </div>
        <div style={{
          position: 'absolute', top: -5, right: -5,
          width: 16, height: 16, borderRadius: '50%',
          background: '#0A1628', border: '1px solid #1A2540',
          fontSize: 9, fontWeight: 700, color: '#5B6CF8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{index + 1}</div>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#C0D0E8', lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {source.title}
        </div>
        <div style={{ fontSize: 10, color: '#4A6080', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#5B6CF8' }}>↗</span> {domain}
        </div>
      </div>
    </a>
  )
}

function SkeletonLoader() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
      <div style={{ background: '#0D1424', border: '1px solid #1A2540', borderRadius: 16, padding: 36 }}>
        <div className="skeleton" style={{ height: 28, width: '55%', marginBottom: 24, borderRadius: 8 }} />
        {[100, 92, 85, 100, 78].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: 13, width: `${w}%`, marginBottom: 11, borderRadius: 4 }} />
        ))}
        <div className="skeleton" style={{ height: 20, width: '40%', margin: '28px 0 16px', borderRadius: 6 }} />
        {[100, 88, 94, 72].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: 13, width: `${w}%`, marginBottom: 11, borderRadius: 4 }} />
        ))}
        <div className="skeleton" style={{ height: 20, width: '50%', margin: '28px 0 16px', borderRadius: 6 }} />
        {[100, 90, 83].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: 13, width: `${w}%`, marginBottom: 11, borderRadius: 4 }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ background: '#0D1424', border: '1px solid #1A2540', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 11, width: '85%', marginBottom: 7, borderRadius: 3 }} />
              <div className="skeleton" style={{ height: 9, width: '50%', borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [topic, setTopic]   = useState('')
  const [copied, setCopied] = useState(false)
  const [elapsed, setElapsed] = useState(null)
  const startTime = useRef(null)
  const timerRef  = useRef(null)
  const inputRef  = useRef(null)
  const reportRef = useRef(null)

  const { status, progress, queries, report, sources, error, research, reset } = useResearch()

  useEffect(() => {
    if (status === 'loading') {
      startTime.current = Date.now()
      timerRef.current = setInterval(() => {
        setElapsed(((Date.now() - startTime.current) / 1000).toFixed(1))
      }, 100)
    } else {
      clearInterval(timerRef.current)
      if (status === 'done') setElapsed(((Date.now() - startTime.current) / 1000).toFixed(1))
    }
    return () => clearInterval(timerRef.current)
  }, [status])

  const handleSubmit = () => {
    if (topic.trim().length < 3) return
    setElapsed(null)
    research(topic.trim())
  }

  const handleReset = () => { reset(); setTopic(''); setElapsed(null) }

  const handleCopy = () => {
    navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `research-${topic.slice(0,40).replace(/\s+/g,'-')}.md`
    a.click()
  }

  const btnBase = {
    display: 'flex', alignItems: 'center', gap: 6,
    border: '1px solid #1A2540', borderRadius: 8,
    padding: '8px 16px', fontSize: 12, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', transition: 'all .2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,108,248,.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '60%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,.04) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Nav */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(7,11,20,.88)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #1A2540',
          padding: '0 32px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, #5B6CF8, #00D4FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>🔬</div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-.025em' }}>ResearchAI</span>
            <span style={{ fontSize: 10, background: '#131C30', border: '1px solid #1E2D4A', borderRadius: 99, padding: '2px 9px', color: '#5B6CF8', fontWeight: 700, letterSpacing: '.05em' }}>BETA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {status === 'loading' && (
              <div style={{ fontSize: 12, color: '#5B6CF8', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {elapsed}s
              </div>
            )}
            <div style={{ fontSize: 11, color: '#3A5070', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
              Groq · Tavily
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '52px 40px 100px' }}>

          {/* Hero */}
          {status === 'idle' && (
            <div className="fade-up" style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#0D1424', border: '1px solid #1E2D4A',
                borderRadius: 99, padding: '7px 16px', marginBottom: 28,
                fontSize: 12, color: '#5B6CF8', fontWeight: 600,
              }}>
                ⚡ 4-Step AI Pipeline · Real-time streaming
              </div>
              <h1 style={{
                fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)', fontWeight: 800,
                letterSpacing: '-.045em', lineHeight: 1.08, marginBottom: 20,
                background: 'linear-gradient(135deg, #E2EAF8 20%, #5B6CF8 60%, #00D4FF 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Deep research,<br />in seconds.
              </h1>
              <p style={{ color: '#4A6080', fontSize: 17, maxWidth: 500, margin: '0 auto 48px', lineHeight: 1.75 }}>
                Type a topic. Watch the pipeline decompose it, search the web,
                synthesize insights, and write a full report — live.
              </p>

              {/* Feature pills */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                {['🔍 Web search', '🧠 LLM synthesis', '📄 Markdown report', '⚡ Groq speed'].map((f, i) => (
                  <div key={i} style={{
                    background: '#0D1424', border: '1px solid #1E2D4A',
                    borderRadius: 99, padding: '6px 14px',
                    fontSize: 12, color: '#5A7090', fontWeight: 500,
                  }}>{f}</div>
                ))}
              </div>
            </div>
          )}

          {/* Search bar */}
          {(status === 'idle' || status === 'error') && (
            <div className="fade-up" style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: 'flex', gap: 10,
                  background: '#0D1424',
                  border: '1px solid #243355',
                  borderRadius: 18, padding: 8,
                  boxShadow: '0 0 0 1px rgba(91,108,248,.12), 0 12px 40px rgba(0,0,0,.5)',
                  transition: 'box-shadow .2s, border-color .2s',
                }}
                onFocusCapture={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(91,108,248,.4), 0 12px 40px rgba(0,0,0,.5)'
                  e.currentTarget.style.borderColor = '#5B6CF8'
                }}
                onBlurCapture={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(91,108,248,.12), 0 12px 40px rgba(0,0,0,.5)'
                  e.currentTarget.style.borderColor = '#243355'
                }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 14 }}>
                  <span style={{ color: '#4A6080', flexShrink: 0 }}><SearchIcon size={18} /></span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="What do you want to research today?"
                    style={{
                      flex: 1, background: 'none', border: 'none', outline: 'none',
                      fontSize: 15, color: '#E2EAF8', fontFamily: 'Inter, sans-serif',
                      padding: '8px 0',
                    }}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={topic.trim().length < 3}
                  style={{
                    background: topic.trim().length >= 3
                      ? 'linear-gradient(135deg, #5B6CF8, #818CF8)'
                      : '#0A1020',
                    border: 'none', borderRadius: 12,
                    padding: '12px 28px',
                    color: topic.trim().length >= 3 ? '#fff' : '#4A6080',
                    fontWeight: 700, fontSize: 14,
                    cursor: topic.trim().length >= 3 ? 'pointer' : 'not-allowed',
                    transition: 'all .2s', fontFamily: 'Inter, sans-serif',
                    boxShadow: topic.trim().length >= 3 ? '0 4px 20px rgba(91,108,248,.45)' : 'none',
                    whiteSpace: 'nowrap',
                  }}>
                  Research →
                </button>
              </div>

              {error && (
                <div style={{ marginTop: 12, background: '#1A0A0A', border: '1px solid #4A1A1A', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#F87171' }}>
                  ⚠ {error}
                </div>
              )}

              {/* Example chips */}
              <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: '#3A5070', alignSelf: 'center' }}>Try:</span>
                {EXAMPLE_TOPICS.map((t, i) => (
                  <button key={i} onClick={() => { setTopic(t); inputRef.current?.focus() }}
                    style={{
                      background: '#0A1020', border: '1px solid #1A2540',
                      borderRadius: 99, padding: '6px 14px',
                      fontSize: 12, color: '#7A90B0', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B6CF8'; e.currentTarget.style.color = '#818CF8'; e.currentTarget.style.background = '#0D1424' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A2540'; e.currentTarget.style.color = '#7A90B0'; e.currentTarget.style.background = '#0A1020' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {status === 'loading' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ background: '#0D1424', border: '1px solid #1A2540', borderRadius: 99, padding: '7px 16px', fontSize: 13, color: '#7A90B0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  🔬 <span style={{ color: '#E2EAF8', fontWeight: 500 }}>{topic}</span>
                </div>
                <div style={{ fontSize: 12, color: '#4A6080', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#5B6CF8', animation: 'pulse-ring .8s ease-out infinite' }} />
                  {elapsed}s elapsed
                </div>
              </div>
              <PipelineVisualizer currentStep={progress.step} queries={queries} />
              <SkeletonLoader />
            </div>
          )}

          {/* Results */}
          {status === 'done' && (
            <div className="fade-up">
              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ fontSize: 13, color: '#4A6080', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>✓</span>
                  Research complete —
                  <span style={{ color: '#E2EAF8', fontWeight: 600 }}>{topic}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleCopy} style={{ ...btnBase, background: '#0D1424', color: copied ? '#10B981' : '#7A90B0' }}>
                    {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
                  </button>
                  <button onClick={handleDownload} style={{ ...btnBase, background: '#0D1424', color: '#7A90B0' }}>
                    <DownloadIcon /> .md
                  </button>
                  <button onClick={handleReset} style={{
                    ...btnBase, border: 'none',
                    background: 'linear-gradient(135deg, #5B6CF8, #818CF8)',
                    color: '#fff', fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(91,108,248,.35)',
                  }}>
                    <ResetIcon /> New research
                  </button>
                </div>
              </div>

              <StatsBar sources={sources} report={report} elapsed={elapsed} />
              <PipelineVisualizer currentStep="complete" queries={queries} />

              {/* Two-column */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

                {/* Report */}
                <div ref={reportRef} style={{
                  background: '#0D1424', border: '1px solid #1A2540',
                  borderRadius: 16, padding: '40px 48px',
                }}>
                  <div className="report-body">
                    <ReactMarkdown>{report}</ReactMarkdown>
                  </div>
                </div>

                {/* Sources sidebar */}
                <div style={{ position: 'sticky', top: 72 }}>
                  <div style={{ background: '#0D1424', border: '1px solid #1A2540', borderRadius: 16, padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <p style={{ fontSize: 11, color: '#4A6080', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                        Sources
                      </p>
                      <span style={{ fontSize: 11, background: '#131C30', border: '1px solid #1E2D4A', borderRadius: 99, padding: '2px 8px', color: '#5B6CF8', fontWeight: 600 }}>
                        {sources.length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {sources.map((s, i) => <SourceCard key={i} source={s} index={i} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}