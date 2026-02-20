param(
  [Parameter(Mandatory = $true)] [string]$NewRepoName,
  [Parameter(Mandatory = $true)] [string]$GithubOwner,
  [Parameter(Mandatory = $true)] [string]$TemplateRepo,
  [Parameter(Mandatory = $true)] [string]$CloudflareAccountId,
  [Parameter(Mandatory = $true)] [string]$CloudflarePagesProjectName,
  [Parameter(Mandatory = $true)] [string]$CloudflareApiToken,
  [string]$Visibility = "private"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Creating repo from template..."
gh repo create "$GithubOwner/$NewRepoName" --template "$TemplateRepo" --$Visibility --clone=false

Write-Host "Setting required GitHub Action secrets..."
$CloudflareApiToken | gh secret set CLOUDFLARE_API_TOKEN --repo "$GithubOwner/$NewRepoName"
$CloudflareAccountId | gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$GithubOwner/$NewRepoName"
$CloudflarePagesProjectName | gh secret set CLOUDFLARE_PAGES_PROJECT_NAME --repo "$GithubOwner/$NewRepoName"

Write-Host "Setting convenience variables..."
gh variable set SITE_ENV --body "production" --repo "$GithubOwner/$NewRepoName"

Write-Host "Done. Next steps:"
Write-Host "1) Add custom domain in Cloudflare Pages for $CloudflarePagesProjectName."
Write-Host "2) Add Apps Script properties (GH_TOKEN, GH_OWNER, GH_REPO, CF_ZONE_ID, CF_API_TOKEN)."
Write-Host "3) Trigger workflow once via Actions tab to verify."
