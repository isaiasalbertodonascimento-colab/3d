---
name: curta-3d-curiosidade
description: >
  Produz, de graça e de ponta a ponta, um curta vertical 9:16 em 3D estilo "massinha" sobre uma curiosidade
  (corpo humano, ciência, animais, "e se..."): roteiro em loop de curiosidade, narração com voz grátis (FreeTTS)
  ou gravada, cenas 3D em Three.js renderizadas no Chromium, legendas karaokê, zoom de impacto, trilha sintetizada
  e montagem em MP4 com ffmpeg — sem API paga. Use sempre que o usuário pedir um vídeo curto/Shorts/Reels/TikTok
  em 3D explicando uma curiosidade, "vídeo estilo curiosidades 3D", "o que acontece se...", um explicativo animado
  do corpo humano, ou quiser refazer/estender os curtas do repositório, mesmo que não diga "Three.js" nem "skill".
---

# Curta 3D de curiosidade (versão grátis, Three.js)

Um tema vira `projetos/<slug>/final.mp4`: 1080×1920, 30 fps, 20–60 s. Tudo roda local
(Three.js + Playwright + ffmpeg + numpy); a única coisa de fora é a voz grátis do FreeTTS.

O que faz esse formato prender: **cada frase abre uma pergunta antes de fechar a anterior**,
cortes a cada 2–4 s alternando plano aberto (personagem) e close/corte anatômico, e um
"tranco" visual (zoom + tremida) nas revelações. Leia `references/roteiro.md` antes de
escrever o roteiro e `references/cenas.md` antes de escrever as cenas.

## Ferramentas

Scripts em `scripts/` desta skill (chame com o caminho completo; `SK` abaixo = pasta da skill).
Rode tudo **da raiz do repositório** (onde fica `node_modules/`).

| passo | comando |
|---|---|
| criar projeto | `bash $SK/scripts/novo_projeto.sh <slug>` |
| alinhar voz → timeline | `python3 $SK/scripts/timeline.py projetos/<slug>` |
| stills de conferência | `node $SK/scripts/render.js projetos/<slug> --stills 1,4.5,9` |
| renderizar quadros | `node $SK/scripts/render.js projetos/<slug> --jobs 3` |
| trilha | `python3 $SK/scripts/musica.py projetos/<slug> --clima curioso` |
| montar MP4 | `python3 $SK/scripts/montar.py projetos/<slug>` |

## Fluxo

### 1. Roteiro → `projetos/<slug>/beats.json`

Crie o projeto e escreva o roteiro seguindo `references/roteiro.md`: 4–7 beats, 1–3 frases
cada, 60–130 palavras no total (≈ 25–50 s). Cada beat tem 1–3 shots; cada shot aponta para
uma cena de `scenes.js` que você vai escrever.

```json
{
  "titulo": "Chiclete fica 7 anos na barriga?",
  "voz": "pt-BR-AntonioNeural",
  "titulos": { "gancho": "CHICLETE FICA<br><em>7 ANOS</em><br>NA BARRIGA?", "final": "SÓ NO <em>MITO</em>" },
  "beats": [
    { "id": "gancho", "tag": "MITO?", "narracao": "Dizem que chiclete engolido fica sete anos no estômago. Mas será verdade?",
      "shots": [
        { "cena": "menino", "camera": "push_in", "descricao": "menino engole chiclete rosa", "args": { "acao": "engolir" } },
        { "cena": "esofago", "camera": "tilt_down", "impacto": true, "descricao": "corte: bolinha descendo" } ] }
  ]
}
```

`camera`: `push_in`, `pull_out`, `pan_left`, `pan_right`, `tilt_up`, `tilt_down`, `orbit`, `static`.
`impacto: true` = zoom-soco + tremida + flash + baque na trilha; use em 1 de cada 2–3 shots, nas revelações.
`tag` aparece como etiqueta amarela no topo (ex.: "MITO?", "FATO #1", "O PULO DO GATO").

Confira os fatos (números, nomes): o vídeo afirma coisas para muita gente. Na dúvida, suavize
("pode", "cerca de") ou corte.

**Pare e mostre ao usuário**: as falas beat a beat e o que aparece em cada shot, em lista legível
(não o JSON cru). Só siga com aprovação — refazer narração e cenas depois custa caro.

### 2. Narração

**Padrão: FreeTTS (grátis).** Chame `text_to_speech` do conector TTS **uma vez** com a narração
inteira, **uma frase por parágrafo** (junte as frases com uma linha em branco), `voice` do beats.json
(pt-BR: `pt-BR-AntonioNeural` masculina, `pt-BR-FranciscaNeural` feminina) e `speed` entre 5 e 10
(ritmo de short). Baixe o link para `projetos/<slug>/audio/narracao_raw.mp3` com `curl` — o arquivo
expira em 1 hora. Uma única chamada = só uma vinheta "FreeTTS" no fim, que o `timeline.py` corta.
Sem conta FreeTTS há limite diário compartilhado; se acabar, diga ao usuário e ofereça as alternativas.

**Alternativas:** o usuário grava a própria voz (uma frase por vez, ~1 s de pausa entre frases) e
salva como `audio/narracao_raw.wav`; ou outra TTS que ele tenha. O resto do fluxo é igual.

Rode `timeline.py`. Ele casa cada pausa da fala com uma fronteira de frase e imprime a tabela de
tempos. **Leia a saída**: se aparecer `[AVISO] ... proporcional`, as legendas podem sair
desalinhadas — normalmente uma frase com pausa interna longa ou frases curtas demais ("E falham.")
grudadas. Ajuste o texto (ou divida/junte frases) e gere a voz de novo. Shots marcados
`longo (>4,5s)` pedem mais um shot naquele beat.

### 3. Cenas 3D → `projetos/<slug>/scene/scenes.js`

O modelo copiado já tem `engine.js` (não mexa: câmera, cortes, impacto, legendas, títulos) e
`lib.js` (peças de massinha: `studio`, `kid`+`posekid`, `blob`, `tube`, `cut`, `clay`/`wet`/`glow`,
`particles`). Escreva uma função por cena seguindo `references/cenas.md`; para temas de corpo
humano, parta do exemplo testado em `assets/exemplo-chiclete/`. Reaproveite uma cena em
vários shots variando `args` e `camera` — 3 a 6 cenas bem-feitas rendem mais que 12 apressadas.

### 4. Conferir antes de renderizar

Gere stills no meio de **cada** shot (o render imprime qual shot caiu em cada tempo) e **olhe as
imagens** com a ferramenta de leitura. Procure: personagem/objeto enquadrado e grande o bastante,
legenda sem cobrir o assunto (ela ocupa y≈880–1100 de 1280), nada estourado de luz ou escuro demais,
corte anatômico mostrando o interior. Corrija e repita até ficar bom — é muito mais barato que
re-renderizar o vídeo. Erros de JavaScript aparecem como `PAGEERR:` e interrompem.

### 5. Renderizar, trilha, montar

`render.js` roda em CPU (SwiftShader): com 4 núcleos e `--jobs 3`, ~2–3 quadros/s, ou seja, 30 s
de vídeo (≈ 900 quadros) em ~6 min. Use `--jobs` = núcleos − 1, rode em segundo plano e acompanhe
contando arquivos em `frames/`. Ele retoma de onde parou se cair. Se mudar uma cena depois de
renderizar, apague só os quadros daquele shot (`--from`/`--to` = início/fim × 30) e rode de novo.
Depois `musica.py` (`--clima curioso | tenso | leve`) e `montar.py`. Extraia 3–4 quadros do
`final.mp4` (`ffmpeg -ss T -i final.mp4 -frames:v 1 x.jpg`) e confira antes de entregar.

### 6. Entregar

Mostre o vídeo ao usuário, com duração e o que dá para ajustar (voz, ritmo, cenas, cores). Não
versione `frames/` nem `stills/` (o `novo_projeto.sh` já põe no `.gitignore`); `final.mp4`,
`beats.json`, `timeline.json`, `scene/` e `audio/narracao.wav` + `musica.wav` bastam para refazer.

## Referências

- `references/roteiro.md` — fórmula do loop de curiosidade, ritmo, exemplos e o que evitar.
- `references/cenas.md` — contrato das cenas, receitas (personagem, corte anatômico, tubo, fluxo de
  partículas), direção de arte e como deixar a renderização rápida.
