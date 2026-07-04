const STEPS = [
  { id: 'step1', label: 'Decompose', desc: 'Break topic into queries', icon: '◈' },
  { id: 'step2', label: 'Search',    desc: 'Scan the web',            icon: '⊕' },
  { id: 'step3', label: 'Synthesize',desc: 'Distill each result',     icon: '⊗' },
  { id: 'step4', label: 'Report',    desc: 'Compile final report',    icon: '◉' },
]

const STEP_ORDER = ['start', 'step1', 'step1_done', 'step2', 'step2_done', 'step3', 'step3_done', 'step4', 'complete']

function getStepStatus(stepId, currentStep) {
  const stepMap = { step1: ['step1', 'step1_done'], step2: ['step2', 'step2_done'], step3: ['step3', 'step3_done'], step4: ['step4'] }
  const relevantSteps = stepMap[stepId] || []
  const currentIdx = STEP_ORDER.indexOf(currentStep)

  if (currentStep === 'complete') return 'done'
  const stepDoneId = stepId + '_done'
  const stepDoneIdx = STEP_ORDER.indexOf(stepDoneId)
  if (stepDoneIdx !== -1 && currentIdx > stepDoneIdx) return 'done'
  if (relevantSteps.includes(currentStep)) return 'active'
  const stepIdx = STEP_ORDER.indexOf(stepId)
  if (currentIdx > stepIdx) return 'done'
  return 'pending'
}

export default function PipelineTracker({ currentStep, pct }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Pipeline</span>
        <span className="text-xs font-mono" style={{ color: 'var(--primary-light)' }}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: 'var(--card)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const status = getStepStatus(step.id, currentStep)
          return (
            <div key={step.id} className="flex items-center gap-3">
              {/* Connector line */}
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-mono transition-all duration-300"
                  style={{
                    background: status === 'done' ? 'rgba(124,58,237,0.2)' : status === 'active' ? 'rgba(124,58,237,0.3)' : 'var(--card)',
                    border: `1px solid ${status === 'done' ? '#7c3aed' : status === 'active' ? '#a78bfa' : 'var(--border)'}`,
                    color: status === 'done' ? '#a78bfa' : status === 'active' ? '#e2e8f0' : 'var(--muted)',
                    boxShadow: status === 'active' ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
                  }}
                >
                  {status === 'done' ? '✓' : status === 'active' ? (
                    <span style={{ animation: 'spin-slow 2s linear infinite', display: 'inline-block' }}>◌</span>
                  ) : step.icon}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px h-3 mt-1" style={{ background: status === 'done' ? 'rgba(124,58,237,0.4)' : 'var(--border)' }} />
                )}
              </div>
              <div>
                <div className="text-xs font-medium" style={{ color: status === 'pending' ? 'var(--muted)' : 'var(--text)' }}>
                  {step.label}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{step.desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
