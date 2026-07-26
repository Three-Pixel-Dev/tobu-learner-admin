import React, { useState } from 'react'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchKanjiVgData } from '@/features/kana/components/kanjivg-importer'
import { KanjiPreviewCanvas } from '@/features/kana/components/kanji-preview-canvas'
import { kanjiService, type CreateKanjiPayload } from '@/shared/services/kanji.service'
import type { JlptLevelDto } from '@/shared/services/jlpt-level.service'

export interface BatchItem {
  id: string
  character: string
  jlptLevelId: number
  jlptLevelCode?: string
  meaningMm: string
  meaningEn: string
  onyomi: string
  kunyomi: string
  strokeCount: number
  strokeOrderJson: Record<string, any>
  status: 'pending' | 'success' | 'unrecognized'
}

interface KanjiBatchModalProps {
  levels: JlptLevelDto[]
  onClose: () => void
  onSuccess: () => void
}

export function KanjiBatchModal({ levels, onClose, onSuccess }: KanjiBatchModalProps) {
  const [step, setStep] = useState<'input' | 'confirm'>('input')
  const [rawText, setRawText] = useState('')
  const [defaultLevelId, setDefaultLevelId] = useState<number>(levels[0]?.id || 1)
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Drawer / Submodal to draw canvas for unrecognized character
  const [fixingItem, setFixingItem] = useState<BatchItem | null>(null)

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        Character: '水',
        JLPT: 'N5',
        'Onyomi (音)': 'スイ',
        'Kunyomi (訓)': 'みず',
        'Meaning (MM)': 'ရေ',
        'Meaning (EN)': 'water',
      },
      {
        Character: '山',
        JLPT: 'N5',
        'Onyomi (音)': 'サン',
        'Kunyomi (訓)': 'やま',
        'Meaning (MM)': 'တောင်',
        'Meaning (EN)': 'mountain',
      },
      {
        Character: '日',
        JLPT: 'N5',
        'Onyomi (音)': 'ニチ',
        'Kunyomi (訓)': 'ひ',
        'Meaning (MM)': 'နေ / နေ့',
        'Meaning (EN)': 'sun, day',
      },
      {
        Character: '凡',
        JLPT: 'N2',
        'Onyomi (音)': 'ハン',
        'Kunyomi (訓)': 'およそ',
        'Meaning (MM)': 'အထွေထွေ',
        'Meaning (EN)': 'general, legend',
      },
      {
        Character: '例',
        JLPT: 'N3',
        'Onyomi (音)': 'レイ',
        'Kunyomi (訓)': 'たとえ',
        'Meaning (MM)': 'ဥပမာ',
        'Meaning (EN)': 'example, custom',
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(sampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kanji Batch')
    XLSX.writeFile(workbook, 'kanji_batch_upload_template.xlsx')
  }

  // Handle Excel / CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws)

        if (!data || data.length === 0) {
          alert('Excel file is empty or has no readable rows')
          return
        }

        const items: BatchItem[] = data
          .map((row, idx) => {
            const charKey =
              Object.keys(row).find((k) => /char|kanji|字/i.test(k.trim())) ||
              Object.keys(row)[0]

            const charVal = String(row[charKey] || '').trim()

            const jlptVal = String(
              row['JLPT'] || row['Level'] || row['jlpt'] || ''
            )
              .toUpperCase()
              .trim()
            const matchedLevel =
              levels.find((l) => l.code?.toUpperCase() === jlptVal) ||
              levels.find((l) => l.id === defaultLevelId) ||
              levels[0]

            const onyomiKey = Object.keys(row).find((k) => /onyomi|on|音/i.test(k))
            const kunyomiKey = Object.keys(row).find((k) => /kunyomi|kun|訓/i.test(k))
            const mmKey = Object.keys(row).find((k) => /meaning.*mm|myanmar|mm/i.test(k))
            const enKey = Object.keys(row).find((k) => /meaning.*en|english|en/i.test(k))

            return {
              id: `excel_${idx}_${charVal}`,
              character: charVal,
              jlptLevelId: matchedLevel?.id || defaultLevelId,
              jlptLevelCode: matchedLevel?.code || 'N5',
              onyomi: onyomiKey ? String(row[onyomiKey] || '').trim() : '',
              kunyomi: kunyomiKey ? String(row[kunyomiKey] || '').trim() : '',
              meaningMm: mmKey ? String(row[mmKey] || '').trim() : '',
              meaningEn: enKey ? String(row[enKey] || '').trim() : '',
              strokeCount: 0,
              strokeOrderJson: { strokes: [] },
              status: 'pending' as const,
            }
          })
          .filter((item) => item.character.length > 0)

        if (items.length === 0) {
          alert('No valid Kanji characters found in Excel file')
          return
        }

        processBatchDetection(items)
      } catch (err) {
        console.error('Excel parse error:', err)
        alert('Error parsing Excel file')
      }
    }
    reader.readAsBinaryString(file)
  }

  // Parse Textbox or TSV/CSV Copy-Paste
  const handleStartTextDetection = async () => {
    if (!rawText.trim()) {
      alert('Please enter text or upload an Excel file')
      return
    }

    const selectedLevel = levels.find((l) => l.id === defaultLevelId) || levels[0]

    // Check if input is TSV / CSV (lines containing tabs or commas)
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0)

    const initialItems: BatchItem[] = []

    lines.forEach((line, idx) => {
      const parts = line.split(/[\t,]/).map((p) => p.trim())
      if (parts.length > 1) {
        // Multi-column line: Character [0], Onyomi [1], Kunyomi [2], MeaningMm [3], MeaningEn [4]
        const charVal = parts[0]
        if (charVal) {
          initialItems.push({
            id: `text_${idx}_${charVal}`,
            character: charVal,
            jlptLevelId: defaultLevelId,
            jlptLevelCode: selectedLevel?.code || 'N5',
            onyomi: parts[1] || '',
            kunyomi: parts[2] || '',
            meaningMm: parts[3] || '',
            meaningEn: parts[4] || '',
            strokeCount: 0,
            strokeOrderJson: { strokes: [] },
            status: 'pending',
          })
        }
      } else {
        // Plain characters
        const chars = Array.from(parts[0])
        chars.forEach((c, cIdx) => {
          if (c.trim()) {
            initialItems.push({
              id: `text_${idx}_${cIdx}_${c}`,
              character: c,
              jlptLevelId: defaultLevelId,
              jlptLevelCode: selectedLevel?.code || 'N5',
              onyomi: '',
              kunyomi: '',
              meaningMm: '',
              meaningEn: '',
              strokeCount: 0,
              strokeOrderJson: { strokes: [] },
              status: 'pending',
            })
          }
        })
      }
    })

    if (initialItems.length === 0) {
      alert('No valid characters found in text')
      return
    }

    processBatchDetection(initialItems)
  }

  // Core Parallel Auto-Detection Runner
  const processBatchDetection = async (items: BatchItem[]) => {
    if (items.length > 100) {
      alert('Batch size limit is 100 characters per batch. Truncating to first 100.')
      items = items.slice(0, 100)
    }

    setBatchItems(items)
    setStep('confirm')
    setProcessing(true)

    const detected = await Promise.all(
      items.map(async (item) => {
        const vgRes = await fetchKanjiVgData(item.character)
        if (vgRes && vgRes.strokeCount > 0) {
          return {
            ...item,
            strokeCount: vgRes.strokeCount,
            strokeOrderJson: vgRes.strokeOrderJson,
            status: 'success' as const,
          }
        }
        return {
          ...item,
          status: 'unrecognized' as const,
        }
      })
    )

    setBatchItems(detected)
    setProcessing(false)
  }

  const handleRetrySingle = async (itemId: string) => {
    const item = batchItems.find((b) => b.id === itemId)
    if (!item) return

    setBatchItems((prev) =>
      prev.map((b) => (b.id === itemId ? { ...b, status: 'pending' } : b))
    )

    const vgRes = await fetchKanjiVgData(item.character)
    setBatchItems((prev) =>
      prev.map((b) => {
        if (b.id !== itemId) return b
        if (vgRes && vgRes.strokeCount > 0) {
          return {
            ...b,
            strokeCount: vgRes.strokeCount,
            strokeOrderJson: vgRes.strokeOrderJson,
            status: 'success',
          }
        }
        return { ...b, status: 'unrecognized' }
      })
    )
  }

  const handleRowChange = (itemId: string, field: keyof BatchItem, value: any) => {
    setBatchItems((prev) =>
      prev.map((b) => {
        if (b.id !== itemId) return b
        if (field === 'jlptLevelId') {
          const matchedLevel = levels.find((l) => l.id === Number(value))
          return {
            ...b,
            jlptLevelId: Number(value),
            jlptLevelCode: matchedLevel?.code || 'N5',
          }
        }
        return { ...b, [field]: value }
      })
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setBatchItems((prev) => prev.filter((b) => b.id !== itemId))
  }

  const handleSaveBatchToDb = async () => {
    if (batchItems.length === 0) {
      alert('No items in batch to save')
      return
    }

    setSaving(true)
    try {
      const payloads: CreateKanjiPayload[] = batchItems.map((b) => ({
        character: b.character,
        jlptLevelId: b.jlptLevelId,
        meaningMm: b.meaningMm.trim() || undefined,
        meaningEn: b.meaningEn.trim() || undefined,
        onyomi: b.onyomi.trim() || undefined,
        kunyomi: b.kunyomi.trim() || undefined,
        strokeCount: b.strokeCount,
        strokeOrderJson: b.strokeOrderJson,
      }))

      await kanjiService.createBatch(payloads)
      alert(`Successfully saved ${payloads.length} Kanji entries to database!`)
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed batch save:', err)
      alert('Error saving batch to database')
    } finally {
      setSaving(false)
    }
  }

  const successCount = batchItems.filter((b) => b.status === 'success').length
  const unrecognizedCount = batchItems.filter((b) => b.status === 'unrecognized').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">📊 Excel & Batch Kanji Upload</h3>
            <p className="text-xs text-subtle">
              Upload Excel (.xlsx / .csv) or paste multi-column Kanji data with readings & Myanmar meanings
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Input & Excel Drop */}
        {step === 'input' && (
          <div className="space-y-4">
            {/* Top Toolbar: Template Download & File Upload */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sky-50/80 p-4 border border-sky-200">
              <div className="space-y-1">
                <div className="text-xs font-bold text-sky-900">
                  📁 Excel (.xlsx / .csv) Upload
                </div>
                <div className="text-[11px] text-sky-700">
                  Upload file with columns: <b>Character, Onyomi, Kunyomi, Meaning (MM), Meaning (EN), JLPT</b>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-sky-800 border border-sky-300 hover:bg-sky-100 shadow-sm"
                >
                  📥 Download Sample Excel Template (.xlsx)
                </button>

                <label className="cursor-pointer rounded-xl bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800 shadow">
                  📂 Choose Excel File
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="relative border-t my-2 text-center text-xs text-gray-400">
              <span className="bg-white px-2 relative -top-2">OR PASTE DIRECTLY BELOW</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <label className="mb-1 block text-xs font-bold text-gray-700">
                  Default JLPT Level
                </label>
                <select
                  value={defaultLevelId}
                  onChange={(e) => setDefaultLevelId(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs font-semibold"
                >
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.code} - {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-xs font-bold text-gray-700">
                  Paste Kanji List or TSV/CSV Rows (Copy-pasted from Excel)
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste characters (e.g. 水, 木, 山) or Excel rows (Character [tab] Onyomi [tab] Kunyomi [tab] Myanmar [tab] English)..."
                  rows={5}
                  className="w-full rounded-2xl border border-gray-300 bg-gray-50/50 p-4 text-xs font-mono text-gray-900 placeholder:font-sans placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleStartTextDetection}>
                🚀 Process & Auto-Detect Strokes
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation & Editable Data Grid */}
        {step === 'confirm' && (
          <div className="space-y-4">
            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gray-100 p-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">Total Items: {batchItems.length}</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                  🟢 Ready: {successCount}
                </span>
                {unrecognizedCount > 0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800">
                    🟡 Unrecognized Strokes: {unrecognizedCount}
                  </span>
                )}
              </div>

              <button
                onClick={() => setStep('input')}
                className="text-xs font-bold text-sky-700 hover:underline"
              >
                ← Back to Input / File Upload
              </button>
            </div>

            {processing && (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center text-xs font-bold text-sky-800">
                ⚡ Auto-detecting stroke order matrices for {batchItems.length} Kanji in parallel...
              </div>
            )}

            {/* Editable Grid Table */}
            <div className="max-h-[420px] overflow-x-auto overflow-y-auto rounded-2xl border bg-white shadow-inner">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-gray-100 border-b font-bold text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 w-16">Kanji</th>
                    <th className="p-2.5 w-24">JLPT</th>
                    <th className="p-2.5">On'yomi (音)</th>
                    <th className="p-2.5">Kun'yomi (訓)</th>
                    <th className="p-2.5">Meaning (MM)</th>
                    <th className="p-2.5">Meaning (EN)</th>
                    <th className="p-2.5 w-32">Strokes</th>
                    <th className="p-2.5 text-right w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {batchItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80">
                      {/* Character */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.character}
                          onChange={(e) => handleRowChange(item.id, 'character', e.target.value)}
                          className="w-12 text-center text-lg font-bold rounded-lg border bg-white p-1"
                        />
                      </td>

                      {/* JLPT Level */}
                      <td className="p-2">
                        <select
                          value={item.jlptLevelId}
                          onChange={(e) => handleRowChange(item.id, 'jlptLevelId', e.target.value)}
                          className="w-full text-xs font-semibold rounded-lg border bg-white p-1"
                        >
                          {levels.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.code}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Onyomi */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.onyomi}
                          placeholder="e.g. スイ (optional)"
                          onChange={(e) => handleRowChange(item.id, 'onyomi', e.target.value)}
                          className="w-full text-xs rounded-lg border bg-white p-1"
                        />
                      </td>

                      {/* Kunyomi */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.kunyomi}
                          placeholder="e.g. みず (optional)"
                          onChange={(e) => handleRowChange(item.id, 'kunyomi', e.target.value)}
                          className="w-full text-xs rounded-lg border bg-white p-1"
                        />
                      </td>

                      {/* Meaning Mm */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.meaningMm}
                          placeholder="e.g. ရေ (optional)"
                          onChange={(e) => handleRowChange(item.id, 'meaningMm', e.target.value)}
                          className="w-full text-xs rounded-lg border bg-white p-1"
                        />
                      </td>

                      {/* Meaning En */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.meaningEn}
                          placeholder="e.g. water (optional)"
                          onChange={(e) => handleRowChange(item.id, 'meaningEn', e.target.value)}
                          className="w-full text-xs rounded-lg border bg-white p-1"
                        />
                      </td>

                      {/* Stroke status & canvas edit */}
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          {item.status === 'success' ? (
                            <span className="font-bold text-emerald-700 text-[11px]">
                              🟢 {item.strokeCount} strokes
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRetrySingle(item.id)}
                              className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 hover:bg-amber-200"
                            >
                              🔄 Retry
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setFixingItem(item)}
                            className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-700 hover:bg-gray-200"
                          >
                            ✏️ Draw
                          </button>
                        </div>
                      </td>

                      {/* Remove */}
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="rounded p-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Confirm Save Footer */}
            <div className="flex items-center justify-between border-t pt-4">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveBatchToDb}
                disabled={saving || processing || batchItems.length === 0}
              >
                {saving
                  ? 'Saving Batch to Database...'
                  : `💾 Confirm & Save All (${batchItems.length} Kanji)`}
              </Button>
            </div>
          </div>
        )}

        {/* Canvas Record Drawer for unrecognized items */}
        {fixingItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-3 flex items-center justify-between border-b pb-2">
                <h4 className="text-base font-bold text-gray-900">
                  Draw Strokes for '{fixingItem.character}'
                </h4>
                <button
                  onClick={() => setFixingItem(null)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-2xl border bg-gray-50 p-3 flex flex-col items-center">
                  <div className="mb-1 text-[11px] font-bold text-gray-700">
                    🔴 Drag mouse/finger over character to record stroke order
                  </div>
                  <KanjiPreviewCanvas
                    character={fixingItem.character}
                    strokes={fixingItem.strokeOrderJson?.strokes || []}
                    mode="record"
                    onStrokeRecorded={(pts) => {
                      const existing = fixingItem.strokeOrderJson?.strokes || []
                      const updated = [...existing, pts]
                      const next = {
                        ...fixingItem,
                        strokeCount: updated.length,
                        strokeOrderJson: { strokes: updated },
                        status: 'success' as const,
                      }
                      setFixingItem(next)
                      setBatchItems((prev) => prev.map((b) => (b.id === next.id ? next : b)))
                    }}
                    onClearStrokes={() => {
                      const next = {
                        ...fixingItem,
                        strokeCount: 0,
                        strokeOrderJson: { strokes: [] },
                        status: 'unrecognized' as const,
                      }
                      setFixingItem(next)
                      setBatchItems((prev) => prev.map((b) => (b.id === next.id ? next : b)))
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button onClick={() => setFixingItem(null)}>Done</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
