# Language Add Playbook

Use this when adding a new language for the website.

## 1) Decide language code

- Use ISO code (example: `de`, `fr`, `es`).

## 2) Activate locale in frontend

- Update `VITE_ACTIVE_LOCALES` (comma-separated), for example:
  - `nl,en,de`

This controls which locales are visible in the switcher and active routes.

## 3) Product columns in Google Sheets

Add these columns:
- `slug_<lang>`
- `name_<lang>`
- `description_<lang>`

Example for German:
- `slug_de`, `name_de`, `description_de`

## 4) Scaffold blog rewrite drafts

Run:

```bash
npm run i18n:blog:scaffold -- --lang=<lang> --source=nl
```

This creates:
- `i18n/blog-locales/<lang>/README.md`
- one draft file per blog post

## 5) Rewrite with prompt pack (Codex workflow)

- Use `i18n/BLOG_REWRITE_PROMPTS.md`
- Rewrite each draft (not literal translate).
- Validate JSON contract per post.

## 6) Apply rewritten posts

- Insert finalized localized post objects into your target locale content source.
- Keep fallback behavior to base locale when localized post is missing.

## 7) SEO checks

- Ensure localized pages exist with canonical + hreflang.
- Rebuild and verify:
  - `/lang/shop`
  - `/lang/blog`
  - `/lang/product/<localized-slug>`
