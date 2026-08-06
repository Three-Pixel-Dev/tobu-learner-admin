# Changelog — Admin

All notable changes on `dev-alvin` relative to `dev`.

## [Unreleased] — 2026-07-27

### Added
- **Exams module (complete)** — level-scoped bank, detail page, full-page editor with Orthography / Kanji reading / Reading / Listening tabs, create → edit flow
- **Exam preview** — category-aware preview modal (stem markers, reading passage, listening audio player / TTS); Preview on list cards and detail page
- **Listening TTS text** — Browser TTS mode has a dedicated listening-text field; Preview speaks that text (saved as `transcript`)
- **Lesson confirmations** — duplicate lesson uses ConfirmDialog on list and detail (aligned with disable)

### Changed
- **Exams list** — switched to `POST /api/v1/admin/exams/pageable` with infinite scroll (N5 default)
- **Lessons list** — switched to `POST /api/lessons/pageable` with infinite scroll (N5 default)
- **Kanji list** — `POST /api/v1/admin/kanji/pageable` with infinite scroll (24 per page)
- **Exam level switcher** — shows exam counts instead of lesson counts
- **Exam editor UX** — removed crowded drawer; confirm disable via modal; card click opens detail
- **503 recovery** — remember return path, double health probe, suppress bounce-back redirects after recovery
- **AudioSourceField** — optional editable speak-text box when Browser TTS is selected
- **Kanji cards** — border matched to light Kana card style (`border-border`)

### Removed
- **Exam drawer** — replaced by detail page + editor page

## [Unreleased] — 2026-07-26

### Added
- **Lessons module** — level switcher list, detail, and editor wired to `/api/lessons` (create, content save, publish, duplicate, soft-disable/restore)
- **Kana & Kanji page** — Hiragana/Katakana tile grids wired to `/api/kana` (list, create, update, soft-disable, restore); add/edit side drawer with browser TTS preview; Kanji tab unchanged
- **JLPT levels — Featured** — `is_hot` / Featured column with toggle + confirm dialog (Featured / Normal); only one level featured at a time
- **JLPT levels — Myanmar name** — create/edit forms and table show `nameMm` under the English name

### Changed
- **Activation codes** — generate flow moved into a FormDialog modal (＋ Generate)
- **Sidebar** — Activation codes nav item removed (route still available at `/codes`)
