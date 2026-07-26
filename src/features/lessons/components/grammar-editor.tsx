import { Field, FieldRow } from '@/components/common/field'
import { ItemCard, ItemHead } from '@/components/common/item-card'
import { DashedButton } from '@/components/ui/dashed-button'
import { Input } from '@/components/ui/input'
import { AudioSourceField } from '@/features/lessons/components/audio-source-field'

export interface GrammarExampleDraft {
  key: string
  japaneseText: string
  mmTranslation: string
  audioUrl: string | null
}

export interface GrammarDraft {
  key: string
  pattern: string
  mmDescription: string
  enDescription: string
  examples: GrammarExampleDraft[]
}

interface GrammarEditorProps {
  items: GrammarDraft[]
  onChange: (items: GrammarDraft[]) => void
}

function newKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function GrammarEditor({ items, onChange }: GrammarEditorProps) {
  const update = (index: number, patch: Partial<GrammarDraft>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const updateExample = (
    grammarIndex: number,
    exampleIndex: number,
    patch: Partial<GrammarExampleDraft>,
  ) => {
    const grammar = items[grammarIndex]
    update(grammarIndex, {
      examples: grammar.examples.map((ex, i) => (i === exampleIndex ? { ...ex, ...patch } : ex)),
    })
  }

  return (
    <div>
      {items.map((item, index) => (
        <ItemCard key={item.key}>
          <ItemHead label={`Grammar item ${index + 1}`}>
            <button
              type="button"
              className="cursor-pointer text-destructive"
              aria-label={`Remove grammar ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              ✕
            </button>
          </ItemHead>
          <FieldRow>
            <Field label="Pattern">
              <Input
                value={item.pattern}
                onChange={(e) => update(index, { pattern: e.target.value })}
              />
            </Field>
            <Field label="Myanmar meaning">
              <Input
                value={item.mmDescription}
                onChange={(e) => update(index, { mmDescription: e.target.value })}
              />
            </Field>
          </FieldRow>
          <Field label="English meaning" className="mt-[10px]">
            <Input
              value={item.enDescription}
              onChange={(e) => update(index, { enDescription: e.target.value })}
            />
          </Field>

          <div className="mt-[14px]">
            <div className="mb-[8px] text-[11px] font-semibold uppercase tracking-wide text-subtle">
              Examples
            </div>
            <div className="overflow-x-auto rounded-[10px] border border-border">
              <table className="w-full min-w-[640px] border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] text-subtle">
                    <th className="px-[10px] py-[8px] font-semibold">Japanese</th>
                    <th className="px-[10px] py-[8px] font-semibold">Myanmar translation</th>
                    <th className="px-[10px] py-[8px] font-semibold">Audio</th>
                    <th className="w-[40px] px-[10px] py-[8px]" />
                  </tr>
                </thead>
                <tbody>
                  {item.examples.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-[10px] py-[14px] text-center text-subtle">
                        No examples yet — add rows that match the mobile grammar cards.
                      </td>
                    </tr>
                  ) : (
                    item.examples.map((ex, ei) => (
                      <tr key={ex.key} className="border-b border-border last:border-b-0 align-top">
                        <td className="px-[10px] py-[10px]">
                          <Input
                            value={ex.japaneseText}
                            placeholder="わたしは ミンミンです。"
                            onChange={(e) =>
                              updateExample(index, ei, { japaneseText: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-[10px] py-[10px]">
                          <Input
                            value={ex.mmTranslation}
                            placeholder="ကျွန်မက Min Min ပါ။"
                            onChange={(e) =>
                              updateExample(index, ei, { mmTranslation: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-[10px] py-[10px]">
                          <AudioSourceField
                            hideLabel
                            speakText={ex.japaneseText}
                            audioUrl={ex.audioUrl}
                            onChange={(audioUrl) => updateExample(index, ei, { audioUrl })}
                          />
                        </td>
                        <td className="px-[10px] py-[10px] text-center">
                          <button
                            type="button"
                            className="cursor-pointer text-destructive"
                            aria-label={`Remove example ${ei + 1}`}
                            onClick={() =>
                              update(index, {
                                examples: item.examples.filter((_, i) => i !== ei),
                              })
                            }
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <DashedButton
              type="button"
              className="mt-[10px]"
              onClick={() =>
                update(index, {
                  examples: [
                    ...item.examples,
                    {
                      key: newKey('ge'),
                      japaneseText: '',
                      mmTranslation: '',
                      audioUrl: null,
                    },
                  ],
                })
              }
            >
              ＋ Add example
            </DashedButton>
          </div>
        </ItemCard>
      ))}
      <DashedButton
        type="button"
        onClick={() =>
          onChange([
            ...items,
            {
              key: newKey('g'),
              pattern: '',
              mmDescription: '',
              enDescription: '',
              examples: [],
            },
          ])
        }
      >
        ＋ Add grammar item
      </DashedButton>
    </div>
  )
}
