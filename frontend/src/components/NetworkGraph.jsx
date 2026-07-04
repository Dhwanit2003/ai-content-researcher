import { useEffect, useRef } from 'react'

const COLORS = {
  topic: '#7c3aed',
  query: '#06b6d4',
  source: '#10b981',
  link: 'rgba(124,58,237,0.3)',
  linkActive: 'rgba(6,182,212,0.5)',
}

export default function NetworkGraph({ topic, queries, sources, status }) {
  const svgRef = useRef(null)
  const animFrameRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const W = svg.clientWidth || 500
    const H = svg.clientHeight || 300
    const cx = W / 2
    const cy = H / 2

    // Build nodes and links
    const nodes = [{ id: 'topic', label: topic || 'Topic', type: 'topic', x: cx, y: cy, vx: 0, vy: 0 }]
    const links = []

    queries.forEach((q, i) => {
      const angle = (i / Math.max(queries.length, 1)) * Math.PI * 2 - Math.PI / 2
      const r = Math.min(W, H) * 0.28
      nodes.push({
        id: `q${i}`,
        label: typeof q === 'string' ? q : q.query || `Query ${i + 1}`,
        type: 'query',
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0, vy: 0,
      })
      links.push({ source: 'topic', target: `q${i}` })
    })

    sources.slice(0, 8).forEach((s, i) => {
      const qIdx = i % Math.max(queries.length, 1)
      const qNode = nodes.find(n => n.id === `q${qIdx}`)
      if (!qNode) return
      const angle = (i / Math.max(sources.length, 1)) * Math.PI * 2
      const r2 = Math.min(W, H) * 0.14
      nodes.push({
        id: `s${i}`,
        label: s.title?.split(' ').slice(0, 3).join(' ') || `Source ${i + 1}`,
        type: 'source',
        x: qNode.x + Math.cos(angle) * r2,
        y: qNode.y + Math.sin(angle) * r2,
        vx: 0, vy: 0,
      })
      links.push({ source: `q${qIdx}`, target: `s${i}` })
    })

    // Simple force simulation (no D3 dependency needed)
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
    const ITER = 80

    for (let iter = 0; iter < ITER; iter++) {
      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 1800 / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          a.vx -= fx; a.vy -= fy
          b.vx += fx; b.vy += fy
        }
      }
      // Attraction along links
      for (const link of links) {
        const a = nodeMap[link.source], b = nodeMap[link.target]
        if (!a || !b) continue
        const dx = b.x - a.x, dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const target = a.type === 'topic' ? 120 : 70
        const force = (dist - target) * 0.05
        const fx = (dx / dist) * force, fy = (dy / dist) * force
        if (a.type !== 'topic') { a.vx += fx; a.vy += fy }
        b.vx -= fx; b.vy -= fy
      }
      // Center gravity
      for (const n of nodes) {
        if (n.type !== 'topic') {
          n.vx += (cx - n.x) * 0.003
          n.vy += (cy - n.y) * 0.003
        }
      }
      // Integrate + dampen
      for (const n of nodes) {
        if (n.type === 'topic') { n.x = cx; n.y = cy; continue }
        n.vx *= 0.7; n.vy *= 0.7
        n.x += n.vx; n.y += n.vy
        n.x = Math.max(30, Math.min(W - 30, n.x))
        n.y = Math.max(20, Math.min(H - 20, n.y))
      }
    }

    // Render SVG
    const ns = 'http://www.w3.org/2000/svg'

    // Clear
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    // Defs
    const defs = document.createElementNS(ns, 'defs')
    ;['violet', 'cyan', 'green'].forEach((name, i) => {
      const colors = ['#7c3aed', '#06b6d4', '#10b981']
      const filter = document.createElementNS(ns, 'filter')
      filter.setAttribute('id', `glow-${name}`)
      const feGlow = document.createElementNS(ns, 'feDropShadow')
      feGlow.setAttribute('dx', '0')
      feGlow.setAttribute('dy', '0')
      feGlow.setAttribute('stdDeviation', '3')
      feGlow.setAttribute('flood-color', colors[i])
      feGlow.setAttribute('flood-opacity', '0.6')
      filter.appendChild(feGlow)
      defs.appendChild(filter)
    })
    svg.appendChild(defs)

    // Links
    for (const link of links) {
      const a = nodeMap[link.source], b = nodeMap[link.target]
      if (!a || !b) continue
      const line = document.createElementNS(ns, 'line')
      line.setAttribute('x1', a.x)
      line.setAttribute('y1', a.y)
      line.setAttribute('x2', b.x)
      line.setAttribute('y2', b.y)
      const isSource = b.type === 'source'
      line.setAttribute('stroke', isSource ? 'rgba(16,185,129,0.25)' : 'rgba(124,58,237,0.3)')
      line.setAttribute('stroke-width', isSource ? '1' : '1.5')
      line.setAttribute('stroke-dasharray', isSource ? '3 4' : 'none')
      svg.appendChild(line)
    }

    // Nodes
    for (const node of nodes) {
      const g = document.createElementNS(ns, 'g')
      g.setAttribute('transform', `translate(${node.x},${node.y})`)

      const typeConfig = {
        topic: { r: 12, fill: '#7c3aed', stroke: '#a78bfa', filter: 'url(#glow-violet)', textY: 22 },
        query: { r: 7, fill: '#06b6d4', stroke: '#67e8f9', filter: 'url(#glow-cyan)', textY: 16 },
        source: { r: 4, fill: '#10b981', stroke: '#6ee7b7', filter: 'url(#glow-green)', textY: 12 },
      }[node.type]

      // Outer ring for topic
      if (node.type === 'topic') {
        const ring = document.createElementNS(ns, 'circle')
        ring.setAttribute('r', 20)
        ring.setAttribute('fill', 'none')
        ring.setAttribute('stroke', 'rgba(124,58,237,0.2)')
        ring.setAttribute('stroke-width', '1')
        g.appendChild(ring)
      }

      const circle = document.createElementNS(ns, 'circle')
      circle.setAttribute('r', typeConfig.r)
      circle.setAttribute('fill', typeConfig.fill)
      circle.setAttribute('stroke', typeConfig.stroke)
      circle.setAttribute('stroke-width', '1.5')
      circle.setAttribute('filter', typeConfig.filter)
      g.appendChild(circle)

      // Label for topic and query nodes
      if (node.type !== 'source') {
        const maxLen = node.type === 'topic' ? 16 : 24
        const label = node.label.length > maxLen ? node.label.slice(0, maxLen) + '…' : node.label
        const text = document.createElementNS(ns, 'text')
        text.setAttribute('y', typeConfig.textY)
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('font-size', node.type === 'topic' ? '9' : '7.5')
        text.setAttribute('font-family', 'Space Grotesk, sans-serif')
        text.setAttribute('font-weight', node.type === 'topic' ? '600' : '400')
        text.setAttribute('fill', node.type === 'topic' ? '#e2e8f0' : '#94a3b8')
        text.textContent = label
        g.appendChild(text)
      }

      svg.appendChild(g)
    }
  }, [topic, queries, sources])

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Knowledge Graph</span>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#7c3aed' }}></span>Topic</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#06b6d4' }}></span>Query</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#10b981' }}></span>Source</span>
        </div>
      </div>
      <svg ref={svgRef} width="100%" height="220" style={{ display: 'block' }} />
    </div>
  )
}
