#!/usr/bin/env bash
# Cria projetos/<slug>/ com o modelo de cenas e confere as dependências.
# Uso: bash novo_projeto.sh <slug>     (rode na raiz do repositório)
set -euo pipefail
SLUG="${1:?uso: novo_projeto.sh <slug>}"
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
DEST="projetos/$SLUG"
if [ -e "$DEST" ]; then echo "[erro] $DEST já existe" >&2; exit 1; fi
mkdir -p "$DEST/audio"
cp -r "$SKILL/assets/template/scene" "$DEST/scene"
for t in ffmpeg ffprobe node python3; do command -v "$t" >/dev/null || { echo "[erro] falta $t" >&2; exit 1; }; done
python3 -c "import numpy" 2>/dev/null || { echo "[erro] falta numpy (pip install numpy)" >&2; exit 1; }
node -e "require('playwright')" 2>/dev/null || echo "[aviso] playwright não encontrado: npm i -D playwright && npx playwright install chromium"
if [ ! -d node_modules/three ] || [ ! -d node_modules/@fontsource/anton ]; then
  echo "[info] instalando three e fontes em node_modules/ ..."
  npm install --no-save --silent three@0.170.0 @fontsource/anton @fontsource/inter
fi
grep -qs '^projetos/\*/frames/' .gitignore || printf 'projetos/*/frames/\nprojetos/*/stills/\nprojetos/*/audio/narracao_raw.*\n' >> .gitignore
echo "[ok] $DEST criado. Próximo passo: escrever $DEST/beats.json"
