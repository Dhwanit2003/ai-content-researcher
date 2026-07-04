function extractKeywords(text) {
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','as','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','that','this','these','those','it','its','they','their','we','our','you','your','he','his','she','her','i','my','not','no','so','if','then','than','when','where','what','which','who','how','all','each','every','both','few','more','most','other','some','such','also','into','through','during','before','after','above','below','between','out','off','over','under','again','further','once','here','there','just','because','while','about','against','up','can','any','only','same','very','own','too'])

  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || []
  const freq = {}
  for (const w of words) {
    if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))
}

function readingTime(text) {
  const words = text.split(/\s+/).length
  return Math.ceil(words / 200)
}

export default function StatsPanel({ report, sources }) {
  if (!report) return null
  const keywords = extractKeywords(report)
  const maxCount = keywords[0]?.count || 1
  const words = report.split(/\s+/).length
  const rt = readingTime(report)
  const domains = [...new Set(sources.map(s => { try { return new URL(s.url).hostname.replace('www.','') } catch { return s.url } }))]

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Word Count', value: words.toLocaleString(), color: '#7c3aed' },
          { label: 'Read Time', value: `${rt} min`, color: '#06b6d4' },
          { label: 'Sources', value: sources.length, color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-4 border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="text-2xl font-bold font-mono mb-1" style={{ color: stat.color, fontFamily: 'Space Grotesk' }}>{stat.value}</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Keyword frequency */}
      <div className="rounded-xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'var(--muted)' }}>Top Keywords</div>
        <div className="space-y-2">
          {keywords.map(({ word, count }, i) => (
            <div key={word} className="flex items-center gap-3">
              <div className="text-xs font-mono w-5 text-right" style={{ color: 'var(--muted)' }}>{i + 1}</div>
              <div className="text-xs w-28 truncate capitalize" style={{ color: 'var(--text)' }}>{word}</div>
              <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: 'var(--card)' }}>
                <div
                  className="h-full rounded flex items-center px-2 transition-all duration-700"
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                    background: `linear-gradient(90deg, rgba(124,58,237,0.6), rgba(6,182,212,0.4))`,
                    minWidth: 24,
                  }}
                >
                  <span className="text-xs font-mono" style={{ color: '#e2e8f0', fontSize: '10px' }}>{count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Domains */}
      <div className="rounded-xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--muted)' }}>Sources Consulted</div>
        <div className="flex flex-wrap gap-2">
          {domains.map(d => (
            <span key={d} className="text-xs px-2 py-1 rounded-md font-mono" style={{ background: 'var(--card)', color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.2)' }}>
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
