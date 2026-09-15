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
- SGH copy carries eight locale keys: `pt` and `pt-br` dropped, `nl` added.
- The `_meta` block is gone from SGH's content json and from the scaffold
  template. Nothing read it, and it shipped to the browser with the copy.
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
