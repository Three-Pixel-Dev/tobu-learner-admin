# Changelog — Tobu Learner

Notable changes on **`dev-alvin`** relative to **`dev`** across Admin, Server, and Mobile  
(compared via `origin/dev..HEAD` in each repo).

## [Unreleased] — 2026-07-26

### Admin (`tobu-learner-admin`)

#### Added
- **JLPT levels — Featured** — `is_hot` / Featured column with toggle + confirm dialog (Featured / Normal); only one level can be featured at a time (server enforces)
- **JLPT levels — Myanmar name** — create/edit forms and table show `nameMm` under the English name

#### Changed
- **Activation codes** — generate flow moved into a **FormDialog** modal (＋ Generate); cleaner list page layout

---

### Server (`tobu-learner-server`)

#### Added
- **JLPT level `is_hot`** — column + DTO; `PUT /api/jlpt-levels/{id}/hot`; seeder marks **N4** featured by default; setting hot clears other levels
- **JLPT `nameMm`** — entity / create / update / list DTO + seeder Myanmar labels + backfill
- **Learner catalog** — `GET /api/jlpt-levels/catalog` (enabled levels; auth required)
- **Level detail** — `GET /api/jlpt-levels/{code}/detail` (localized activation-card copy; no subtitle)
- **Activate / redeem** — `POST /api/jlpt-levels/{code}/activate`
  - Redeems admin **activation codes** from DB (unused, not expired, must include that level)
  - Bundle codes (e.g. N4+N5): same learner can reuse a code they already redeemed for another covered level
  - Demo fallback still accepts exact `TOBU-{level}`
- **App content** — public `GET /api/content/**` for learner Terms (and similar pages)

#### Changed
- **Security** — catalog/detail/activate require authentication (not `permitAll`)

---

### Mobile (`tobu-learner`)

#### Added
- **Auth flow** — real login / signup (OTP) / forgot-reset wired to `/api/auth/*`; Bearer + refresh; remember-me tokens; in-tab AuthFlow (NativeTabs-safe)
- **API client** — shared `apiRequest`, health gate → service-unavailable screen
- **Terms** — from `GET /api/content/TERMS_CONDITIONS`
- **JLPT catalog** — level list from `GET /api/jlpt-levels/catalog`; gold ring = **featured only**
- **Level detail** — activation card UI (copy from detail API); unlock via activate API
- **Learn home (mock)** — post-unlock mock lessons / kana / skills (from `tobu-mobile.jsx` style data)
- **i18n / fonts** — full Myanmar copy; Fredoka / Inter / Padauk; language switcher on auth & home

#### Changed
- **Home** — level select → detail → learn as in-panel steps (avoids NativeTabs dropping route pushes)
- **Explore** — mock skill stubs

#### Fixed
- **Detail fetch loop** — no longer re-calls `/detail` endlessly after `setLevel`
- **Activate errors** — show server messages (used / expired / wrong level) instead of always “invalid”
- **Bundle activate** — same user can unlock N4 after already redeeming an N4+N5 code for N5
