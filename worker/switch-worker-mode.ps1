param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("test", "live")]
  [string]$Mode
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Deploying worker in mode: $Mode"
Push-Location $PSScriptRoot
try {
  npx wrangler deploy --env $Mode
  Write-Host "Done. Worker mode '$Mode' deployed."
  Write-Host "Tip: verify with admin endpoint /admin/stripe-health using Bearer token."
}
finally {
  Pop-Location
}
