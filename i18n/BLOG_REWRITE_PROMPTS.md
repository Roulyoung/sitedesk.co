# Blog Rewrite Prompt Pack

Use these prompts to rewrite blog content from a base language into a target language.
This is a rewrite workflow, not literal translation.

## Prompt 1: Voice + Strategy

```text
Role: Senior conversion copywriter + technical editor for e-commerce infrastructure.

Task:
Rewrite the source article from {{SOURCE_LANG}} to {{TARGET_LANG}}.

Goals:
- Keep core technical meaning fully correct.
- Keep persuasive structure and business intent.
- Improve natural local readability.
- Do not perform literal translation.

Rules:
- Preserve section order and argument flow.
- Preserve factual claims unless flagged as uncertain.
- Keep examples and numbers, but localize formatting naturally.
- Keep CTA intent equivalent, adapted to target language style.
- Avoid awkward machine-translation phrases.
- Tone: direct, credible, high-performance e-commerce.

Output quality bar:
- Native-level fluency for {{TARGET_LANG}} readers.
- No grammar artifacts.
- No mixed-language leftovers.
```

## Prompt 2: JSON Output Contract (for app data)

```text
Return ONLY valid JSON with this exact shape:
{
  "id": "string",
  "title": "string",
  "excerpt": "string",
  "date": "YYYY-MM-DD",
  "tags": ["string"],
  "readingTime": "string",
  "content": [
    { "type": "text", "value": "string" },
    { "type": "h2", "value": "string" },
    {
      "type": "calc_box",
      "data": {
        "title": "string?",
        "items": ["string"]?,
        "leftTitle": "string?",
        "leftItems": ["string"]?,
        "rightTitle": "string?",
        "rightItems": ["string"]?,
        "summary": "string?"
      }
    },
    {
      "type": "cta_box",
      "data": { "title": "string?", "body": "string?" }
    }
  ]
}

Constraints:
- Keep id stable unless explicitly asked to localize slug.
- Preserve content block types and order.
- Preserve calc box structure.
- Keep CTA box present where source has it.
```

## Prompt 3: QA Pass

```text
Review the rewritten article for:
1) factual consistency with source
2) native fluency in {{TARGET_LANG}}
3) CTA clarity
4) SEO title/excerpt quality
5) valid JSON contract compliance

If issues exist, output corrected final JSON only.
```
