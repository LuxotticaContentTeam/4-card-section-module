# SGH Aperol — Main Features

Landing page module for Sunglass Hut (Aperol campaign): a **four-card section**
that shows the cards side by side on desktop and turns into a **horizontally
scrollable carousel on mobile**.

The carousel is **pure CSS scroll-snap** — no Swiper, no carousel library, no
JavaScript driving the scroll.

Design: Figma `SGH - RB META APEROL`, node `410-8852`.

Built on the structure of `dev-boilerplate-modules` (Gulp + Pug + SCSS +
Browserify). This repository is independent from it: no shared remote, no
shared history.

## Requirements

- Node.js >= 20
- Gulp 4 CLI

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies. No private registry token needed. |
| `npm run dev` / `npm run serve` | Prompts for language and variant, then serves on <http://localhost:347> with BrowserSync. |
| `npm run build` | Production build into `dist/`; optionally creates a versioned `release/`. |
| `npm run new` | Scaffold an additional brand variant. |
| `npm run remove` | Delete a variant. |
| `npm run proxy` | CORS-Anywhere proxy for local API calls. |

## Configuration

`projectConfig.json`

| Key | Value | Notes |
| --- | --- | --- |
| `projectName` | `SGH_aperol_main_features` | Drives the container id `#ct_cm--SGH-aperol-main-features` and the config object `ct_cm__sghAperolMainFeaturesConfig`. |
| `langs` | `["en-us"]` | Offered by the `serve` prompt. |
| `variants` | `["SGH"]` | Brand code is the part before the first `_`. |

Asset paths live in `package.json` > `projectConfigurations.paths`.

## Where things are

```
src/
  views/main/main.pug                            module container
  views/main/SGH/main.pug                        variant entry
  views/main/SGH/components/main-features.pug    the four-card markup
  views/main/SGH/live/live.html                  Akamai asset paths for release
  scss/components/_main-features.scss            layout + mobile carousel
  scss/variants/SGH/_variables.scss              design tokens
  scss/variants/SGH/main.scss                    variant entry, imports the component
  js/contents.js                                 fills the cards from JSON, entry animation
  js/variants/SGH/                               variant main / info_store
  json/variants/SGH/json.js                      copy and asset names, per locale
  static/fonts/SGH/                              Acta Headline (dev only)
```

## How content flows

The markup is a **static skeleton**: four empty cards. At runtime
`src/js/contents.js` reads `window.ct_cm__sghAperolMainFeaturesConfig` and fills
titles, descriptions, optional disclaimers and images, resolving each string for
the current locale through `getTrad()`.

Variant Pug files are rendered by `tasks/views.task.js` via
`pug.renderFile(..., { include })`, so they receive **no Pug locals** — that is
why nothing is templated at build time in the component.

Cards fade and rise into view once, staggered, when the section first enters the
viewport (`IntersectionObserver` in `contents.js` toggles `.is-visible`; the CSS
does the rest, and respects `prefers-reduced-motion`).

## Open items

Search the repo for `TODO Figma` and `TODO_AKAMAI`:

- design tokens in `src/scss/variants/SGH/_variables.scss` and the flagged
  values in `_main-features.scss` still need to be confirmed against node
  `410-8852`;
- copy and image file names in `src/json/variants/SGH/json.js` are empty;
- production asset paths in `package.json` and `src/views/main/SGH/live/live.html`.
