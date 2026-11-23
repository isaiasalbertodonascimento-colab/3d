# E se você acordasse com TREE(3) reais na sua conta? (9:16, 49 s, sem narração)

- `video/tree3_reais_9x16.mp4`: vídeo final
- `scenes.js`: cenas (quarto + espaço); `build.py` monta o `index.html` com o quarto de `cena-quarto/`
- `roteiro.json`, `timing.json`, `beat_sheet.md`: roteiro, tempos e planejamento segundo a segundo
- `make_audio.py`: trilha e efeitos sonoros a partir de `events.json`

Para renderizar de novo, coloque esta pasta dentro de um projeto criado com `novo_projeto.sh` da skill video-cartoon-3d (precisa de `../kit`, `../lib`, `../cena-quarto`, `../fonts`) e rode:
```
python3 build.py
NODE_PATH=$(npm root -g) node export_events.js && python3 make_audio.py
NODE_PATH=$(npm root -g) node render.js
```
