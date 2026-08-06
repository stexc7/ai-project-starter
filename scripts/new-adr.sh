#!/usr/bin/env bash
#
# Crea un nuevo ADR a partir de la plantilla.
#
# Uso:
#   ./scripts/new-adr.sh "Usar PostgreSQL como base de datos principal"

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: $0 \"<título de la decisión>\"" >&2
  exit 1
fi

TITLE="$1"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ADR_DIR="$REPO_ROOT/docs/adr"
TEMPLATE="$ADR_DIR/0000-adr-template.md"
INDEX="$ADR_DIR/README.md"

[ -f "$TEMPLATE" ] || { echo "No se encuentra la plantilla: $TEMPLATE" >&2; exit 1; }

# Siguiente número libre (ignora la plantilla 0000).
last=0
for f in "$ADR_DIR"/[0-9][0-9][0-9][0-9]-*.md; do
  [ -e "$f" ] || continue
  n=$(basename "$f" | cut -c1-4)
  n=$((10#$n))
  [ "$n" -gt "$last" ] && last=$n
done
number=$(printf "%04d" $((last + 1)))

# Título → kebab-case sin acentos.
slug=$(printf '%s' "$TITLE" \
  | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null || printf '%s' "$TITLE")
slug=$(printf '%s' "$slug" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')

file="$number-$slug.md"
path="$ADR_DIR/$file"

[ -e "$path" ] && { echo "Ya existe: $file" >&2; exit 1; }

today=$(date +%Y-%m-%d)

sed -e "s/^# NNNN — <Título de la decisión>/# $number — $TITLE/" \
    -e "s/\*\*Fecha:\*\* AAAA-MM-DD/**Fecha:** $today/" \
    "$TEMPLATE" > "$path"

if [ -f "$INDEX" ]; then
  echo "| [$number]($file) | $TITLE | Propuesto | $today |" >> "$INDEX"
  echo "Índice actualizado: docs/adr/README.md"
fi

echo ""
echo "ADR creado: docs/adr/$file"
echo ""
echo "Siguientes pasos:"
echo "  1. Rellena el contexto (el PROBLEMA, no la solución)"
echo "  2. Escribe al menos dos opciones REALES"
echo "  3. Documenta las consecuencias, incluidas las malas"
echo "  4. Cambia el estado a 'Aceptado' cuando se acuerde"
