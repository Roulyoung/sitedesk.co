param(
  [Parameter(Mandatory = $true)] [string]$NewRepoName,
  [Parameter(Mandatory = $true)] [string]$GithubOwner,
  [Parameter(Mandatory = $true)] [string]$TemplateRepo,
  [Parameter(Mandatory = $true)] [string]$CloudflareAccountId,
  [Parameter(Mandatory = $true)] [string]$CloudflarePagesProjectName,
  [Parameter(Mandatory = $true)] [string]$CloudflareApiToken,
  [string]$Visibility = "private",
  [switch]$TriggerInitialDeploy
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$Repo = "$GithubOwner/$NewRepoName"

function Assert-CommandExists {
  param([Parameter(Mandatory = $true)] [string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found in PATH."
  }
}

function Ensure-GitHubRepo {
  param(
    [Parameter(Mandatory = $true)] [string]$Repo,
    [Parameter(Mandatory = $true)] [string]$TemplateRepo,
    [Parameter(Mandatory = $true)] [string]$Visibility
  )

  Write-Host "Checking if repo already exists..."
  if ((gh repo view $Repo --json name --jq ".name" 2>$null)) {
    Write-Host "Repo already exists: $Repo"
    return
  }

  Write-Host "Creating repo from template..."
  gh repo create $Repo --template $TemplateRepo --$Visibility --clone=false 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Repo created from template: $Repo"
    return
  }

  Write-Warning "Template create failed. Falling back to source copy from current working tree."
  gh repo create $Repo --$Visibility --source . --remote origin-bootstrap --push
}

function Invoke-CfApi {
  param(
    [Parameter(Mandatory = $true)] [string]$Method,
    [Parameter(Mandatory = $true)] [string]$Url,
    [Parameter()] [object]$Body
  )

  $headers = @{
    Authorization = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
  }

  if ($Body) {
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -Body ($Body | ConvertTo-Json -Depth 10)
  }

  return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers
}

function Ensure-CloudflarePagesProject {
  param(
    [Parameter(Mandatory = $true)] [string]$AccountId,
    [Parameter(Mandatory = $true)] [string]$ProjectName
  )

  $base = "https://api.cloudflare.com/client/v4/accounts/$AccountId/pages/projects"
  Write-Host "Checking Cloudflare Pages project..."
  $existing = $null
  try {
    $existing = Invoke-CfApi -Method "GET" -Url "$base/$ProjectName"
  } catch {
    $existing = $null
  }

  if ($existing -and $existing.success) {
    Write-Host "Cloudflare Pages project already exists: $ProjectName"
    return
  }

  Write-Host "Creating Cloudflare Pages project..."
  $body = @{
    name = $ProjectName
    production_branch = "main"
  }
  $create = Invoke-CfApi -Method "POST" -Url $base -Body $body
  if (-not $create.success) {
    throw "Cloudflare Pages project create failed for '$ProjectName'."
  }
  Write-Host "Cloudflare Pages project created: $ProjectName"
}

function Set-GitHubBootstrapSecrets {
  param([Parameter(Mandatory = $true)] [string]$Repo)
  Write-Host "Setting required GitHub Action secrets..."
  $CloudflareApiToken | gh secret set CLOUDFLARE_API_TOKEN --repo $Repo
  $CloudflareAccountId | gh secret set CLOUDFLARE_ACCOUNT_ID --repo $Repo
  $CloudflarePagesProjectName | gh secret set CLOUDFLARE_PAGES_PROJECT_NAME --repo $Repo
}

function Set-GitHubBootstrapVariables {
  param([Parameter(Mandatory = $true)] [string]$Repo)
  Write-Host "Setting convenience variables..."
  gh variable set SITE_ENV --body "production" --repo $Repo
}

function Trigger-DeployWorkflow {
  param([Parameter(Mandatory = $true)] [string]$Repo)
  Write-Host "Triggering initial deploy workflow..."
  gh workflow run deploy.yml --repo $Repo -f reason="bootstrap"
}

Assert-CommandExists -Name "gh"
Assert-CommandExists -Name "git"
Ensure-GitHubRepo -Repo $Repo -TemplateRepo $TemplateRepo -Visibility $Visibility
Ensure-CloudflarePagesProject -AccountId $CloudflareAccountId -ProjectName $CloudflarePagesProjectName
Set-GitHubBootstrapSecrets -Repo $Repo
Set-GitHubBootstrapVariables -Repo $Repo

if ($TriggerInitialDeploy.IsPresent) {
  Trigger-DeployWorkflow -Repo $Repo
}

Write-Host "Done. Next steps:"
Write-Host "1) Add custom domain in Cloudflare Pages for $CloudflarePagesProjectName."
Write-Host "2) Add Apps Script properties (GH_TOKEN, GH_OWNER, GH_REPO, CF_ZONE_ID, CF_API_TOKEN)."
Write-Host "3) If not done now, trigger workflow once via Actions tab to verify."
Write-Host "Docs: CLONING_PLAYBOOK.md and .private/CLONING_MACHINE_PRIVATE.md"
