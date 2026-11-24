# Caramelo-raptor (3D realista, 9:16)

Vídeo de humor de 26 s com um vira-lata caramelo com corpo de raptor, numa rua de bairro ao pôr do sol.

- `caramelo_raptor.mp4`: vídeo final (1080x1920, 30 fps, ~-14 LUFS).
- `dog.js`: rig procedural do personagem. `sdf.js`: malha orgânica (SDF + Surface Nets). `fur.js`: pelo em camadas.
- `cat.js`: gato rajado. `world.js`: rua, casas, árvores, céu. `post.js`: profundidade de campo, bloom, grão.
- `main.js`: planos, câmera e legendas. `make_audio.py`: trilha e efeitos.

Render (Playwright + ffmpeg), em pedaços:
```
NODE_PATH=$(npm root -g) node render.js 0 75 partes/c0000.mp4
python3 make_audio.py
```
Prévia: `node preview.js 1,5.2,9.3 pasta_saida`
