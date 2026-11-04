# To do

## Lithuanian, Latvian, Estonian, Russian (lt, lv, et, ru)

Added for the brands Häny, TEI, AHLM and Jean Lutz plus the company pages (home, products, about, contact, quote, references). Source of the texts: `translations/scope/`
(`strings.json` + `chunk-*.json`), applied to the pages with `node tools/i18n-scope.mjs apply` (it rewrites the lt/lv/et/ru text of those pages from the Swedish, so make later
edits in the chunk files or accept that a rerun replaces hand edits). The other brand pages are hidden in these four languages with `hideIn`.

- [ ] Have a native speaker of each language read the texts (written by Claude, not by a translator). Fix them in `translations/scope/chunk-*.json` and apply again.
- [ ] Privacy policy and cookie text: the four languages link to the English page (`/en/integritetspolicy`). Have it translated and added before launch if the Baltic markets matter.
- [ ] A further brand in these languages: translate its pages (add them to `BRANDS` in `tools/i18n-scope.mjs`, `collect`, translate the new strings into a new chunk file, `apply`) and take lt, lv, et, ru out of its `hideIn`.
- [ ] Units in tables stay in Latin letters (mm, bar, kg) in Russian; the table cells are not part of the text extraction.
- [ ] The Swedish tagline is still shown on English, Spanish and Norwegian pages (footer, home title); the new languages have their own (`tagline` in `content/ui/<lang>.json`).

## Remove the old Marini quarry brochure (hidden for now)

The new quarry catalogue (`assets-src/docs/marini-stenbrott-produktkatalog.pdf`) replaces the old quarry brochures as the download.
The old ones are only hidden: their buttons carry `"hidden": true` (not shown on the site, not in the search), the PDFs are still in `assets-src/docs/`.
Once the new catalogue is approved:

- [ ] Delete the buttons with `"hidden": true` and `marini-broschyr-stenbrott-eng.pdf` / `marini-broschyr-stenbrott-sv.pdf` as `href` in
  `content/pages/produkter/marini.json`, `content/pages/produkter/marini/giraffa.json` and `content/pages/produkter/marini/rustica.json` (all four languages, 16 buttons).
- [ ] Delete `assets-src/docs/marini-broschyr-stenbrott-eng.pdf` and `assets-src/docs/marini-broschyr-stenbrott-sv.pdf` (and their entries in `content/doc-langs.json`, if any).
- [ ] `node tools/check.mjs` after the build; the old files must not be linked from anywhere any more.

## Marini quarry pages: points to check with Marini

- Big Driller: the catalogue gives a weight of 230 kg (same as Hor Drill ID), the brochure 550 kg for the slide with the ID 300 head. The page uses the brochure's component weights and leaves the total out.
- Mini Mobil Fil / Mobil Fil: the catalogue names the control system the other way round on the granite and marble pages, so the control system is left out for these two.
- Driller / Hor Drill: rotary torque of the EP 95 head is 85 daNm in the catalogue and 80 daNm in the brochures (the pages use the catalogue); blade feed force 450 daN on one brochure page and 480 daN on the next (the pages use 480 daN = 4,8 kN).
- Marble saws have no photo of their own in the catalogue: they show the catalogue's line drawing as the main picture.

## Map on the About page (Lager och mobil verkstad)

- [ ] Privacy policy: the map pictures come from OpenStreetMap (tile.openstreetmap.org) after the visitor clicks "Visa kartan"; the visitor's IP address reaches OpenStreetMap then (like YouTube for the videos). The policy text (all languages) does not mention it yet.
- [ ] Exact places: the pins are plain coordinates in `content/pages/om-oss.json` (block `map`, items `lat` / `lon`, `kind`: `warehouse` or `workshop`). They are city centres for now. Put in the real addresses' coordinates when they are known.
- [ ] Norway warehouse: placed at Halden (59.12, 11.39), just across the border from Strömstad. Move it if the real place is elsewhere (and change the title if it should name a town).
- [ ] The mobile workshop pin sits a little north of Göteborg toward Stockholm (58.2, 12.5): move it when you know where the van is usually based.
- The zoom range is the start zoom (6) out one step and in two steps; `zoom`, `zoomIn`, `zoomOut` and `bounds` [south, west, north, east] are fields of the block when a bigger map is wanted later.
