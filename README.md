# 4 Card Section Module

Cross-brand landing page module: a **four-card section** that shows the cards
side by side on desktop and turns into a **horizontally scrollable carousel on
mobile**.

The carousel is **pure CSS scroll-snap** — no Swiper, no carousel library, no
JavaScript driving the scroll.

The markup is shared by every brand; only the design tokens, the copy and the
photos change per brand. SGH is the only variant with real design tokens and
real copy; OO, OP, OPSM, PO, RB and SV are scaffolded with SGH placeholders and
their own store detection, and are not shippable until their tokens, copy and
photos land.

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
| `npm run dev` / `npm run serve` | Prompts for variant and language, then serves on <http://localhost:347> with BrowserSync. |
| `npm run build` | Production build into `dist/`; optionally creates a versioned `release/`. |
| `npm run new` | Scaffold an additional brand variant. |
| `npm run remove` / `npm run delete` | Delete a variant. Same task under two names. |
| `npm run proxy` | CORS-Anywhere proxy for local API calls. |
| `npm run sprite` | Builds an SVG sprite from a folder passed as `--icons <path>`. Boilerplate leftover — this module uses no icons. |

### Running without the prompts

Both commands normally prompt: `dev` asks for the variant and then the language,
`build` asks whether to cut a release and then for the variant (a production
build ships every locale, so it never asks for one). Set `VARIANT` and the
questions are skipped — this is what makes the build usable in CI, where there
is no terminal to answer them:

```bash
VARIANT=SGH npm run build              # one brand
VARIANT=SGH RELEASE=yes npm run build  # and write release/SGH/<version>/
```

| Variable | |
| --- | --- |
| `VARIANT` | Required to skip the prompt. Must exist in `projectConfig.json` > `variants`; an unknown value fails the build instead of silently building the wrong brand. |
| `LANGUAGE` | Optional, and dev-only — a production build ships every locale in one json. Defaults to the variant's first locale. Must be one the variant actually has: `LANGUAGE=pt` fails on SGH and passes on PO. |
| `RELEASE` | Optional, `yes`/`true`/`1` to also produce `release/<VARIANT>/<version>/`. This is the "Create release?" prompt. |

Building several brands means running the build once per variant — the pipeline
handles one variant per run by design, and wipes `dist/` between runs. Only
`release/` keeps them side by side.

Answering **no** to "Create release?" costs you nothing in `dist/`: the release
step is a copy that runs afterwards, and `dist/` comes out byte-for-byte the
same either way. What the release adds is the **one concatenated bundle**,
`main__<version>.min.js` — in `dist/` the javascript is still two separate files
(`dist/js/main.min.js` and `dist/js/<BRAND>/main.min.js`), and the single name
`fragment.html` points at exists only under `release/`. So: **no** while you are
just checking that the build passes, **yes** whenever the files have to leave
your machine.

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
`src/json/variants/<BRAND>/json.json` (copy and image file names).

⚠️ `src/scss/variants/<BRAND>/main.scss` must keep its
`@import "../../components/main-features"`. The markup is shared, the styling is
not: without that import the cards render unstyled and **nothing warns you** —
Sass compiles happily. The scaffolding templates already include it.

## Configuration

`projectConfig.json`

| Key | Value | Notes |
| --- | --- | --- |
| `projectName` | `4-card-section-module` | Drives the container id `#ct_cm--4-card-section-module`, the config object `ct_cm__4CardSectionModuleConfig` and the `data-ct-css` marker on the injected stylesheet. Brand-neutral on purpose: every variant shares them. |
| `variants` | `SGH, OO, OP, OPSM, PO, RB, SV` | Brand code is the part before the first `_`, and must exist in `BRANDS` in `tasks/_config.js`. |

There is no project-wide locale list. **Locales are per brand**, and each brand's
are read from its own `src/json/variants/<BRAND>/json.json` — every translatable
string there is an object keyed by locale, so the keys are the list
(`tasks/prompt.task.js` > `localesForVariant`). SGH ships eight today; a brand
that needs twelve just has twelve keys in its json, and nothing else changes.

That is also why the dev prompt asks for the **variant first**: the language
list depends on it. Add a locale to a brand's json and it appears in that
brand's prompt, with no second list to update — and asking for one a brand does
not have is now an error instead of a preview of missing copy.

Asset paths live in `package.json` > `projectConfigurations.paths`.
`productionAsset` is the one that matters for a live fragment: every runtime url
— stylesheet, json, script — is derived from it.

## Where things are

```
src/
  views/main/main.pug                            module container + the four-card markup,
                                                 shared by every brand
  views/main/<BRAND>/main.pug                    brand-specific markup, if any
  views/main/<BRAND>/live/live.html              asset script tag for the release preview
  scss/critical.scss                             the only css that travels in the fragment
  scss/components/_main-features.scss            layout + mobile carousel, shared
  scss/variants/<BRAND>/_variables.scss          design tokens, per brand
  scss/variants/<BRAND>/main.scss                imports the shared component
  js/modules/bootstrap.js                        injects the stylesheet, fetches the json
  js/contents.js                                 fills the cards from JSON, entry animation
  js/variants/<BRAND>/                           variant main / info_store
  json/variants/<BRAND>/json.json                copy and image names, per locale
  static/images/<BRAND>/                         photos, namespaced per brand
  static/fonts/<BRAND>/                          dev-only webfonts
```

Brand-named folders under `static/` are filtered at build time
(`tasks/staticAsset.task.js`): a build of one brand does not ship another
brand's images or fonts.

## Shipping the module

A build produces **two** deliverables, for two different ways of placing the
module. They are built from the same sources and both live in `dist/`.

| | `espot.html` | `fragment.html` |
| --- | --- | --- |
| Size | ~33 KB | ~4.5 KB |
| Contains | everything inlined: full css, skeleton, json, bundles | critical css, skeleton, one `<script src>` |
| Needs an upload | no | yes — css, json and js go on the asset host |
| Use it for | a self-contained paste, no hosting available | **a CoreMedia row** |

`fragment.html` is the one to paste into CoreMedia. It carries no full
stylesheet in the body: the bundle it loads injects the real stylesheet into
`<head>` and fetches the content json (`src/js/modules/bootstrap.js`). The small
inline `<style>` it does carry is `scss/critical.scss` — geometry only, so the
empty skeleton occupies the exact space the filled component will and the page
does not jump when the stylesheet lands.

### Publishing it, step by step

**1. Set the asset base url, once.** In `package.json` >
`projectConfigurations.paths`, replace `productionAsset` with the folder the
files will be reachable at, trailing slash included:

```json
"productionAsset": "https://media.sunglasshut.com/4CardSection/"
```

Every runtime url — stylesheet, json, script — is derived from this one value,
substituted into the bundle at build time as `@assetPath@`. Nothing else
hardcodes it. Do the same for `productionImage`, which is where the card photos
are served from.

**2. Build with `RELEASE=yes`**, so the files come out already versioned and no
renaming is needed:

```bash
VARIANT=SGH RELEASE=yes npm run build
```

Everything to upload is now in `release/SGH/0.0.1/` (`0.0.1` is
`package.json` > `version`).

⚠️ **Bump `package.json` > `version` yourself before cutting a release the
previous one must outlive.** Nothing increments it: build twice without
touching it and the second run writes over `release/SGH/0.0.1/` — same folder,
same filenames. That is usually what you want while iterating, and exactly what
you do not want once a version is live, because the urls in the fragment carry
the version and a silent overwrite changes what those urls serve.

Each run wipes only the folder it is about to write,
`release/<VARIANT>/<version>/`, so nothing stale survives into an upload. Other
brands and older versions are left alone — that is what keeps several brands
side by side in `release/` when you build them one after another.

**3. Upload by FTP** — three files, three folders, all under the base url from
step 1:

| File from `release/<BRAND>/<version>/` | Upload to |
| --- | --- |
| `main__<version>.min.css` | `<base>/style/` |
| `json__<version>.json` | `<base>/json/` |
| `main__<version>.min.js` | `<base>/script/` |

Plus the brand's photos, under whatever `productionImage` points to. Keep the
`style/`, `json/` and `script/` folder names: they are part of the urls the
bundle builds.

**4. Check the three urls answer 200** in a browser before going further, e.g.
`<base>/script/main__0.0.1.min.js`. A 404 here is the usual cause of a blank
module.

**5. Paste `dist/fragment.html`** — the whole file, from `<style>` to
`</script>` — into the CoreMedia row. Nothing else goes in the row.

**6. Open the page and confirm** the cards fill in. If they do not, the console
carries a `[4-card-section-module]` message saying which of the two loads
failed, the stylesheet or the json.

#### Two things that bite

The json is fetched **cross-origin**: the page is on `www.<brand>.com`, the
asset on `media.<brand>.com`. The asset host must send
`Access-Control-Allow-Origin`, otherwise the browser blocks the fetch and the
cards stay empty. The stylesheet and the script are not affected — only the
json.

**One instance per page.** The module keys off the element id
`#ct_cm--4-card-section-module`, so pasting the fragment twice into the same
page fills only the first copy. The stylesheet is still injected once, not
twice.

### Changing the copy later

Edit `src/json/variants/<BRAND>/json.json`, rebuild, and re-upload **only**
`json__<version>.json`. The css and the js do not change, and the fragment
already in CoreMedia does not have to be touched.

## How content flows

The markup is a **static skeleton**: four empty cards, shared across brands.
`src/js/modules/bootstrap.js` resolves the content — from
`window.ct_cm__4CardSectionModuleConfig` when the fragment carries it inline
(the `espot.html` case), otherwise by fetching `json__<version>.json` from the
asset host. `src/js/contents.js` then fills titles, descriptions, optional
disclaimers and images, resolving each string for the current locale through
`getTrad()`.

Which locale that is comes from `src/js/variants/<BRAND>/info_store.js`, and
every brand detects it differently because every storefront publishes it
differently: the `<html lang>` attribute on SGH, `wcs_config` plus the url on
RB, `ct_data` on OP/OPSM/PO/SV, and the url path segment on OO.

### SGH: the `<html lang>` attribute

SGH reads the **`lang` attribute on the `<html>` tag** and nothing else:

| | `/us` | `/ca-en` | `/ca-fr` |
| --- | --- | --- | --- |
| `<html lang>` | `en-US` | `en-CA` | `fr-CA` |
| -> `info_store.lang` | `en` | `en` | `fr` |
| -> `info_store.country` | `en-us` | `en-ca` | `fr-ca` |

It is **server-rendered** — already in the markup before any script runs — so
the module resolves its locale on the first tick and renders immediately.

This replaced the previous `ct_data` lookup, which is deprecated. `ct_data` and
the other locale globals also land several seconds after navigation on a cold
load, so the old branch had to poll before it could render, and they disagree
with each other, so picking between them took a table of its own:

| | `/us` | `/ca-en` | `/ca-fr` |
| --- | --- | --- | --- |
| `ct_data.lang` + `.country` | en + us | en + ca | fr + ca |
| `wcs_config.locale` | `en_US` | `en_CA` | `fr_CA` |
| `window.language` / `window.country` | `en-US` / `en-US` | missing | `fr-CA` / `fr-CA` |
| `currentCountry()` | `us` | `ca-en` | `ca-fr` |
| `window.langId` | `-1` | `-1` | `-1` |
| `ct_data.langID` | `-1` | `-25` | `-28` |

Nothing in SGH's info store reads `ct_data` or `wcs_config` any more. The
`storeId`, `catalog` and `langID` fields other brands carry are gone with them:
nothing in the module consumed them — `getTrad()` picks the copy from `lang` and
`country` alone. SGH's info store is now `{ brand, lang, country }`, which is why
those three ids are marked optional in the `StateManager` JSDoc.

### Other brands: check before porting this

⚠️ **The `<html lang>` approach is verified on sunglasshut.com only.** Do not
copy it into another brand's `info_store.js` on the assumption that it holds —
check on that brand's live storefront first, on every market it ships to:

1. Open the site and read `document.documentElement.getAttribute("lang")`.
2. Confirm it is **present**, and in the expected `xx-YY` shape. Some
   storefronts ship a bare `<html>`, some a bare `"en"`, some set the attribute
   from JS after load — in which case reading it once at startup gets nothing.
3. Confirm it **changes between markets**. An attribute hardcoded to `en-US` on
   every locale is worse than the globals: it is wrong, silently, and the module
   renders the English copy on a French page without a single console message.
4. Only then swap the brand over. Otherwise leave that brand on the detection it
   has today.

`image` in the JSON is a path relative to the environment image path, so it
carries the brand folder: `"SGH/feature-01-capture.jpg"`.

A value that already points somewhere on its own is used verbatim instead —
an absolute url, a protocol-relative one, a root-relative path or a data uri.
That is what makes `"https://placehold.co/600x400"` work while roughing out a
layout: without it the prefix is still prepended and the src comes out as
`./static/images/https://placehold.co/600x400`, which 404s silently
(`isSelfContainedUrl` in `src/js/contents.js`).

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

- **Asset base url** — `productionAsset` in `package.json` is still
  `TODO_ASSET_BASE_URL/`. Until it holds the real value, `fragment.html` points
  its `<script src>` at a placeholder and cannot go live. Same for
  `productionImage` (`TODO_AKAMAI_IMAGE_PATH/`) and the `[PATH]` / `[VERSION]`
  placeholders in `src/views/main/<BRAND>/live/live.html`.
- **`productionConf` is dead config** — declared in `package.json` and replaced
  into the bundle as `@confPath@`, but no source file uses that token. The json
  url is built from `productionAsset` instead.
- **Six brands are placeholders** — OO, OP, OPSM, PO, RB, SV have their own
  `info_store.js` but SGH's design tokens, SGH's copy and no photos of their
  own. Each needs `src/scss/variants/<BRAND>/_variables.scss` filled from its
  Figma, its own copy in `src/json/variants/<BRAND>/json.json`, and images under
  `src/static/images/<BRAND>/`. Their `info_store.js` is also **unverified**:
  only SGH was checked on the live site. Each handles both locale shapes
  (`en_US` and `en` + country) so it should hold either way, but confirm on the
  brand's own site before shipping it — and run the `<html lang>` check above
  while you are there, since that is the cheaper detection where it holds.
- **Per-brand deploy** — the workflows build and deploy one brand per run, chosen
  from the `workflow_dispatch` input. Fanning out to every variant at once needs
  the Akamai destination layout per brand confirmed first; see the note above the
  deploy step in `.github/workflows/deploy-*.yml`.
- **Localisation** — `src/json/variants/SGH/json.json` carries eight locale keys
  (`en-us`, `en`, `fr`, `fr-ca`, `es`, `es-mx`, `de`, `nl`). Translation is in
  progress and tracked outside this repo; the file itself records no status.
  What matters when adding a locale: **never leave a key as an empty string.**
  `getTrad()` matches the country key before it falls back, so an empty `fr-ca`
  renders a blank card instead of falling through to `fr`. A locale that has no
  copy yet has no key. Note the "Hey Meta, ..." prompt bubble is baked into each
  photo, so it will not translate with the copy; localised markets need
  localised artwork.

  The other six brands keep their own locale set (they still carry `pt` and
  `pt-br`, and a `_meta` block): they are placeholders and get sorted out when
  each one is actually implemented.
- **Tablet (768-1024px)** — the design covers 1440 and 375 only. This range
  currently gets the mobile carousel with the same 320px cards.
- **Card border** — in Figma the second card has a solid white border while the
  other three are `rgba(255,255,255,0.4)`. Treated here as a design slip: all
  four use the 40% border.
- **Copy** — Figma reads "Capture every moment hands-free ." (stray space) and
  the mobile frame capitalises "Open-Ear audio" where desktop has "Open-ear
  audio". Both normalised here; revert if intentional. Separately, the German
  open-ear description reads `Umgebungsgstöne`, which is a typo for
  `Umgebungsgeräusche` — left as found, since the translated copy is owned
  outside this repo.
- **Images are not compressed** — `tasks/images.task.js` runs imagemin over
  `src/images/`, a folder this project does not use; everything under
  `src/static/` is copied verbatim. Upstream boilerplate gap.
