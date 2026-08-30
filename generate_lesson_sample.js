import xlsx from 'xlsx'
import path from 'path'

const workbook = xlsx.utils.book_new()

const lessons = [
  ['Lesson ID', 'Title', 'Published'],
  ['N5-L01', 'Lesson 1 ・ あいさつ', 'FALSE'],
  ['N5-L02', 'Lesson 2 ・ かぞく', 'FALSE'],
]

const vocab = [
  ['Lesson ID', 'Word', 'Meaning MM', 'Meaning EN', 'Reading', 'Audio Filename'],
  ['N5-L01', 'こんにちは', 'မင်္ဂလာပါ', 'Hello', 'こんにちは', 'n5_l01_v01.mp3'],
  ['N5-L01', 'ありがとう', 'ကျေးဇူးတင်ပါတယ်', 'Thank you', 'ありがとう', 'n5_l01_v02.mp3'],
  ['N5-L02', 'おかあさん', 'အမေ', 'Mother', 'おかあさん', 'n5_l02_v01.mp3'],
]

const grammar = [
  ['Lesson ID', 'Pattern', 'Description MM', 'Description EN'],
  ['N5-L01', 'Noun + です', 'နာမ် + です', 'Noun + desu (polite copula)'],
  ['N5-L02', 'わたしの + Noun', 'ကျွန်တော့်ရဲ့ + နာမ်', 'My + noun'],
]

const grammarExamples = [
  ['Lesson ID', 'Pattern', 'Japanese', 'Translation MM', 'Audio Filename'],
  ['N5-L01', 'Noun + です', 'がくせいです。', 'ကျောင်းသားပါ။', 'n5_l01_ge01.mp3'],
  ['N5-L02', 'わたしの + Noun', 'わたしのおかあさんです。', 'ကျွန်တော့်အမေပါ။', 'n5_l02_ge01.mp3'],
]

const quiz = [
  [
    'Lesson ID',
    'Mondai',
    'Prompt',
    'Choice 1',
    'Choice 2',
    'Choice 3',
    'Choice 4',
    'Correct (1-4)',
    'Explain MM',
    'Explain EN',
    'Transcript',
    'Audio Filename',
  ],
  [
    'N5-L01',
    'もんだい１',
    '「Hello」ကို ဂျပန်လို ဘယ်လိုပြောမလဲ။',
    'こんにちは',
    'さようなら',
    'おはよう',
    'ありがとう',
    1,
    'မင်္ဂလာပါ ဆိုသည်မှာ こんにちは ဖြစ်သည်။',
    'Hello is こんにちは.',
    'こんにちは。わたしは たなかです。',
    'n5_l01_q01.mp3',
  ],
  [
    'N5-L02',
    'もんだい１',
    'おかあさん ဆိုသည်မှာ…',
    'Father',
    'Mother',
    'Sister',
    'Brother',
    2,
    'おかあさん = အမေ',
    'おかあさん means mother.',
    '',
    '',
  ],
]

function addSheet(name, rows) {
  const sheet = xlsx.utils.aoa_to_sheet(rows)
  sheet['!cols'] = rows[0].map(() => ({ wch: 28 }))
  xlsx.utils.book_append_sheet(workbook, sheet, name)
}

addSheet('Lessons', lessons)
addSheet('Vocab', vocab)
addSheet('Grammar', grammar)
addSheet('GrammarExamples', grammarExamples)
addSheet('Quiz', quiz)

const outPath = path.resolve('./public/lessons_batch_sample.xlsx')
xlsx.writeFile(workbook, outPath)
console.log(`Generated sample excel at: ${outPath}`)
