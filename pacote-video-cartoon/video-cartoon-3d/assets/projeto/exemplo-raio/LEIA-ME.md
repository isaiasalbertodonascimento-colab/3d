# E se você tivesse o poder do raio? (9:16, ~43 s, sem narração)

Une o quarto de `cena-quarto/` com o bairro de `exemplo-vento/` (o `build.py` copia os dois para dentro do `index.html`) e acrescenta eletricidade.
- Fontes: `head.html` (camada SVG, filtros `#glow` e `#eball`) + `cenas.js` (personagens, eletricidade, 8 cenas). Rode `python3 build.py` depois de mexer.
- Herói com raiozinho na cabeça no lugar do broto: sobrescreve `window.sprout` (veja `SP` e `hero()` em `cenas.js`). O mesmo truque desenha cabelo arrepiado (`frizz`), faíscas no cabelo (`spark`) e fumaça (`smoke`).
- Eletricidade (hoje também em `../kit/fx.js`): `bolt3D(A,B,seed)` (raio 3D projetado), `zap()` (arco entre dois pontos da tela), `sparks()`, `eball()` (bola de energia), `strike(u,t0)` (pisca do relâmpago), `counterBR()` (contador com ponto de milhar).
- Luzes: `zapL` (luz azul que acompanha o raio), `flashL` (clarão do céu), postes e janelas que acendem (`postOn`, `H.win`), onda de choque (`SHOCK`, `RINGS`).
```
python3 build.py && NODE_PATH=$(npm root -g) node export_events.js && python3 make_audio.py
NODE_PATH=$(npm root -g) node render.js 0 300 p01.mp4   # em pedaços
```
