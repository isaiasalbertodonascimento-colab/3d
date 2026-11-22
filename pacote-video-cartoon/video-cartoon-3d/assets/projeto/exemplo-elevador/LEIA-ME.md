# E se tu tivesse no 15º andar e o cabo arrebentasse? (9:16, 60 s, suspense)

Roteiro do usuário com tempos fixos (17 cenas, 1–3 palavras de legenda por vez **no meio da tela**, fonte Montserrat ExtraBold).
- Cenários novos (em `scenes.part.js`):
  - `CITY`: centro antigo de SP ao entardecer: fachadas com janelas acesas (canvas + emissiveMap), cornijas, marquise, porta iluminada, letreiro, calçada de pedra portuguesa, rua, poste antigo, céu de pôr do sol e sol rasante com sombra longa.
  - `SHAFT`: poço do elevador em corte lateral, com 16 andares (lajes, apartamentos cortados com janela acesa, portas de pavimento, números dos andares), trilhos com parafusos, casa de máquinas com polia, fosso com para-choques, cabina externa com garras de freio (`SH.jaws`), cabos (`setCab(y)`), contrapeso e luzes (`SH.spark` para faíscas, `SH.pit` no fundo).
  - `CAB`: cabina por dentro, com aço escovado, piso, corrimão, luz de teto (`CB.light`), luz vermelha de emergência (`CB.red`), painel de botões 1–15 (`CB.btn0/btn1`), portas deslizantes (`CB.doors`), mostrador de andar (`setDisp(n)`) e celular rachado no chão.
- Tempo da queda: `cabY(t)` e `speed(t)` alimentam a câmera, o HUD e o áudio.
- HUD e telas (em `../kit/fx.js`): `gaugeSVG()` (velocímetro), `floorSVG()` (mostrador de andar), `sparksSVG()` (faíscas laranja), `capSVG()` (legenda Montserrat no meio), `diagram()` (planta azul do limitador de velocidade), `otis()` (cartaz antigo sépia com selo).
- Cortes internos com flash: tabela `CUTS` no render.
- Montagem: `cenas.js = base.js (sem __CHARS__) + scenes.part.js + sc.part.js` e depois `python3 build.py`.
