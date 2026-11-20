---
name: video-cartoon-animado
description: Use when making a short vertical (9:16) curiosity video in this repo's cartoon style — 2D characters inside 3D Three.js scenery, captions with no narration — or when the user says a video is "parado", "sem graça", or asks for it "mais animado", with more movement, faster cuts or more effects.
---

# Vídeo cartoon bem animado

## Visão geral
O vídeo de Alcatraz (`alcatraz/`) tem o visual certo, mas o usuário achou parado. `kit/static_check.py` mediu **15 s parados em 58 s** e planos de 5–8 s sem corte.
Este repositório já tem as peças para animar de verdade, então não reinvente:
- `kit/chars.js`: personagens com caminhada, corrida, pulo com squash, boca falando e mais expressões.
- `kit/anim.js`: câmera (cortes, zoom punch, tremida, whip pan), física cartoon e efeitos na tela.

**Princípio:** algo novo na tela a cada ~1 s, e nenhum plano com mais de 4 s. Além disso, **todo personagem se mexe o tempo todo**: toda chamada `guy({...})` recebe `t` (o tempo global). Isso liga respiração, balanço do corpo, braços vivos, olhos e piscada automática. Até "congelar de medo" é tremer (`tremble`), nunca ficar estático.

## Fluxo
1. **Copiar o modelo:** copie `alcatraz/` para uma pasta nova, sem `video/` e sem `audio/`. Em `video3d.html`, troque `<script src="chars.js">` por `../kit/chars.js` e `../kit/anim.js`. Ajuste os caminhos `fonts/`, `lib/`, `grain.png` e `timing.js` (ou copie esses arquivos). Exponha `window.GROUPS=GROUPS` depois de `setup()`, para `talk(t)` funcionar.
2. **Roteiro e tempos:** siga os passos 1 a 3 da skill `producao-video-curto`. Sem narração, os tempos de leitura podem vir do espeak; só os WAVs ficam de fora do vídeo.
3. **Beat sheet (OBRIGATÓRIO antes de codar):** uma tabela por cena com **uma linha por segundo**, nas colunas `t | plano/câmera | personagem (ação + rosto) | efeito na tela | SFX`.
   - Toda linha precisa ter uma ação de personagem ou de câmera diferente da linha anterior.
   - Cada bloco de legenda leva de 2 a 4 planos.
4. **Eventos:** declare os momentos fortes uma vez só, em `const EV=[[cena,u,'thud'],…]`. Use a mesma tabela na animação (`evAt(EV,cena,'thud')`) e no áudio, exportando-a para `events.json`, que o `make_audio.py` lê.
5. **Codar as cenas** com o kit. Veja a referência rápida abaixo.
6. **Prévia:** monte uma folha de contato com 2 quadros por plano (veja `alcatraz/preview3d.js` e `sheet.py`) e corrija o enquadramento.
7. **Render**, depois **`python3 kit/static_check.py video.mp4`**. A entrega exige **0 trechos parados e 0 planos com mais de 4 s**. Se aparecer algum, volte ao beat sheet daquele trecho, adicione ação e renderize de novo.

## Referência rápida do kit
| Quero… | Use |
|---|---|
| personagem nunca parado (OBRIGATÓRIO em todo `guy`) | `guy({t, seed:2, ...})`. `seed` diferente por personagem; `blink`/`look` passados explicitamente têm prioridade. |
| andar / correr | `guy({walk:t*1.8})`, `guy({walk:t*3, run:true, lean:12})`. Pernas, braços e balanço vêm juntos. |
| pular com squash | `const j=hop(u,t0)`. Aplique `sq:j.sq` no `guy` e mova o **mesh** com `mesh.position.y+=-j.y*K`. |
| esticar / achatar / inclinar | `sq` (+ achata, − estica), `lean` (graus), `bob` (px) |
| boca falando junto da legenda | `mouth:talk(t)` |
| piscar / olhar nervoso | `blink:blink(t,seed)`, `look:darting(t)`, `lookY` |
| expressões | `expr:'neutral'\|'smirk'\|'happy'\|'laugh'\|'fear'\|'angry'\|'shock'\|'sleep'` |
| tremer de medo | `rot:tremble(t)` ou somar `tremble(t,.01)` na posição |
| objeto quicando / entrando com mola | `bounce(u,t0,h)`, `spring(u,t0)` |
| vários planos num bloco | `const s=shots(u,[0,1.3,2.6],d)`, depois `switch(s.i)` com `s.v` como tempo local |
| zoom punch | `cam.fov=base*punch(u,t0); cam.updateProjectionMatrix()` em **todo** quadro |
| tremida de impacto | `const [dx,dy]=shake(u,t0)`. Some em `cam.position` e no lookAt. |
| whip pan | some `whip(s.v,s.d)*2` em X no lookAt e desenhe `speedLines(Math.abs(whip(...)))` |
| efeitos na tela | `popText('POW!',x,y,p)`, `sweat(x,y,u)`, `emanata(x,y,p)`, `sparkle(x,y,u)`, `puff(x,y,p)`, `counter(x,y,0,50,p,{pre:'+'})`, `burst()` |
| posição de um efeito sobre algo 3D | `proj(x,y,z)` (já chama `cam.updateMatrixWorld()`) |

## Erros comuns
- **Sprite cortado ao andar, correr ou erguer os braços:** use um viewBox maior para personagens animados, `[-560,-600,1120,1360]`. Mova pulos e quedas pelo **mesh**, não pelo `y` do SVG.
- **Esquecer o `fov` base ao trocar de cena:** o `punch` multiplica o fov. Guarde `SC[i].fov` e reaplique a cada quadro.
- **Efeito projetado no lugar errado:** só chame `proj()` depois de posicionar a câmera no quadro.
- **Personagem duro entre ações:** esqueceu o `t` no `guy()`. Sem ele o boneco fica 100% estático entre um gesto e outro.
- **Ação só na legenda:** se a legenda diz "correu", o personagem corre naquele segundo. O texto nunca substitui a ação.
- **Cena 3D trocando de grupo:** confira o `mood()`. `CELL.visible` precisa incluir todos os modos da cela (o bug de tela preta das cenas `night`/`morning`).
- **Render lento:** são ~0,45 s por quadro com SwiftShader, ~13 min por minuto de vídeo. Rode em segundo plano e faça as prévias com poucos instantes.
