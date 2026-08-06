<#
.SYNOPSIS
    Verifica que la estructura de contexto para IAs está completa y al día.

.DESCRIPTION
    Ejecútalo antes de abrir un PR, o cuando quieras saber si el contexto que
    leen las IAs sigue siendo válido. Es la versión local del workflow
    .github/workflows/ai-context-check.yml.

.EXAMPLE
    pwsh scripts/check-context.ps1
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

$errors   = @()
$warnings = @()

# ── 1. Archivos obligatorios ──────────────────────────────────────────────
$required = @(
    'AGENTS.md'
    'CLAUDE.md'
    '.ai/PROJECT.md'
    '.ai/RULES.md'
    '.ai/ARCHITECTURE.md'
    '.ai/STACK.md'
    '.ai/GLOSSARY.md'
    '.ai/CURRENT_TASK.md'
    '.ai/TASKS.md'
    '.ai/BUGS.md'
    '.ai/TESTING.md'
    '.ai/SECURITY.md'
    '.ai/DECISIONS.md'
    '.ai/CHANGELOG.md'
    '.ai/AI_MEMORY.md'
    'docs/standards/DEFINITION_OF_DONE.md'
    'docs/standards/CODE_STANDARDS.md'
    'docs/adr/README.md'
)

foreach ($rel in $required) {
    if (-not (Test-Path (Join-Path $repoRoot $rel))) {
        $errors += "Falta el archivo obligatorio: $rel"
    }
}

# ── 2. Plantillas sin rellenar ────────────────────────────────────────────
$placeholders = @{
    '.ai/PROJECT.md'      = '<nombre del proyecto>'
    '.ai/CURRENT_TASK.md' = 'TASK-000'
    '.ai/STACK.md'        = '| Lenguaje (backend) | | | |'
}

foreach ($rel in $placeholders.Keys) {
    $path = Join-Path $repoRoot $rel
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        if ($content -like "*$($placeholders[$rel])*") {
            $warnings += "$rel sigue con la plantilla sin rellenar"
        }
    }
}

# ── 3. AI_MEMORY.md demasiado largo ───────────────────────────────────────
$memoryPath = Join-Path $repoRoot '.ai/AI_MEMORY.md'
if (Test-Path $memoryPath) {
    $lines = (Get-Content $memoryPath | Measure-Object -Line).Lines
    if ($lines -gt 200) {
        $warnings += "AI_MEMORY.md tiene $lines líneas (>200). Toca consolidar: fusiona entradas repetidas y borra lo que ya no aplica"
    }
}

# ── 4. .env versionado ────────────────────────────────────────────────────
Push-Location $repoRoot
try {
    $tracked = git ls-files 2>$null
    if ($LASTEXITCODE -eq 0 -and $tracked) {
        if ($tracked -contains '.env') {
            $errors += '.env está versionado. Sácalo del repositorio y ROTA las credenciales'
        }
    }
} finally {
    Pop-Location
}

# ── 5. Enlaces internos rotos ─────────────────────────────────────────────
$mdFiles = Get-ChildItem -Path $repoRoot -Filter '*.md' -Recurse -File |
    Where-Object { $_.FullName -notmatch '\\\.git\\' }

foreach ($file in $mdFiles) {
    $dir = $file.DirectoryName
    $linkMatches = [regex]::Matches((Get-Content $file.FullName -Raw), '\]\(([^)#: ]+\.md)(#[^)]*)?\)')
    foreach ($m in $linkMatches) {
        $link = $m.Groups[1].Value
        if ($link -match '^(https?:|/)') { continue }
        $target = Join-Path $dir $link
        if (-not (Test-Path $target)) {
            $rel = $file.FullName.Substring($repoRoot.Length + 1)
            $warnings += "Enlace roto en ${rel}: $link"
        }
    }
}

# ── Resultado ─────────────────────────────────────────────────────────────
Write-Host ''
if ($errors.Count -gt 0) {
    Write-Host "ERRORES ($($errors.Count))" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  x $_" -ForegroundColor Red }
    Write-Host ''
}

if ($warnings.Count -gt 0) {
    Write-Host "AVISOS ($($warnings.Count))" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  ! $_" -ForegroundColor Yellow }
    Write-Host ''
}

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host 'Contexto de IA completo y al día.' -ForegroundColor Green
    Write-Host ''
}

if ($errors.Count -gt 0) { exit 1 }
exit 0
