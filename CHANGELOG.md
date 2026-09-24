# Changelog

## Unreleased

- New `dist/fragment.html`: the CoreMedia deliverable. Critical css, skeleton
  and a single `<script src>` — the bundle injects the stylesheet into `<head>`
  and fetches the content json, so no full stylesheet sits in the page body.
  `dist/espot.html` is unchanged and still self-contained.
- Content json is now a real `.json` fetched at runtime, authored in
  `src/json/variants/<BRAND>/json.json`.
- Every runtime asset url derives from one value, `productionAsset` in
  `package.json`.
- Six more brand variants scaffolded — OO, OP, OPSM, PO, RB, SV — each with its
  own store detection. Design tokens, copy and photos are still SGH placeholders.
- Locales are per brand, read from each brand's own
  `src/json/variants/<BRAND>/json.json` — the locale keys of its translatable
  strings are the list. `projectConfig.json` > `langs` is gone with the
  project-wide list it held, and the dev prompt asks for the variant before the
  language, since the language list now depends on it. `LANGUAGE=pt` fails on
  SGH and passes on PO.
- SGH copy carries ten locale keys: `pt` and `pt-br` dropped, `nl`, `en-au`
  and `en-nz` added. The two new English markets read "Ray-Ban Meta Audio" in
  the disclaimer and "quality audio" on card two; the `<html lang>` values
  they rely on (`en-AU`, `en-NZ`) are not verified on the live site yet.
- The `_meta` block is gone from SGH's content json and from the scaffold
  template. Nothing read it, and it shipped to the browser with the copy.
- **Fix** — cards hold their 334x600 (320x600 mobile) aspect ratio at every
  width instead of a fixed 600px height. Between 1025 and 1440 the columns
  narrow while the height stayed put, so `object-fit: cover` cropped the photos
  in from the sides. Nothing bounds the height now, and the section's
  `max-width: 1440px` is gone with it: the module fills its CoreMedia row at
  every size rather than centring narrower than the row past 1440, and the
  cards scale with it. Note this touches
  `critical.scss`, inlined into `fragment.html`: the fragment has to be
  re-pasted into CoreMedia or the stale inline `height: 600px` keeps winning
  over the uploaded stylesheet.
- **Fix** — card copy is anchored to the bottom of the card, a real
  `$spacing-lg` clear of the edge on every card at every size. Card one's
  two-line title plus disclaimer used to grow down into that gap until it almost
  touched the card edge. The block no longer carries a proportional min-height:
  that kept the four titles aligned, but pinned the copy to the block's top, so
  on a tall card the text floated well above the edge and `bottom` looked inert.
  Titles now sit where their own copy height puts them — about 20px of spread at
  1440. Scaling the type with the card would close the gap; nothing does today.
- The three runtime assets now sit directly at `productionAsset`, instead of
  under `style/`, `json/` and `script/` subfolders. Upload the js, the css and
  the json side by side into the one folder the base url names; the urls are
  that path plus the file name. Affects `bootstrap.js`, the fragment's script
  tag and every brand's `live.html`.
- A release build now wipes `release/<VARIANT>/<version>/` before writing it, so
  stale files from an earlier run cannot survive into an upload. Scoped to that
  one folder: sibling brands and older versions are left alone.
- **Fix** — an `image` in the content json that is already an absolute url,
  protocol-relative, root-relative or a data uri is no longer prefixed with the
  environment image path. Placeholder urls used to come out as
  `./static/images/https://placehold.co/...` and 404 silently.
- **Fix** — SGH store detection waited for `window.lang`, a global that does not
  exist on sunglasshut.com, so the production module would have polled forever
  and never rendered. It now reads the `lang` attribute of the `<html>` tag,
  which is server-rendered and so needs no polling at all; verified on `/us`
  (`en-US`), `/ca-en` (`en-CA`) and `/ca-fr` (`fr-CA`). This also retires the
  deprecated `ct_data` / `wcs_config` lookup: SGH's info store is now
  `{ brand, lang, country }`, the only fields the module ever consumed. The
  approach is verified on sunglasshut.com only — the other brands keep their
  own detection until each is checked on its own storefront.

## 0.0.1

- Initial module: main features section, four cards, horizontal scroll-snap carousel on mobile.
