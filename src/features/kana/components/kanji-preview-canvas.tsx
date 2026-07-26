import React, { useEffect, useRef, useState } from 'react'

interface KanjiPreviewCanvasProps {
  character: string
  strokes: number[][][]
}

export function KanjiPreviewCanvas({ character, strokes }: KanjiPreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [si, setSi] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const drawing = useRef(false)
  const userPts = useRef<{ x: number; y: number }[]>([])
  const TOL = 18

  const px = (v: number, size: number) => (v / 100) * size

  const redraw = () => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const size = cv.getBoundingClientRect().width || 260
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)

    // Completed strokes
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#22C55E'
    ctx.lineWidth = 12

    for (let s = 0; s < si; s++) {
      const pts = strokes[s]
      if (!pts || pts.length === 0) continue
      ctx.beginPath()
      ctx.moveTo(px(pts[0][0], size), px(pts[0][1], size))
      for (let p = 1; p < pts.length; p++) {
        ctx.lineTo(px(pts[p][0], size), px(pts[p][1], size))
      }
      ctx.stroke()
    }

    // Current stroke hint (dashed line + start dot)
    if (si < strokes.length) {
      const pts = strokes[si]
      if (pts && pts.length > 0) {
        ctx.strokeStyle = '#38BDF8'
        ctx.lineWidth = 4
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        ctx.moveTo(px(pts[0][0], size), px(pts[0][1], size))
        for (let p = 1; p < pts.length; p++) {
          ctx.lineTo(px(pts[p][0], size), px(pts[p][1], size))
        }
        ctx.stroke()
        ctx.setLineDash([])

        // Start dot + number
        ctx.fillStyle = '#38BDF8'
        ctx.beginPath()
        ctx.arc(px(pts[0][0], size), px(pts[0][1], size), 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(si + 1), px(pts[0][0], size), px(pts[0][1], size))
      }
    }
  }

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    const rect = cv.getBoundingClientRect()
    cv.width = (rect.width || 260) * dpr
    cv.height = (rect.height || 260) * dpr
    redraw()
  }, [si, strokes, character])

  const pos = (e: any) => {
    const cv = canvasRef.current!
    const rect = cv.getBoundingClientRect()
    const p = e.touches ? e.touches[0] : e
    return {
      x: ((p.clientX - rect.left) / rect.width) * 100,
      y: ((p.clientY - rect.top) / rect.height) * 100,
    }
  }

  const start = (e: any) => {
    if (completed || !strokes || strokes.length === 0) return
    e.preventDefault()
    drawing.current = true
    userPts.current = [pos(e)]
  }

  const move = (e: any) => {
    if (!drawing.current) return
    e.preventDefault()
    const p = pos(e)
    userPts.current.push(p)

    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const size = cv.getBoundingClientRect().width
    const pts = userPts.current
    const a = pts[pts.length - 2]
    const b = pts[pts.length - 1]

    if (a && b) {
      ctx.strokeStyle = '#94A3B8'
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(px(a.x, size), px(a.y, size))
      ctx.lineTo(px(b.x, size), px(b.y, size))
      ctx.stroke()
    }
  }

  const dist = (a: { x: number; y: number }, b: number[]) => Math.hypot(a.x - b[0], a.y - b[1])

  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    const pts = userPts.current
    if (pts.length < 2 || si >= strokes.length) {
      redraw()
      return
    }

    const exp = strokes[si]
    const s = pts[0]
    const e2 = pts[pts.length - 1]

    const okFwd = dist(s, exp[0]) < TOL && dist(e2, exp[exp.length - 1]) < TOL

    if (okFwd) {
      const nsi = si + 1
      setSi(nsi)
      setMsg(nsi === strokes.length ? 'Correct! 🎉' : `Stroke ${nsi} ✓`)
      if (nsi === strokes.length) {
        setCompleted(true)
      }
    } else {
      setMsg(dist(s, exp[0]) >= TOL ? 'Start at blue dot' : 'Wrong direction')
      redraw()
    }
    userPts.current = []
  }

  const reset = () => {
    setSi(0)
    setCompleted(false)
    setMsg(null)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-3 h-[240px] w-[240px] rounded-2xl border-2 border-emerald-200 bg-white">
        {/* Grid lines */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 top-0 border-l border-dashed border-gray-200" />
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-200" />
        </div>

        {/* Faint Ghost Character */}
        <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-serif text-[160px] leading-none text-gray-100">
          {character}
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>

      <div className="mb-3 flex items-center justify-between w-[240px] text-xs">
        <span className="font-semibold text-emerald-700">
          Stroke {si} / {strokes?.length || 0}
        </span>
        {msg && <span className="font-bold text-sky-600">{msg}</span>}
      </div>

      <button
        onClick={reset}
        type="button"
        className="rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
      >
        🧹 Reset Drawing
      </button>
    </div>
  )
}
