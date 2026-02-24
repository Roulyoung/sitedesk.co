# Google Sheets i18n Setup (One-time + Foolproof)

Use this for product translations without expensive live formulas.

## Goal

- Translate once into fixed cell values (not `GOOGLETRANSLATE` formulas).
- Let the client manually override any translated cell.
- Keep frontend fast and deterministic.

## 1) Product column structure (scalable)

In your `Products` sheet, use paired locale columns per field:

- `title_nl`, `title_en`, `title_de`
- `description_nl`, `description_en`, `description_de`
- `slug_nl`, `slug_en`, `slug_de`

Optional backward-compatible columns still supported by frontend:
- `name`, `name_<lang>`
- `description`, `description_<lang>`
- `slug`

Recommended for new clients: standardize on `title_*` + `description_*` + `slug_*`.

## 2) Install the Apps Script tools

In Google Sheets:
1. `Extensions` -> `Apps Script`
2. Add script file contents from:
   - `google-script/ProductsI18nTools.gs`
3. Save.

## 3) Set Script Properties (important)

`Apps Script` -> `Project Settings` -> `Script properties`

Add:
- `I18N_PRODUCTS_SHEET` = `Products`
- `I18N_BASE_LANG` = `nl`
- `I18N_TARGET_LANGS` = `en`

Later for more languages:
- `I18N_TARGET_LANGS` = `en,de,fr`

## 4) Run the menu flow

Reload the sheet. Use menu: `Sitedesk i18n`

Recommended order:
1. `1) Setup i18n columns`
2. `2) Fill missing translations (values only)`
3. `3) Generate missing localized slugs`

Safety built in:
- Before write operations, a timestamped backup tab is created.
- Only empty target cells are filled.
- Existing manual translations/slugs are never overwritten.

## 5) Client editing behavior

After initial fill:
- Client edits `title_en`, `description_en`, `slug_en` directly.
- Those edits remain stable and are not recalculated on page reload.

This is exactly what you want for non-technical users.

## 6) Formula option (fast bootstrap)

If you want auto-fill in Sheets, use formulas in locale columns, for example:

- `=GOOGLETRANSLATE(A2; "nl"; "en")` (EU separator)
- `=GOOGLETRANSLATE(A2, "nl", "en")` (US separator)

Typical pattern:
- `title_en` translates from `title_nl`
- `description_en` translates from `description_nl`
- `slug_en` can be manually curated for SEO quality

Keep in mind:
- Formula output can shift when source copy changes.
- For final go-live stability, paste-as-values after review.

You can still use the menu workflow for one-time value writes.

## 7) Optional: use ChatGPT instead of Google translate

You can replace translation backend later with OpenAI API in Apps Script:
- still write results as plain values,
- keep same column structure and same menu flow.

So architecture remains stable even if translation provider changes.

## 8) Frontend compatibility

Current frontend already supports locale product fields:
- `slug_<lang>`
- `title_<lang>` (preferred) and `name_<lang>` (legacy)
- `description_<lang>`

Fallback behavior:
- if localized field is missing, it falls back to default locale fields and then base fields.
