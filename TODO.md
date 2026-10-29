# To do

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
