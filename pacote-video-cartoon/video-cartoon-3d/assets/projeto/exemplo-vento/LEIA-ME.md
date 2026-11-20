# E se você tivesse o poder do vento? (9:16, ~47 s, sem narração)

Personagens 2D (`../kit/chars.js`) em cenários 3D (Three.js): quarto, bairro (dia, tempestade com tornado, pôr do sol) e túnel de vento.
Feito com a skill `video-cartoon-animado`. O planejamento segundo a segundo está em `beat_sheet.md`.

- `index.html`: cenas, câmera, efeitos e legendas (`render(t)` determinístico)
- `events.json`: eventos de SFX e curva de vento exportados da página (`node export_events.js`)
- `make_audio.py`: música, SFX e vento ambiente seguindo a força do vento das cenas (`audio/trilha.wav`)
- `preview.js` / `render.js`: prints em instantes escolhidos / render completo para `video_mudo.mp4`

```
NODE_PATH=$(npm root -g) node export_events.js && python3 make_audio.py
NODE_PATH=$(npm root -g) node render.js
ffmpeg -i video_mudo.mp4 -i audio/trilha.wav -af loudnorm=I=-14:TP=-1.5 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart video/poder_do_vento_9x16.mp4
python3 ../kit/static_check.py video/poder_do_vento_9x16.mp4
```
