# E se houvesse um apocalipse zumbi? — vídeo 3D 9:16 (1:30)

Vídeo vertical (1080x1920, 30 fps, 90 s) de curiosidades e dicas de sobrevivência.

- `video/apocalipse_zumbi_9x16.mp4` — vídeo final
- `audio/script.txt` — roteiro da narração (3ª pessoa)
- `scene/` — cenas 3D (Three.js), legendas e textos
- `render.js` — captura quadro a quadro com Playwright
- `make_music.py` — trilha sonora sintetizada

## Como renderizar de novo
```
npm install
python3 -m http.server 8765 &
node render.js frames 0 2700
ffmpeg -framerate 30 -i frames/f%05d.jpg -i audio/mix.wav -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest video/apocalipse_zumbi_9x16.mp4
```
