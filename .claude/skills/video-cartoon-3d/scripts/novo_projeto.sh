#!/usr/bin/env bash
# Cria um projeto novo de vídeo a partir do modelo da skill.
# Uso: bash scripts/novo_projeto.sh <pasta-destino>
set -e
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:?informe a pasta de destino}"
mkdir -p "$DEST"
cp -r "$SKILL/assets/projeto/." "$DEST/"
# Fonte Anton instalada no sistema (os personagens viram imagem SVG e precisam dela)
if ! fc-list | grep -qi anton; then
  python3 -c "
from fontTools.ttLib import TTFont;import os
f=TTFont('$DEST/fonts/anton.woff2');f.flavor=None;os.makedirs(os.path.expanduser('~/.fonts'),exist_ok=True);f.save(os.path.expanduser('~/.fonts/Anton.ttf'))" 2>/dev/null && fc-cache -f >/dev/null || echo "aviso: instale fonttools+brotli (pip) para a fonte Anton"
fi
echo "Projeto criado em $DEST"
echo "  cena-quarto/   quarto modelo (prints: cd $DEST/cena-quarto && NODE_PATH=\$(npm root -g) node shots.js)"
echo "  exemplo-vento/ vídeo completo de exemplo (roteiro, cenas, eventos, trilha, render)"
echo "  cenas-novas/   sala de aula, estufa e pátio + elenco com física (check: node check.js)"
echo "  kit/           personagens, mãos, física, colisão, elenco (CAST), detector de trechos parados"
