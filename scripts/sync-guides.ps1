<#
.SYNOPSIS
    Mirrors the canonical guides into docs/guide/ so GitHub Pages can render them.

.DESCRIPTION
    The course content lives ONCE, in "developer Platform App Builder Roadmap/".
    The interactive site fetches each guide from docs/guide/ at runtime, because
    the browser cannot read files outside the published site root.

    That duplication is the classic way a documentation site rots: you fix a typo
    in the canonical guide, forget the copy, and the site keeps serving the old
    text forever. This script exists so that cannot happen silently:

      .\scripts\sync-guides.ps1          copy every guide (the normal workflow)
      .\scripts\sync-guides.ps1 -Check   report drift and exit 1, changing nothing

    -Check runs in CI, so a forgotten sync fails the build instead of quietly
    serving stale content.

    Both directories are committed. That redundancy is intentional and is what
    makes the site work with no server and no build step.

.PARAMETER Check
    Verify docs/guide/ matches the canonical guides. Exits 1 on any drift.

.PARAMETER GuideDir
    Canonical guide directory. Defaults to "developer Platform App Builder Roadmap".

.EXAMPLE
    .\scripts\sync-guides.ps1 -Check
#>
[CmdletBinding()]
param(
    [switch] $Check,
    [string] $GuideDir = 'developer Platform App Builder Roadmap'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root     = Split-Path -Parent $PSScriptRoot
$source   = Join-Path $root $GuideDir
$dest     = Join-Path $root 'docs\guide'

function Write-Step($message) { Write-Host "  $message" -ForegroundColor Cyan }
function Write-Warn($message) { Write-Host "  $message" -ForegroundColor Yellow }
function Write-Fail($message) { Write-Host "  $message" -ForegroundColor Red }

if (-not (Test-Path -LiteralPath $source)) {
    Write-Fail "canonical guide directory not found: $source"
    exit 1
}

$guides = @(Get-ChildItem -LiteralPath $source -Filter '*.md' -File | Sort-Object Name)
if ($guides.Count -eq 0) {
    Write-Fail "no .md guides found in $source"
    exit 1
}

Write-Host ''
if ($Check) { Write-Host 'Checking guide sync (read-only)...' -ForegroundColor White }
else        { Write-Host 'Syncing guides...' -ForegroundColor White }

if (-not $Check) {
    if (-not (Test-Path -LiteralPath $dest)) {
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Write-Step "created docs\guide"
    }
}

# Every canonical guide must be mirrored, AND every mirrored file must correspond
# to a canonical guide. Orphans in docs/guide are just as broken as missing files:
# they mean a guide was renamed or deleted upstream without a cleanup here.
$destFiles = @(Get-ChildItem -LiteralPath $dest -Filter '*.md' -File -ErrorAction SilentlyContinue)
$orphans   = @($destFiles | Where-Object { -not (Test-Path -LiteralPath (Join-Path $source $_.Name)) })

$drift = 0
$copied = 0

foreach ($guide in $guides) {
    $target = Join-Path $dest $guide.Name

    if (-not (Test-Path -LiteralPath $target)) {
        $drift++
        if ($Check) {
            Write-Fail "MISSING in docs/guide : $($guide.Name)"
        } else {
            Copy-Item -LiteralPath $guide.FullName -Destination $target -Force
            $copied++
            Write-Step "copied  $($guide.Name)"
        }
        continue
    }

    $srcHash = (Get-FileHash -LiteralPath $guide.FullName -Algorithm SHA256).Hash
    $dstHash = (Get-FileHash -LiteralPath $target        -Algorithm SHA256).Hash

    if ($srcHash -ne $dstHash) {
        $drift++
        if ($Check) {
            Write-Fail "DRIFTED                : $($guide.Name)"
        } else {
            Copy-Item -LiteralPath $guide.FullName -Destination $target -Force
            $copied++
            Write-Step "updated $($guide.Name)"
        }
    }
}

foreach ($orphan in $orphans) {
    $drift++
    if ($Check) {
        Write-Fail "ORPHAN in docs/guide    : $($orphan.Name)"
    } else {
        Remove-Item -LiteralPath $orphan.FullName -Force
        Write-Warn "removed orphan $($orphan.Name)"
    }
}

Write-Host ''
if ($Check) {
    if ($drift -eq 0) {
        Write-Host "OK: all $($guides.Count) guides are in sync." -ForegroundColor Green
        exit 0
    }
    Write-Host "FAIL: $drift guides out of sync. Run: .\scripts\sync-guides.ps1" -ForegroundColor Red
    exit 1
}

if ($copied -eq 0 -and $drift -eq 0) {
    Write-Host "All $($guides.Count) guides are already in sync - nothing to do." -ForegroundColor Green
} else {
    Write-Host "Synced $($guides.Count) guides, $copied changed." -ForegroundColor Green
}
Write-Host "Canonical source : $GuideDir"
Write-Host 'Published copy   : docs\guide' -ForegroundColor DarkGray
exit 0