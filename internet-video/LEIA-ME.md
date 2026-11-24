# E se a internet caísse no mundo inteiro por 1 semana? (9:16, 47 s, sem narração)

Vídeo final: `../entregas/internet_caiu_9x16.mp4`.

Feito com o kit `video-cartoon-3d` (pasta `pacote-video-cartoon/` da branch `ccr-c0897b03-99tw2f`).
Para editar, crie um projeto com `bash pacote-video-cartoon/video-cartoon-3d/scripts/novo_projeto.sh ./proj` e copie esta pasta para `./proj/internet/` (a página usa `../kit`, `../lib` e `../fonts`).

- `index.html` = `head.html + base.js + extra.js + world.js + town.js + world2.js + scenes.js` (concatenados)
- Cenários: rua de bairro com mercadinho, fundo do mar (cabo submarino), espaço (Sol e Terra)
- Personagens originais: Caio (protagonista), Seu Dito, Dona Cida, Juca

```
cat head.html base.js extra.js world.js town.js world2.js scenes.js > index.html
NODE_PATH=$(npm root -g) node export_events.js && python3 make_audio.py
NODE_PATH=$(npm root -g) node render.js 0 140 p01.mp4   # ... em pedaços de 140 quadros até 1412
ffmpeg -f concat -safe 0 -i partes.txt -c copy video_mudo.mp4
ffmpeg -i video_mudo.mp4 -i audio/trilha.wav -af loudnorm=I=-14:TP=-1.5 -c:v copy -c:a aac -b:a 192k -shortest video.mp4
```
