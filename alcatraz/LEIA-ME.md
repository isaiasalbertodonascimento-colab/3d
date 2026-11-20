# A fuga de Alcatraz: vídeo curto 9:16 (cartoon 2D + cenário 3D)

Vídeo vertical 1080x1920, 30 fps, cerca de 59 s, **sem narração** (só legendas grandes, música e efeitos).
Personagens 2D chapados (estilo cartoon) dentro de cenários 3D em Three.js, com câmera próxima e em movimento.

- `video/fuga_de_alcatraz_9x16.mp4`: vídeo final
- `roteiro.json`: texto das legendas (um bloco por cena)
- `timing.json`: duração de cada bloco (ritmo de leitura das legendas)
- `video3d.html`: cena 3D + personagens 2D + legendas (função `render(t)` determinística)
- `chars.js`: desenho dos personagens 2D (preso, guarda, cabeça falsa, colher, lanterna, remo)
- `video.html`: versão 100% 2D (SVG), mesma história
- `make_audio.py`: música sintetizada e efeitos sonoros sincronizados (`audio/trilha.wav`)
- `preview3d.js`: tira prints em instantes escolhidos (`node preview3d.js 2,10.5,30`)
- `render3d.js`: render completo para `video3d_mudo.mp4`

## Renderizar de novo
```
npm install            # na raiz do repositório (fontes e three)
python3 make_audio.py
NODE_PATH=$(npm root -g) node render3d.js
ffmpeg -i video3d_mudo.mp4 -i audio/trilha.wav -af loudnorm=I=-14:TP=-1.5 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart video/fuga_de_alcatraz_9x16.mp4
```
Para mudar o tempo de uma cena, edite `dur` em `timing.json` e rode `timing.js` de novo
(`window.TIMING=` + conteúdo do JSON). Animação, legendas e efeitos acompanham sozinhos.
