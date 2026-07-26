/**
 * Utility to fetch open-source KanjiVG SVG data and parse path coordinates into stroke point matrices.
 */

export interface KanjiVgImportResult {
  character: string
  unicodeHex: string
  strokeCount: number
  strokeOrderJson: {
    strokes: number[][][]
    svgPaths?: string[]
  }
}

export async function fetchKanjiVgData(char: string): Promise<KanjiVgImportResult | null> {
  if (!char || !char.trim()) return null
  const trimChar = char.trim()
  const codePoint = trimChar.codePointAt(0)
  if (!codePoint) return null

  const hex = codePoint.toString(16).padStart(5, '0')
  const urls = [
    `https://cdn.jsdelivr.net/gh/kanjivg/kanjivg/kanji/${hex}.svg`,
    `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        const svgText = await res.text()
        const parsed = parseCustomSvgString(svgText, trimChar)
        if (parsed && parsed.strokeCount > 0) {
          return parsed
        }
      }
    } catch {
      // try next URL
    }
  }

  return null
}

/**
 * Parses raw SVG string (from SVG upload or paste) into stroke point matrices.
 * Automatically splits combined SVG paths (separated by M/m MoveTo commands) into individual strokes.
 */
export function parseCustomSvgString(svgText: string, character = ''): KanjiVgImportResult | null {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgText, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')

    // Check viewBox size
    let viewBoxSize = 109
    if (svgEl) {
      const viewBox = svgEl.getAttribute('viewBox')
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/).map(Number)
        if (parts.length >= 4 && parts[2] > 0) {
          viewBoxSize = parts[2]
        }
      }
    }

    const paths = Array.from(doc.querySelectorAll('path'))

    const strokePaths: string[] = []
    const strokePointsList: number[][][] = []

    for (const path of paths) {
      const d = path.getAttribute('d')
      if (!d) continue

      // If single path contains multiple subpaths starting with M or m, split into separate strokes
      const subPaths = d.match(/[Mm][^Mm]+/g)
      if (subPaths && subPaths.length > 1) {
        for (const subD of subPaths) {
          strokePaths.push(subD)
          const points = sampleSvgPathPoints(subD, viewBoxSize)
          if (points.length >= 2) {
            strokePointsList.push(points)
          }
        }
      } else {
        strokePaths.push(d)
        const points = sampleSvgPathPoints(d, viewBoxSize)
        if (points.length >= 2) {
          strokePointsList.push(points)
        }
      }
    }

    return {
      character,
      unicodeHex: character ? character.codePointAt(0)?.toString(16) || '' : '',
      strokeCount: strokePointsList.length,
      strokeOrderJson: {
        strokes: strokePointsList,
        svgPaths: strokePaths,
      },
    }
  } catch (err) {
    console.error('Error parsing SVG string:', err)
    return null
  }
}

/**
 * Samples points along an SVG path string and normalizes to 0..100 grid.
 */
function sampleSvgPathPoints(pathData: string, viewBoxSize = 109): number[][] {
  try {
    const svgNs = 'http://www.w3.org/2000/svg'
    const pathEl = document.createElementNS(svgNs, 'path')
    pathEl.setAttribute('d', pathData)

    const totalLen = pathEl.getTotalLength()
    if (!totalLen || isNaN(totalLen) || totalLen <= 0) {
      return []
    }

    const numSamples = Math.max(5, Math.min(30, Math.floor(totalLen / 8)))
    const points: number[][] = []

    for (let i = 0; i <= numSamples; i++) {
      const distance = (i / numSamples) * totalLen
      const pt = pathEl.getPointAtLength(distance)
      const xPct = Math.round((pt.x / viewBoxSize) * 100 * 10) / 10
      const yPct = Math.round((pt.y / viewBoxSize) * 100 * 10) / 10
      points.push([xPct, yPct])
    }

    return points
  } catch {
    return []
  }
}
