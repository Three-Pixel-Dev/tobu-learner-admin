import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldRow } from '@/components/common/field'
import { kanjiService, type KanjiDto, type CreateKanjiPayload } from '@/shared/services/kanji.service'
import { jlptLevelService, type JlptLevelDto } from '@/shared/services/jlpt-level.service'
import { fetchKanjiVgData, parseCustomSvgString } from '@/features/kana/components/kanjivg-importer'
import { KanjiPreviewCanvas } from '@/features/kana/components/kanji-preview-canvas'
import { KanjiBatchModal } from '@/features/kana/components/kanji-batch-modal'

const PAGE_SIZE = 24

export function KanjiDetail() {
  const [kanjiList, setKanjiList] = useState<KanjiDto[]>([])
  const [levels, setLevels] = useState<JlptLevelDto[]>([])
  const [selectedLevelId, setSelectedLevelId] = useState<number | undefined>(undefined)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalElements, setTotalElements] = useState(0)

  const pageRef = useRef(0)
  const hasMoreRef = useRef(true)
  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Single Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<KanjiDto | null>(null)
  const [charInput, setCharInput] = useState('')
  const [levelIdInput, setLevelIdInput] = useState<number>(1)
  const [onyomiInput, setOnyomiInput] = useState('')
  const [kunyomiInput, setKunyomiInput] = useState('')
  const [meaningMmInput, setMeaningMmInput] = useState('')
  const [meaningEnInput, setMeaningEnInput] = useState('')
  const [strokeCountInput, setStrokeCountInput] = useState<number>(0)
  const [strokeJsonInput, setStrokeJsonInput] = useState<Record<string, any>>({ strokes: [] })

  // Batch Upload Modal state
  const [showBatchModal, setShowBatchModal] = useState(false)

  // Canvas Mode: 'record' (draw strokes manually) or 'test' (verify learner tracing)
  const [canvasMode, setCanvasMode] = useState<'record' | 'test'>('record')

  // Advanced SVG / Developer JSON toggles (hidden by default)
  const [showSvgInput, setShowSvgInput] = useState(false)
  const [showJsonEditor, setShowJsonEditor] = useState(false)
  const [customSvgText, setCustomSvgText] = useState('')
  const [importLoading, setImportLoading] = useState(false)

  useEffect(() => {
    void jlptLevelService.list().then((levelData) => {
      setLevels(levelData || [])
      if (levelData && levelData.length > 0) {
        setLevelIdInput((prev) => prev || levelData[0].id)
      }
    })
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (loadingRef.current) return
      loadingRef.current = true
      if (append) setLoadingMore(true)
      else setLoading(true)
      try {
        const result = await kanjiService.page({
          pageNumber: page,
          pageSize: PAGE_SIZE,
          filter: {
            jlptLevelId: selectedLevelId,
            search: search || undefined,
            includeDisabled: true,
          },
        })
        setKanjiList((prev) => (append ? [...prev, ...result.data] : result.data))
        pageRef.current = page
        const more = page < (result.meta.totalPages || 0)
        hasMoreRef.current = more
        setHasMore(more)
        setTotalElements(result.meta.totalElements ?? result.data.length)
      } catch (err) {
        console.error('Failed to load Kanji list:', err)
        if (!append) {
          setKanjiList([])
          setHasMore(false)
          hasMoreRef.current = false
          setTotalElements(0)
        }
      } finally {
        loadingRef.current = false
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [selectedLevelId, search],
  )

  const resetAndLoad = useCallback(() => {
    pageRef.current = 0
    hasMoreRef.current = true
    setHasMore(true)
    void fetchPage(1, false)
  }, [fetchPage])

  useEffect(() => {
    resetAndLoad()
  }, [resetAndLoad])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          void fetchPage(pageRef.current + 1, true)
        }
      },
      { rootMargin: '240px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchPage, kanjiList.length])

  const openCreateModal = () => {
    setEditingItem(null)
    setCharInput('')
    setOnyomiInput('')
    setKunyomiInput('')
    setMeaningMmInput('')
    setMeaningEnInput('')
    setStrokeCountInput(0)
    setStrokeJsonInput({ strokes: [] })
    setCustomSvgText('')
    setShowSvgInput(false)
    setShowJsonEditor(false)
    setCanvasMode('record')
    setShowModal(true)
  }

  const openEditModal = (item: KanjiDto) => {
    setEditingItem(item)
    setCharInput(item.character)
    setLevelIdInput(item.jlptLevelId)
    setOnyomiInput(item.onyomi || '')
    setKunyomiInput(item.kunyomi || '')
    setMeaningMmInput(item.meaningMm || '')
    setMeaningEnInput(item.meaningEn || '')
    setStrokeCountInput(item.strokeCount || item.strokeOrderJson?.strokes?.length || 0)
    setStrokeJsonInput(item.strokeOrderJson || { strokes: [] })
    setCustomSvgText('')
    setShowSvgInput(false)
    setShowJsonEditor(false)
    setCanvasMode('test')
    setShowModal(true)
  }

  const handleAutoImportKanjiVg = async () => {
    if (!charInput.trim()) return
    setImportLoading(true)
    try {
      const res = await fetchKanjiVgData(charInput.trim())
      if (res && res.strokeCount > 0) {
        setStrokeCountInput(res.strokeCount)
        setStrokeJsonInput(res.strokeOrderJson)
        setCanvasMode('test')
      } else {
        setShowSvgInput(true)
        alert(
          `Character '${charInput}' is rare or complex and not indexed in KanjiVG CDN.\n\nYou can draw strokes directly on the canvas below in '🔴 Record Mode' or paste SVG markup.`
        )
      }
    } catch (err) {
      console.error('Import error:', err)
    } finally {
      setImportLoading(false)
    }
  }

  const handleParseCustomSvg = () => {
    if (!customSvgText.trim()) return
    const res = parseCustomSvgString(customSvgText, charInput)
    if (res && res.strokeCount > 0) {
      setStrokeCountInput(res.strokeCount)
      setStrokeJsonInput(res.strokeOrderJson)
      setCanvasMode('test')
      alert(`Successfully parsed ${res.strokeCount} strokes from custom SVG!`)
    } else {
      alert('Could not parse valid <path> stroke elements from the pasted SVG string.')
    }
  }

  const handleStrokeRecorded = (newStrokePoints: number[][]) => {
    const existingStrokes: number[][][] = strokeJsonInput?.strokes || []
    const updated = [...existingStrokes, newStrokePoints]
    setStrokeCountInput(updated.length)
    setStrokeJsonInput({ ...strokeJsonInput, strokes: updated })
  }

  const handleClearStrokes = () => {
    setStrokeCountInput(0)
    setStrokeJsonInput({ ...strokeJsonInput, strokes: [] })
  }

  const handleSave = async () => {
    if (!charInput.trim()) {
      alert('Kanji character is required')
      return
    }

    const payload: CreateKanjiPayload = {
      character: charInput.trim(),
      jlptLevelId: levelIdInput,
      onyomi: onyomiInput.trim(),
      kunyomi: kunyomiInput.trim(),
      meaningMm: meaningMmInput.trim(),
      meaningEn: meaningEnInput.trim(),
      strokeCount: strokeCountInput,
      strokeOrderJson: strokeJsonInput,
    }

    try {
      if (editingItem) {
        await kanjiService.update(editingItem.id, payload)
      } else {
        await kanjiService.create(payload)
      }
      setShowModal(false)
      resetAndLoad()
    } catch (err) {
      console.error('Failed to save Kanji:', err)
      alert('Error saving Kanji')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Disable this Kanji item?')) return
    try {
      await kanjiService.softDelete(id)
      resetAndLoad()
    } catch (err) {
      console.error('Failed to delete Kanji:', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search character or meaning..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-[220px]"
          />
          <select
            value={selectedLevelId || ''}
            onChange={(e) => setSelectedLevelId(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"
          >
            <option value="">All Levels</option>
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.code} - {lvl.name}
              </option>
            ))}
          </select>
          {totalElements > 0 ? (
            <span className="text-[11px] text-subtle">
              Showing {kanjiList.length} of {totalElements}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setShowBatchModal(true)}>
            📦 Batch Upload Kanji
          </Button>
          <Button onClick={openCreateModal}>+ Add New Kanji</Button>
        </div>
      </div>

      {/* Kanji Cards Grid */}
      {loading && kanjiList.length === 0 ? (
        <div className="py-8 text-center text-xs text-subtle">Loading Kanji data...</div>
      ) : kanjiList.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-xs text-subtle">
          No Kanji items found. Click "+ Add New Kanji" or "📦 Batch Upload Kanji" to create.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {kanjiList.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border-[1.5px] border-border bg-card p-4 transition-all ${item.deleted ? 'opacity-50' : 'hover:border-[#CBD5E1]'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-3xl font-bold text-emerald-800">
                      {item.character}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-800">
                          {item.jlptLevelCode || 'N5'}
                        </span>
                        <span className="text-xs font-semibold text-subtle">
                          {item.strokeCount || (item.strokeOrderJson?.strokes?.length || 0)} strokes
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-bold text-gray-900">
                        {item.meaningMm || item.meaningEn}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="rounded-lg p-1.5 text-xs text-gray-600 hover:bg-gray-100"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-1.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-2 text-xs">
                  <div>
                    <span className="text-[10px] text-subtle">音 (Onyomi):</span>
                    <div className="font-semibold text-gray-800">{item.onyomi || '-'}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-subtle">訓 (Kunyomi):</span>
                    <div className="font-semibold text-gray-800">{item.kunyomi || '-'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div ref={sentinelRef} className="py-4 text-center text-[11px] text-subtle">
            {loadingMore ? 'Loading more…' : hasMore ? 'Scroll for more' : 'All Kanji loaded'}
          </div>
        </>
      )}

      {/* Batch Upload Modal */}
      {showBatchModal && (
        <KanjiBatchModal
          levels={levels}
          onClose={() => setShowBatchModal(false)}
          onSuccess={resetAndLoad}
        />
      )}

      {/* Single Add / Edit Kanji Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? `Edit Kanji (${editingItem.character})` : 'Add New Kanji'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <FieldRow>
                <Field label="Kanji Character">
                  <div className="flex gap-2">
                    <Input
                      value={charInput}
                      onChange={(e) => setCharInput(e.target.value)}
                      placeholder="e.g. 木 or 水"
                      className="text-center font-bold text-lg"
                    />
                    <Button onClick={handleAutoImportKanjiVg} disabled={importLoading} variant="ghost">
                      {importLoading ? 'Importing...' : '⚡ Auto-Fetch KanjiVG'}
                    </Button>
                  </div>
                </Field>
                <Field label="JLPT Level">
                  <select
                    value={levelIdInput}
                    onChange={(e) => setLevelIdInput(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs font-semibold"
                  >
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.code} - {l.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="On'yomi (音読み)">
                  <Input value={onyomiInput} onChange={(e) => setOnyomiInput(e.target.value)} placeholder="e.g. モク" />
                </Field>
                <Field label="Kun'yomi (訓読み)">
                  <Input value={kunyomiInput} onChange={(e) => setKunyomiInput(e.target.value)} placeholder="e.g. き" />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Meaning (Myanmar)">
                  <Input value={meaningMmInput} onChange={(e) => setMeaningMmInput(e.target.value)} placeholder="e.g. သစ်ပင်" />
                </Field>
                <Field label="Meaning (English)">
                  <Input value={meaningEnInput} onChange={(e) => setMeaningEnInput(e.target.value)} placeholder="e.g. tree" />
                </Field>
              </FieldRow>

              {/* Canvas Mode Selector & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gray-100 p-2">
                <div className="flex rounded-xl bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setCanvasMode('record')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${canvasMode === 'record'
                        ? 'bg-orange-600 text-white shadow'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    🔴 Draw & Record Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanvasMode('test')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${canvasMode === 'test'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    🧪 Test Verification Mode
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSvgInput(!showSvgInput)}
                    className="rounded-lg bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 hover:bg-sky-200"
                  >
                    📋 {showSvgInput ? 'Hide SVG Box' : 'Paste Custom SVG'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearStrokes}
                    className="rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-200"
                  >
                    🧹 Clear ({strokeJsonInput?.strokes?.length || 0})
                  </button>
                </div>
              </div>

              {/* Custom SVG Paste Area for Complex/Rare Characters */}
              {showSvgInput && (
                <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 p-4">
                  <div className="mb-2 text-xs font-bold text-sky-900">
                    Paste Raw SVG Code (For Rare / Custom / Complex Characters)
                  </div>
                  <textarea
                    value={customSvgText}
                    onChange={(e) => setCustomSvgText(e.target.value)}
                    placeholder="Paste <svg>...</svg> or <path d='...' /> markup here..."
                    rows={3}
                    className="w-full rounded-xl border border-sky-200 bg-white p-3 font-mono text-xs text-gray-800"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleParseCustomSvg}
                      className="rounded-lg bg-sky-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-800"
                    >
                      Parse SVG Paths into Strokes
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Canvas */}
              <div className="rounded-2xl border bg-gray-50 p-4 flex flex-col items-center">
                <div className="mb-2 text-xs font-bold text-gray-700">
                  {canvasMode === 'record'
                    ? '🔴 Draw with your mouse/finger on top of the ghost character to record each stroke!'
                    : '🧪 Tracing Verification Mode (Practice drawing recorded strokes)'}
                </div>
                <KanjiPreviewCanvas
                  character={charInput || '木'}
                  strokes={strokeJsonInput?.strokes || []}
                  mode={canvasMode}
                  onStrokeRecorded={handleStrokeRecorded}
                  onClearStrokes={handleClearStrokes}
                />
              </div>

              {/* Developer JSON Matrix Editor (Hidden by default) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowJsonEditor(!showJsonEditor)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline"
                >
                  {showJsonEditor ? '⚙️ Hide Raw JSON Data' : '⚙️ Advanced Developer JSON Data (Optional)'}
                </button>
                {showJsonEditor && (
                  <div className="mt-2">
                    <textarea
                      value={JSON.stringify(strokeJsonInput, null, 2)}
                      onChange={(e) => {
                        try {
                          setStrokeJsonInput(JSON.parse(e.target.value))
                        } catch { }
                      }}
                      rows={3}
                      className="w-full rounded-xl border bg-gray-900 p-3 font-mono text-xs text-emerald-400"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Kanji Entry</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
