import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const workbook = xlsx.utils.book_new();

const headers = [
  "Category Code (VOCAB, GRAMMAR, READING, LISTENING)",
  "Mondai Title",
  "Passage",
  "Sentence Structure",
  "Prompt",
  "Choice 1",
  "Choice 2",
  "Choice 3",
  "Choice 4",
  "Correct Choice (1, 2, 3, or 4)",
  "Transcript",
  "Furigana",
  "Translation (MM)",
  "Translation (EN)",
  "Explanation (MM)",
  "Explanation (EN)"
];

const data = [
  headers,
  ["VOCAB", "もんだい１", "", "", "わたしは___です。", "がくせい", "せんせい", "いしゃ", "かいしゃいん", 1, "", "わたしは___です。", "ကျွန်တော်က ကျောင်းသားပါ။", "I am a student.", "", ""],
  ["GRAMMAR", "もんだい２", "", "Noun + です", "これ___ほんです。", "は", "が", "を", "に", 1, "", "これ___ほんです。", "ဒါက စာအုပ်ဖြစ်ပါတယ်။", "This is a book.", "", ""],
  ["READING", "もんだい３", "あしたはあめです。", "", "あしたのてんきは？", "あめ", "はれ", "くもり", "ゆき", 1, "", "", "မနက်ဖြန် မိုးရွာမည်။", "It will rain tomorrow.", "", ""],
  ["LISTENING", "もんだい４", "", "", "（Audio playing）男の人と女の人が話しています...", "A", "B", "C", "D", 1, "男：こんにちは。\n女：こんにちは。", "", "", "Man: Hello.\nWoman: Hello.", "", ""]
];

const worksheet = xlsx.utils.aoa_to_sheet(data);

// set column widths
const wscols = headers.map(() => ({ wch: 25 }));
worksheet['!cols'] = wscols;

xlsx.utils.book_append_sheet(workbook, worksheet, "Questions");

const outPath = path.resolve('./public/exam_questions_sample.xlsx');
xlsx.writeFile(workbook, outPath);

console.log(`Generated sample excel at: ${outPath}`);
