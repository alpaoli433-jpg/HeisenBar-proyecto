#!/usr/bin/env bash
# Genera un mapa liviano de dependencias internas de src/ (imports locales,
# vía alias "@/" o rutas relativas) y lo escribe en docs/DEPENDENCY_GRAPH.md.
# Uso: ./scripts/index-graph.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
OUT_FILE="$ROOT_DIR/docs/DEPENDENCY_GRAPH.md"

if [ ! -d "$SRC_DIR" ]; then
  echo "No existe src/ en $ROOT_DIR" >&2
  exit 1
fi

{
  echo "# Mapa de dependencias de src/"
  echo
  echo "> Generado automáticamente por \`scripts/index-graph.sh\`. No editar a mano."
  echo "> Regenerar con: \`./scripts/index-graph.sh\`"
  echo

  while IFS= read -r -d '' file; do
    rel_file="${file#"$ROOT_DIR"/}"

    imports=$(grep -Eo "from ['\"](@/|\.\.?/)[^'\"]+['\"]" "$file" 2>/dev/null \
      | sed -E "s/from ['\"](.*)['\"]/\1/" \
      | sort -u || true)

    if [ -n "$imports" ]; then
      echo "## \`$rel_file\`"
      echo
      while IFS= read -r imp; do
        [ -z "$imp" ] && continue
        echo "- $imp"
      done <<< "$imports"
      echo
    fi
  done < <(find "$SRC_DIR" -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | sort -z)
} > "$OUT_FILE"

echo "Mapa de dependencias escrito en ${OUT_FILE#"$ROOT_DIR"/}"
