# Sitedesk Cloning Playbook

Use this when creating a new client repo from the Sitedesk template.

## What is automated

The script `scripts/bootstrap-customer.ps1` automates:

1. Create new GitHub repo from template.
2. Fallback to source-copy create if template mode is unavailable.
3. Ensure Cloudflare Pages project exists (create if missing).
4. Set GitHub Actions secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_PAGES_PROJECT_NAME`
5. Set GitHub variable:
   - `SITE_ENV=production`
6. Optional: trigger initial deploy workflow (`-TriggerInitialDeploy`).

## Required prerequisites

1. GitHub CLI installed and authenticated:
   - `gh --version`
   - `gh auth status`
2. PowerShell execution from repo root:
   - `C:\Users\micro\Documents\Codex CLI websites\Websites\sitedesk.co`
3. Cloudflare API token with Pages edit rights.
4. Template repo expectation:
   - If you want true template cloning, source repo must be marked as `Template repository` in GitHub settings.
   - If not, bootstrap script falls back to source-copy create.

## Required workflow contract (for Google Sheets update button)

The target repo workflow must include:

- `repository_dispatch` trigger with:
  - `types: [webhook_update_from_sheets]`
- deployment secrets present:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_PAGES_PROJECT_NAME`

Without this contract, the Apps Script update button appears to run but no deploy starts.

## Token profiles

You can run this with two approaches:

1. Minimal (recommended):
   - Cloudflare Pages: Edit
   - Account Settings: Read
2. Convenience-first (faster operations):
   - Broad token that also includes Workers/KV/Routes permissions for future tasks.

For now, convenience-first is acceptable in this project, as long as token scope is limited to your single Cloudflare account.

## One-command bootstrap

```powershell
.\scripts\bootstrap-customer.ps1 `
  -NewRepoName "<new-repo-name>" `
  -GithubOwner "<github-owner>" `
  -TemplateRepo "<owner/template-repo>" `
  -CloudflareAccountId "<cf-account-id>" `
  -CloudflarePagesProjectName "<cf-pages-project-name>" `
  -CloudflareApiToken "<cf-api-token>" `
  -Visibility "private" `
  -TriggerInitialDeploy
```

## Manual steps after bootstrap

1. Cloudflare Pages:
   - Add custom domain to the new Pages project.
2. Google Sheets Apps Script:
   - Set script properties:
     - `GH_TOKEN`
     - `GH_OWNER`
     - `GH_REPO`
     - `CF_ZONE_ID`
     - `CF_API_TOKEN`
3. Verify:
   - GitHub Actions deploy succeeds.
   - Site responds on Pages URL and custom domain.

## Notes

- If template mode fails, script falls back to source-copy repo create.
- Keep client-specific secrets out of committed files.
- Run content reset/sanitization only after clone is verified.
- If Cloudflare Pages builds an old commit SHA, ensure latest commit is pushed to `main` and re-run the workflow from Actions.
- After any SEO/head or i18n-route change, purge Cloudflare cache before Lighthouse validation.

## Manual post-bootstrap verification (must pass)

1. `gh repo view <owner>/<repo>` succeeds.
2. GitHub Actions run `deploy.yml` succeeds on `main`.
3. Cloudflare Pages project has:
   - production branch `main`
   - custom domain attached
4. Live checks:
   - no React hydration errors in console (`#418/#423` must not appear)
   - canonical on localized route is self-referential (`/en/` -> canonical `/en/`)
   - Google Sheets update button triggers a new `repository_dispatch` workflow run
