# E se o governo imprimisse dinheiro sem parar? (9:16, 47 s, sem narração, com física)

Vídeo final: `../entregas/dinheiro_sem_parar_9x16.mp4`.

Feito com o kit `video-cartoon-3d` da branch `ccr-fisica-maos-rosto` (chão sólido com `groundFix`/`groundAt`).
Para editar: crie um projeto com `bash pacote-video-cartoon/video-cartoon-3d/scripts/novo_projeto.sh ./proj` e copie esta pasta para `./proj/dinheiro/`.

- `index.html` = `head.html + base.js + extra.js + world.js + town.js + world2_full.js + scenes.js` (o `world2_full.js` já inclui `phys.js`)
- `phys.js`: física das notas (gravidade, arrasto do ar, balanço de folha, giro, quique, pilha em mapa de altura, colisão com a cabeça, vento e impulsos). Determinística: cada quadro re-simula desde o início da cena, então dá para renderizar em pedaços paralelos.
- `node check.js`: 0 atravessamentos; chão corrigido no máximo 25 unidades SVG.

```
cat head.html base.js extra.js world.js town.js world2_full.js scenes.js > index.html
NODE_PATH=$(npm root -g) node export_events.js && python3 make_audio.py
NODE_PATH=$(npm root -g) node render.js 0 100 p01.mp4   # ... pedaços de 100 quadros até 1412
