# E se você fosse um mentalista? (9:16, ~1:34, legendas contínuas, final "A ou B")

13 blocos de texto sem buraco entre eles (`d = dur + 0,2 s`). Quarto (S0–S3, S7–S11) e rua no pôr do sol (S4–S6, S12).
- Montagem: `cenas.js = base.js + scenes.part.js + tail.js` (o `chars.part.js` entra no lugar de `__CHARS__` do `base.js`). Depois `python3 build.py`.
- 4 personagens originais com `put(SPRITE, fn, posição, escala, opções)`; o olhinho dourado do Léo é outro `window.sprout`.
- Objetos de cena em SVG (hoje em `../kit/fx.js`): `lens()` com `IC.finger/shoe/sleeve` (lupa com zoom), `card()` (horóscopo), `arrow()` (seta com rótulo), `coin()`, `watch()` (pêndulo de hipnose), `elephant()` + `bubble()` (nuvem de pensamento), `cardsFan()`, `remote()`, `cake()`, `medCross()`, `tag()` (etiqueta brilhando presa num ponto 3D), `stamp()` (carimbo), `qmark()` (? que vira ✓), `book()`, `snap()` (estalo de dedos), `bar()` (barra de porcentagem).
- Final com "PRÓXIMO VÍDEO? A ou B": cena S12 (`abChoice()` no `fx.js`).
- Narração opcional: `timing.json` veio da voz Piper (ver SKILL.md, "Narração").
