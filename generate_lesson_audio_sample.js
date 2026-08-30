import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

// Minimal silent MP3 frame
const SILENT_MP3_FRAME = Buffer.concat([
  Buffer.from([0xff, 0xf3, 0x44, 0xc4]),
  Buffer.alloc(414, 0),
])
const DUMMY_AUDIO = Buffer.concat([
  SILENT_MP3_FRAME,
  SILENT_MP3_FRAME,
  SILENT_MP3_FRAME,
  SILENT_MP3_FRAME,
  SILENT_MP3_FRAME,
])

const CRC_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC_TABLE[i] = c
}

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xff]
  }
  return (c ^ -1) >>> 0
}

function createZipBuffer(files) {
  const localHeaders = []
  const centralHeaders = []
  let offset = 0

  for (const [filename, content] of Object.entries(files)) {
    const filenameBuf = Buffer.from(filename, 'utf-8')
    const contentBuf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8')
    const crc = crc32(contentBuf)
    const compressed = zlib.deflateRawSync(contentBuf)

    const lh = Buffer.alloc(30 + filenameBuf.length)
    lh.writeUInt32LE(0x04034b50, 0)
    lh.writeUInt16LE(20, 4)
    lh.writeUInt16LE(0, 6)
    lh.writeUInt16LE(8, 8)
    lh.writeUInt16LE(0, 10)
    lh.writeUInt16LE(0, 12)
    lh.writeUInt32LE(crc, 14)
    lh.writeUInt32LE(compressed.length, 18)
    lh.writeUInt32LE(contentBuf.length, 22)
    lh.writeUInt16LE(filenameBuf.length, 26)
    lh.writeUInt16LE(0, 28)
    filenameBuf.copy(lh, 30)

    const ch = Buffer.alloc(46 + filenameBuf.length)
    ch.writeUInt32LE(0x02014b50, 0)
    ch.writeUInt16LE(20, 4)
    ch.writeUInt16LE(20, 6)
    ch.writeUInt16LE(0, 8)
    ch.writeUInt16LE(8, 10)
    ch.writeUInt16LE(0, 12)
    ch.writeUInt16LE(0, 14)
    ch.writeUInt32LE(crc, 16)
    ch.writeUInt32LE(compressed.length, 20)
    ch.writeUInt32LE(contentBuf.length, 24)
    ch.writeUInt16LE(filenameBuf.length, 28)
    ch.writeUInt16LE(0, 30)
    ch.writeUInt16LE(0, 32)
    ch.writeUInt16LE(0, 34)
    ch.writeUInt16LE(0, 36)
    ch.writeUInt32LE(0, 38)
    ch.writeUInt32LE(offset, 42)
    filenameBuf.copy(ch, 46)

    localHeaders.push(lh, compressed)
    centralHeaders.push(ch)

    offset += lh.length + compressed.length
  }

  const centralOffset = offset
  let centralSize = 0
  for (const ch of centralHeaders) {
    centralSize += ch.length
  }

  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(centralHeaders.length, 8)
  eocd.writeUInt16LE(centralHeaders.length, 10)
  eocd.writeUInt32LE(centralSize, 12)
  eocd.writeUInt32LE(centralOffset, 16)
  eocd.writeUInt16LE(0, 20)

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd])
}

const filesToPack = {
  'n5_l01_v01.mp3': DUMMY_AUDIO,
  'n5_l01_v02.mp3': DUMMY_AUDIO,
  'n5_l02_v01.mp3': DUMMY_AUDIO,
  'n5_l01_ge01.mp3': DUMMY_AUDIO,
  'n5_l01_q01.mp3': DUMMY_AUDIO,
  'README_MATCHING_GUIDE.txt': `TOBU LESSON AUDIO ZIP MATCHING GUIDE
====================================

How to name your audio files in the ZIP:

1. MATCH BY AUDIO FILENAME (RECOMMENDED):
   - Set the 'Audio Filename' column in your Excel sheet (e.g. 'n5_l01_v01.mp3').
   - Name your MP3 file in the ZIP archive: 'n5_l01_v01.mp3'.
   - Works for both Vocab and Quiz questions!

2. FALLBACK MATCHING (BY PROMPT / WORD):
   - If 'Audio Filename' in Excel is empty, the system can match by Japanese Word (e.g., 'こんにちは.mp3')
     or Quiz Question ID / prompt text.

Supported Audio Formats: .mp3, .wav, .m4a, .ogg, .aac, .webm
`,
}

const outDir = path.resolve('./public')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}
const zipPath = path.join(outDir, 'lessons_audio_sample.zip')
const zipBuf = createZipBuffer(filesToPack)
fs.writeFileSync(zipPath, zipBuf)

console.log(`Successfully generated sample audio ZIP (Node.js) at: ${zipPath}`)
