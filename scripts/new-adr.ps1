<#
.SYNOPSIS
    Crea un nuevo ADR a partir de la plantilla.

.DESCRIPTION
    Busca el siguiente número libre en docs/adr/, copia la plantilla,
    rellena título y fecha, y añade la fila al índice del README.

.EXAMPLE
    pwsh scripts/new-adr.ps1 "Usar PostgreSQL como base de datos principal"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Title
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$adrDir   = Join-Path $repoRoot 'docs\adr'
$template = Join-Path $adrDir '0000-adr-template.md'
$indexFile = Join-Path $adrDir 'README.md'

if (-not (Test-Path $template)) {
    throw "No se encuentra la plantilla: $template"
}

# Siguiente número libre (ignora la plantilla 0000).
$existing = Get-ChildItem -Path $adrDir -Filter '*.md' |
    Where-Object { $_.Name -match '^(\d{4})-' } |
    ForEach-Object { [int]$Matches[1] } |
    Where-Object { $_ -gt 0 }

$next = if ($existing) { ([int]($existing | Measure-Object -Maximum).Maximum) + 1 } else { 1 }
$number = '{0:D4}' -f $next

# Título → kebab-case, sin acentos ni caracteres especiales.
# Normalizar a FormD separa la letra base del acento; luego se descartan los acentos.
$normalized = $Title.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
$sb = [Text.StringBuilder]::new()
foreach ($ch in $normalized.ToCharArray()) {
    if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne
        [Globalization.UnicodeCategory]::NonSpacingMark) {
        [void]$sb.Append($ch)
    }
}
$slug = $sb.ToString() -replace '[^a-z0-9]+', '-'
$slug = $slug.Trim('-')

if ([string]::IsNullOrWhiteSpace($slug)) {
    throw "El título no produce un nombre de archivo válido: '$Title'"
}

$fileName = "$number-$slug.md"
$filePath = Join-Path $adrDir $fileName

if (Test-Path $filePath) {
    throw "Ya existe: $fileName"
}

$today = Get-Date -Format 'yyyy-MM-dd'

# E/S con UTF-8 explícito: Get-Content/Set-Content usan la codificación ANSI del
# sistema en Windows PowerShell 5.1, lo que destroza los acentos del Markdown.
$utf8 = New-Object System.Text.UTF8Encoding($false)

$content = [System.IO.File]::ReadAllText($template, $utf8)
$content = $content -replace '(?m)^# NNNN — <Título de la decisión>', "# $number — $Title"
$content = $content -replace '\*\*Fecha:\*\* AAAA-MM-DD', "**Fecha:** $today"

[System.IO.File]::WriteAllText($filePath, $content, $utf8)

# Añadir la fila al índice del README.
if (Test-Path $indexFile) {
    $row = "| [$number]($fileName) | $Title | Propuesto | $today |"
    $index = [System.IO.File]::ReadAllText($indexFile, $utf8).TrimEnd()
    [System.IO.File]::WriteAllText($indexFile, "$index`r`n$row`r`n", $utf8)
    Write-Host "Índice actualizado: docs/adr/README.md"
}

Write-Host ""
Write-Host "ADR creado: docs/adr/$fileName" -ForegroundColor Green
Write-Host ""
Write-Host "Siguientes pasos:"
Write-Host "  1. Rellena el contexto (el PROBLEMA, no la solución)"
Write-Host "  2. Escribe al menos dos opciones REALES"
Write-Host "  3. Documenta las consecuencias, incluidas las malas"
Write-Host "  4. Cambia el estado a 'Aceptado' cuando se acuerde"
