[CmdletBinding()]
param(
    [string]$Destination = 'D:\Projects\sale-office-scdc'
)
$ErrorActionPreference = 'Stop'
$sourceRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$targetRoot = [System.IO.Path]::GetFullPath($Destination)
if ($sourceRoot.TrimEnd('\') -eq $targetRoot.TrimEnd('\')) {
    Write-Host 'This Next.js project is already in the requested folder.'
    exit 0
}
New-Item -ItemType Directory -Path $targetRoot -Force | Out-Null

# Preserve the earlier starter before copying the Next.js application.
$legacyRoot = [System.IO.Path]::GetFullPath((Join-Path $targetRoot 'legacy-html-scaffold'))
if (-not $legacyRoot.StartsWith($targetRoot.TrimEnd('\') + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Legacy backup path is outside the project directory.'
}
foreach ($name in @('index.html', 'style.css', 'server.mjs')) {
    $existingFile = [System.IO.Path]::GetFullPath((Join-Path $targetRoot $name))
    if (-not $existingFile.StartsWith($targetRoot.TrimEnd('\') + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        throw 'Starter file path is outside the project directory.'
    }
    if (Test-Path -LiteralPath $existingFile -PathType Leaf) {
        New-Item -ItemType Directory -Path $legacyRoot -Force | Out-Null
        $backup = Join-Path $legacyRoot $name
        if (Test-Path -LiteralPath $backup) {
            $backup = Join-Path $legacyRoot ((Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '-' + $name)
        }
        Move-Item -LiteralPath $existingFile -Destination $backup
    }
}
foreach ($item in Get-ChildItem -LiteralPath $sourceRoot -Force) {
    if ($item.Name -in @('node_modules', '.next', '.git', '.env.local', 'work', 'legacy-html-scaffold')) { continue }
    Copy-Item -LiteralPath $item.FullName -Destination $targetRoot -Recurse -Force
}
Write-Host "Next.js source copied to $targetRoot"
Write-Host "Next: cd '$targetRoot', then run npm install and npm run dev."
