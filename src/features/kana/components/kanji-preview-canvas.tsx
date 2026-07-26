import React, { useEffect, useRef, useState } from 'react'

interface KanjiPreviewCanvasProps {
  character: string
  strokes: number[][][]
  mode?: 'test' | 'record'
  onStrokeRecorded?: (strokePoints: number[][]) => void
  onClearStrokes?: () => void
}

export function KanjiPreviewCanvas({
  character,
  strokes,
  mode = 'test',
  onStrokeRecorded,
  onClearStrokes,
}: KanjiPreviewCanvasProps) {
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

    // Render all saved/recorded strokes
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = mode === 'record' ? '#0284C7' : '#22C55E'
    ctx.lineWidth = 10

    const renderCount = mode === 'record' ? strokes.length : si
    for (let s = 0; s < renderCount; s++) {
      const pts = strokes[s]
      if (!pts || pts.length === 0) continue
      ctx.beginPath()
      ctx.moveTo(px(pts[0][0], size), px(pts[0][1], size))
      for (let p = 1; p < pts.length; p++) {
        ctx.lineTo(px(pts[p][0], size), px(pts[p][1], size))
      }
      ctx.stroke()

      // Stroke number badge at start of stroke
      ctx.fillStyle = '#0284C7'
      ctx.beginPath()
      ctx.arc(px(pts[0][0], size), px(pts[0][1], size), 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(s + 1), px(pts[0][0], size), px(pts[0][1], size))
    }

    // Current stroke hint in Test mode (dashed line + start dot)
    if (mode === 'test' && si < strokes.length) {
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
  }, [si, strokes, character, mode])

  const pos = (e: any) => {
    const cv = canvasRef.current!
    const rect = cv.getBoundingClientRect()
    const p = e.touches ? e.touches[0] : e
    return {
      x: Math.round((((p.clientX - rect.left) / rect.width) * 100) * 10) / 10,
      y: Math.round((((p.clientY - rect.top) / rect.height) * 100) * 10) / 10,
    }
  }

  const start = (e: any) => {
    if (mode === 'test' && (completed || !strokes || strokes.length === 0)) return
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
      ctx.strokeStyle = mode === 'record' ? '#EA580C' : '#94A3B8'
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
    if (pts.length < 2) {
      redraw()
      return
    }

    if (mode === 'record') {
      // Sample points along drawn stroke
      const sampled: number[][] = []
      const step = Math.max(1, Math.floor(pts.length / 8))
      for (let i = 0; i < pts.length; i += step) {
        sampled.push([pts[i].x, pts[i].y])
      }
      const last = pts[pts.length - 1]
      if (sampled[sampled.length - 1][0] !== last.x || sampled[sampled.length - 1][1] !== last.y) {
        sampled.push([last.x, last.y])
      }

      onStrokeRecorded?.(sampled)
      setMsg(`Recorded Stroke ${strokes.length + 1} ✓`)
      userPts.current = []
      return
    }

    // Mode === 'test' (Verification)
    if (si >= strokes.length) {
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
      <div
        className={`relative mb-3 h-[260px] w-[260px] rounded-2xl border-2 bg-white transition-colors ${
          mode === 'record' ? 'border-orange-400 bg-orange-50/20' : 'border-emerald-200'
        }`}
      >
        {/* Grid lines */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 top-0 border-l border-dashed border-gray-200" />
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-200" />
        </div>

        {/* Faint Ghost Character */}
        <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-serif text-[180px] leading-none text-gray-200">
          {character}
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>

      <div className="mb-3 flex items-center justify-between w-[260px] text-xs">
        <span className="font-bold text-gray-800">
          {mode === 'record'
            ? `🔴 Recording Stroke ${strokes?.length + 1}`
            : `Test Stroke ${si} / ${strokes?.length || 0}`}
        </span>
        {msg && (
          <span
            className={`font-bold ${
              msg.includes('Recorded') || msg.includes('Correct') ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {msg}
          </span>
        )}
      </div>

      {mode === 'test' ? (
        <button
          onClick={reset}
          type="button"
          className="rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
        >
          🧹 Reset Verification
        </button>
      ) : (
        <button
          onClick={onClearStrokes}
          type="button"
          className="rounded-lg bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200"
        >
          🧹 Clear All Recorded Strokes
        </button>
      )}
    </div>
  )
}
