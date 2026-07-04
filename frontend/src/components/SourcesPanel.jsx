import { ExternalLink } from 'lucide-react'

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

function getDomainColor(domain) {
  const hash = domain.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6']
  return colors[hash % colors.length]
}

export default function SourcesPanel({ sources }) {
  if (!sources.length) return null

  return (
    <div className="space-y-3">
      {sources.map((source, i) => {
        const domain = getDomain(source.url)
        const color = getDomainColor(domain)
        return (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border p-4 transition-all duration-200 group"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 20px ${color}22` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Index badge */}
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono flex-shrink-0 mt-0.5"
                  style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium mb-1 leading-snug" style={{ color: 'var(--text)' }}>
                    {source.title || 'Untitled'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: `${color}15`, color }}>
                      {domain}
                    </span>
                  </div>
                </div>
              </div>
              <ExternalLink size={14} className="flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: 'var(--muted)' }} />
            </div>
          </a>
        )
      })}
    </div>
  )
}
