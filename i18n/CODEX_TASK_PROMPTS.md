# Codex Task Prompts (I18N)

Copy/paste these prompts in Codex for fast execution.

## 1) Add a full new language

```text
Implement a new locale end-to-end for this project: <lang>.

Do all of this:
1) Activate locale in routing/switchers.
2) Keep default locale behavior unchanged.
3) Ensure locale-aware links everywhere (header/footer/page links).
4) Ensure canonical + hreflang coverage.
5) Scaffold blog rewrite drafts with existing script.
6) Add/update documentation about this locale rollout.
7) Run build and fix any errors.
8) Commit and push.
```

## 2) Rewrite blogs (non-literal) for target language

```text
Use i18n/BLOG_REWRITE_PROMPTS.md and process all files in i18n/blog-locales/<lang>/.
For each file:
1) rewrite article from source language to target language with native fluency,
2) keep structure and business intent,
3) output valid JSON contract only,
4) run QA pass and correct issues.
Then apply final localized posts to the app locale content source and run build.
```

## 3) Translate a newly added page after multilingual rollout

```text
Translate the page <route> for all active locales.

Requirements:
1) Add keys in src/lib/messages.ts for all active locales.
2) Replace hardcoded strings with i18n keys.
3) Ensure locale-preserving internal links.
4) Ensure canonical/hreflang if indexable.
5) Keep design/layout unchanged.
6) Run build and fix issues.
7) Commit and push.
```

## 4) I18N QA and hardening pass

```text
Run a full i18n QA pass.
Check:
1) route coverage for all active locales,
2) switchers (header/footer) behavior,
3) product localized slugs from Sheets,
4) blog localized routes and metadata,
5) canonical/hreflang consistency,
6) no hydration errors.
Apply fixes, run build, then commit and push.
```
