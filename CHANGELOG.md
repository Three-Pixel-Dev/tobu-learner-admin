# Changelog — Admin

All notable changes on `dev-alvin` relative to `dev`.

## [Unreleased] — 2026-07-26

### Added
- **Lessons module** — level switcher list, detail, and editor wired to `/api/lessons` (create, content save, publish, duplicate, soft-disable/restore)
- **Kana & Kanji page** — Hiragana/Katakana tile grids wired to `/api/kana` (list, create, update, soft-disable, restore); add/edit side drawer with browser TTS preview; Kanji tab unchanged
- **JLPT levels — Featured** — `is_hot` / Featured column with toggle + confirm dialog (Featured / Normal); only one level featured at a time
- **JLPT levels — Myanmar name** — create/edit forms and table show `nameMm` under the English name

### Changed
- **Activation codes** — generate flow moved into a FormDialog modal (＋ Generate)
- **Sidebar** — Activation codes nav item removed (route still available at `/codes`)
