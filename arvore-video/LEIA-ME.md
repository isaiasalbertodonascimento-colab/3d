# E se você construísse uma casa na árvore? (9:16, 60 s, sem narração, simulação de engenharia)

Vídeo final: `../entregas/casa_na_arvore_9x16.mp4`.
Kit: `video-cartoon-3d` da branch `ccr-fisica-maos-rosto`. Para editar, crie um projeto com `novo_projeto.sh` e copie esta pasta para `./proj/arvore/`.

- `index.html` = `head.html + base.js + extra.js + world.js + env.js + build.js + scenes.js`
- `env.js`: cenário fixo (campo, colinas, lago, montanhas, a árvore e o galho fino que quebra).
- `build.js`: as 3 tentativas como funções do tempo (`a1State`, `a2State`, `a3State`). Os replays chamam a mesma função com o tempo voltando e em câmera lenta.
- `node check.js`: 0 atravessamentos; chão corrigido no máximo 30 unidades SVG.
