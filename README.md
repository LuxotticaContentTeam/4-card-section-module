# 4 Card Section Module

Cross-brand landing page module: a **four-card section** that shows the cards
side by side on desktop and turns into a **horizontally scrollable carousel on
mobile**.

The name is deliberately generic — the module is the layout, not a campaign.
First shipped for the SGH Aperol landing page, but nothing in it is tied to that
campaign beyond the copy and the photos, which live per brand.

The carousel is **pure CSS scroll-snap** — no Swiper, no carousel library, no
JavaScript driving the scroll.

The markup is shared by every brand; only the design tokens, the copy and the
photos change per brand. SGH is the first variant to ship.

Design: Figma `SGH - RB META APEROL`, node `410-8852`.

Built on `dev-boilerplate-modules`. This repository is independent from it: no
shared remote, no shared history.

## Requirements

- Node.js >= 20
- Gulp 4 CLI

## Commands

| Command | What it does |
| --- | --- |
| `npm ci` | Install the exact locked dependencies. Use this over `npm install`: it is what CI runs. |
| `npm run dev` / `npm run serve` | Prompts for language and variant, then serves on <http://localhost:347> with BrowserSync. |
| `npm run build` | Production build into `dist/`; optionally creates a versioned `release/`. |
| `npm run new` | Scaffold an additional brand variant. |
| `npm run remove` | Delete a variant. |
| `npm run proxy` | CORS-Anywhere proxy for local API calls. |

### Running without the prompts

`dev` and `build` normally ask for the language and the variant. Set `VARIANT`
and the questions are skipped — this is what makes the build usable in CI, where
there is no terminal to answer them:

```bash
VARIANT=SGH npm run build              # one brand
VARIANT=SGH RELEASE=yes npm run build  # and write release/SGH/<version>/
```

| Variable | |
| --- | --- |
| `VARIANT` | Required to skip the prompt. Must exist in `projectConfig.json` > `variants`; an unknown value fails the build instead of silently building the wrong brand. |
| `LANGUAGE` | Optional, defaults to the first entry of `projectConfig.json` > `langs`. |
| `RELEASE` | Optional, `yes`/`true`/`1` to also produce `release/<VARIANT>/<version>/`. |

Building several brands means running the build once per variant — the pipeline
handles one variant per run by design, and wipes `dist/` between runs. Only
`release/` keeps them side by side.

## Adding a brand

```bash
npm run new
```

It asks for the brand code, an optional variant suffix, and which existing
variant to copy from.

**Prefer copying from a brand that already ships** (SGH today) rather than
`Default`: you inherit real design tokens and real JSON content to edit down,
instead of placeholders. Either way the scaffolding creates
`src/{js,scss,json}/variants/<BRAND>/` and `src/views/main/<BRAND>/`, and adds
the variant to `projectConfig.json`.

What it does **not** create, and you have to add by hand:

- `src/static/images/<BRAND>/` — the brand's photos
- `src/static/fonts/<BRAND>/` — only if the brand needs dev-only webfonts, wired
  up in `src/scss/utils/_local.scss`

Then edit `src/scss/variants/<BRAND>/_variables.scss` (design tokens) and
`src/json/variants/<BRAND>/json.js` (copy and image file names).

⚠️ `src/scss/variants/<BRAND>/main.scss` must keep its
`@import "../../components/main-features"`. The markup is shared, the styling is
not: without that import the cards render unstyled and **nothing warns you** —
Sass compiles happily. The scaffolding templates already include it.

## Configuration

`projectConfig.json`

| Key | Value | Notes |
| --- | --- | --- |
| `projectName` | `4-card-section-module` | Drives the container id `#ct_cm--4-card-section-module` and the config object `ct_cm__4CardSectionModuleConfig`. Brand-neutral on purpose: every variant shares them. |
| `langs` | `["en-us"]` | Offered by the `serve` prompt. |
| `variants` | `["SGH"]` | Brand code is the part before the first `_`. |

Asset paths live in `package.json` > `projectConfigurations.paths`.

## Where things are

```
src/
  views/main/main.pug                            module container + the four-card markup,
                                                 shared by every brand
  views/main/<BRAND>/main.pug                    brand-specific markup, if any
  views/main/<BRAND>/live/live.html              Akamai asset paths for release
  scss/components/_main-features.scss            layout + mobile carousel, shared
  scss/variants/<BRAND>/_variables.scss          design tokens, per brand
  scss/variants/<BRAND>/main.scss                imports the shared component
  js/contents.js                                 fills the cards from JSON, entry animation
  js/variants/<BRAND>/                           variant main / info_store
  json/variants/<BRAND>/json.js                  copy and image names, per locale
  static/images/<BRAND>/                         photos, namespaced per brand
  static/fonts/<BRAND>/                          dev-only webfonts
```

Brand-named folders under `static/` are filtered at build time
(`tasks/staticAsset.task.js`): a build of one brand does not ship another
brand's images or fonts.

## How content flows

The markup is a **static skeleton**: four empty cards, shared across brands. At
runtime `src/js/contents.js` reads `window.ct_cm__4CardSectionModuleConfig` and
fills titles, descriptions, optional disclaimers and images, resolving each
string for the current locale through `getTrad()`.

`image` in the JSON is a path relative to the environment image path, so it
carries the brand folder: `"SGH/feature-01-capture.jpg"`.

The shared `main.pug` receives pug locals; variant files are rendered by
`tasks/views.task.js` via `pug.renderFile(..., { include })` and get **none** —
so anything needing `bannerName` or `crossoriginAttr` belongs in the shared file.

Cards fade and rise into view once, staggered, when the section first enters the
viewport (`IntersectionObserver` in `contents.js` toggles `.is-visible`; the CSS
does the rest, and respects `prefers-reduced-motion`).

## Design source

| | Figma node | Card |
| --- | --- | --- |
| Desktop (1440) | `410:8852` | 334x600, four equal columns |
| Mobile (375) | `410:10431` | 320x600, carousel |

Past 1440 the section stops growing and centres. The cards have a fixed 600px
height, so letting them widen would make `object-fit: cover` crop the photos
vertically — the models' heads go first.

The card copy is anchored 450px (desktop) / 430px (mobile) from the card top,
not to its bottom edge — that is what keeps the four titles on one line
regardless of how long each description runs.

Card images are 668x1200, twice the desktop card and the same aspect ratio, so
`cover` crops essentially nothing at the design width.

## Open items

- **Akamai paths** — `productionImage` / `productionConf` in `package.json` and
  the `[PATH]` / `[VERSION]` placeholders in
  `src/views/main/<BRAND>/live/live.html`. Search for `TODO_AKAMAI`.
- **Per-brand deploy** — the workflows build and deploy one brand per run, chosen
  from the `workflow_dispatch` input. Fanning out to every variant at once needs
  the Akamai destination layout per brand confirmed first; see the note above the
  deploy step in `.github/workflows/deploy-*.yml`.
- **Localisation** — only `en-us` copy is in `src/json/variants/SGH/json.js`.
  Note the "Hey Meta, ..." prompt bubble is baked into each photo, so it will
  not translate with the copy; localised markets need localised artwork.
- **Tablet (768-1024px)** — the design covers 1440 and 375 only. This range
  currently gets the mobile carousel with the same 320px cards.
- **Card border** — in Figma the second card has a solid white border while the
  other three are `rgba(255,255,255,0.4)`. Treated here as a design slip: all
  four use the 40% border.
- **Copy** — Figma reads "Capture every moment hands-free ." (stray space) and
  the mobile frame capitalises "Open-Ear audio" where desktop has "Open-ear
  audio". Both normalised here; revert if intentional.
- **Images are not compressed** — `tasks/images.task.js` runs imagemin over
  `src/images/`, a folder this project does not use; everything under
  `src/static/` is copied verbatim. Upstream boilerplate gap.
