export const EXAM_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

export interface ExamChoice {
  value: string
  correct?: boolean
}

export interface ExamQuestion {
  label: string
  audioFile: string
  audioLength: string
  prompt: string
  choices: ExamChoice[]
}

export const EXAM_QUESTION: ExamQuestion = {
  label: 'Question 7 ・ Listening',
  audioFile: 'weather_q7.mp3',
  audioLength: '0:08',
  prompt: 'あしたの てんきは どうですか。',
  choices: [
    { value: 'はれ です', correct: true },
    { value: 'あめ です' },
    { value: 'ゆき です' },
    { value: 'くもり です' },
  ],
}

export const EXAM_META = {
  duration: '45 minutes',
  score: '100 points',
}
