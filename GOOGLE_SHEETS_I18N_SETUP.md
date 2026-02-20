# Google Sheets i18n Setup (One-time + Foolproof)

Use this for product translations without expensive live formulas.

## Goal

- Translate once into fixed cell values (not `GOOGLETRANSLATE` formulas).
- Let the client manually override any translated cell.
- Keep frontend fast and deterministic.

## 1) Product column structure (scalable)

In your `Products` sheet, keep base columns and add per-language columns:

- Base:
  - `slug`
  - `name`
  - `description`
- Per target language `<lang>`:
  - `slug_<lang>`
  - `name_<lang>`
  - `description_<lang>`

Example for English:
- `slug_en`, `name_en`, `description_en`

Example for German later:
- `slug_de`, `name_de`, `description_de`

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
- Client edits `name_en`, `description_en`, `slug_en` directly.
- Those edits remain stable and are not recalculated on page reload.

This is exactly what you want for non-technical users.

## 6) Why this is better than formulas

Avoid:
- `=GOOGLETRANSLATE(...)` per cell forever.

Because formulas:
- re-evaluate and can change unexpectedly,
- are harder for non-technical clients,
- complicate manual overrides.

Use one-time write-as-value workflow instead.

## 7) Optional: use ChatGPT instead of Google translate

You can replace translation backend later with OpenAI API in Apps Script:
- still write results as plain values,
- keep same column structure and same menu flow.

So architecture remains stable even if translation provider changes.

## 8) Frontend compatibility

Current frontend already supports locale product fields:
- `slug_<lang>`
- `name_<lang>`
- `description_<lang>`

Fallback behavior:
- if localized field is missing, it falls back to base (`slug`, `name`, `description`).
