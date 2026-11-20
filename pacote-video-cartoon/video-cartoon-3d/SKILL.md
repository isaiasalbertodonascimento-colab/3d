---
name: video-cartoon-3d
description: Faz vídeos curtos verticais 9:16 (TikTok, Reels, Shorts) de curiosidade em estilo cartoon, com personagens 2D macios dentro de cenário 3D, câmera de cinema, legendas grandes branco/amarelo, música e efeitos, sem narração. Use sempre que o usuário pedir um vídeo de curiosidade, um "E se você tivesse/fizesse…?", um vídeo animado para TikTok ou Reels, personagens cartoon em cenário 3D, ou quiser continuar, melhorar ou animar personagens e cenas nesse estilo (mais animado, mais bonito, mais detalhes, de lado, de costas), mesmo que não diga "skill" nem "3D".
---

# Vídeo cartoon 3D (personagens 2D macios em cenário 3D)

Esta skill traz um **projeto modelo completo**:
- kit de personagens com centenas de opções;
- animação e câmera;
- efeitos;
- detector de trechos parados;
- um quarto 3D com acabamento de cinema;
- um vídeo inteiro de exemplo.

Use o modelo em vez de começar do zero: tudo nele já foi testado e ajustado com o usuário.

## Preferências do usuário (resumo; detalhes em `references/preferencias.md`)
- **Sem narração.** Use só legendas grandes (Anton, branco com destaque amarelo), música e efeitos sonoros. **Sem balões de fala.**
- **Estilo macio** (`style:'soft'`):
  - rosto: sem contorno grosso, pele em degradê, olhinhos de ponto, bochecha rosada;
  - roupa: agasalho de escola com listra na manga, tênis branco.
  - Os personagens são **originais**. Nunca copie personagens, nomes ou marcas das referências do usuário.
- **Cenário 3D aconchegante:** quarto de internato com janela quadriculada, luz de fim de tarde, cortinas roxas, muitas plantas e tom levemente roxo.
- **Muito animado:**
  - o personagem nunca fica parado (sempre passe `t`);
  - algo novo acontece a cada ~1 s;
  - nenhum plano passa de ~4 s;
  - use zoom punch, tremida, whip pan e efeitos na tela.
- **Acabamento de cinema:** fundo desfocado, contraluz com halo quente, bloom, textura de pintura e sombra gigante na parede em momentos de suspense.
- **Mínimos detalhes:** cabelo e roupa ao vento, respiração, piscadas, mãos com dedos e gestos.

## Começo rápido
```bash
bash <pasta-da-skill>/scripts/novo_projeto.sh ./meu-video
```
Isso cria a pasta com:
- `kit/`
- `lib/` (three.js + pós-processamento)
- `fonts/`
- `cena-quarto/` (quarto modelo)
- `exemplo-vento/` (vídeo completo de exemplo)

O script também instala a fonte Anton no sistema. Ela é necessária porque os personagens são desenhados em SVG e viram imagem.

**Requisitos:**
- Node com Playwright global: rode tudo com `NODE_PATH=$(npm root -g)`. Não há servidor: os arquivos são servidos pelo `page.route` do `open.js`/`preview.js`.
- ffmpeg.
- Python com numpy, scipy, Pillow e fonttools+brotli.
- espeak-ng, só para medir o tempo de leitura.

O WebGL roda por SwiftShader, sem flags, a ~0,5–1,5 s por quadro. Rode renders longos em segundo plano.

## Fluxo de um vídeo novo
Copie `exemplo-vento/` para uma pasta nova dentro do projeto, para manter `../kit` e `../lib`, e siga:

1. **Tema e roteiro.** Ache o ângulo surpreendente e confira os fatos. Escreva 6 a 9 blocos curtos em `roteiro.json`, com gancho nos 3 primeiros segundos e pergunta ou CTA no final.
2. **Tempos.** Mede o ritmo de leitura com espeak (fala sem `km/h` etc.) e grava em `timing.json` e `timing.js`, com no mínimo ~4,2 s por bloco. Os WAVs não entram no vídeo.
3. **Beat sheet** (`beat_sheet.md`), obrigatório antes de codar:
   - uma tabela por cena com **uma linha por segundo**, nas colunas `t | plano/câmera | personagem | efeito | SFX`;
   - cada bloco tem 2 a 4 planos;
   - toda linha traz uma ação nova.
4. **Cenas** em `index.html`. Cada cena é `{mood, fov, wind:(u,d)=>…, setup(d){ev(…)}, async up(u,d,t){…}}`:
   - câmera com `camShot`/`camAt2`;
   - personagens como sprites billboard com `guy({...})`;
   - efeitos em SVG na camada de cima, posicionados com `proj()`.

   Para o visual do quarto e o acabamento de cinema, copie o que precisar de `cena-quarto/index.html`: texturas pintadas, plantas, luz com o quadriculado da janela, `BokehPass`, `backlight()`, `slump()` e a sombra gigante.
5. **Eventos e áudio.** Declare os sons com `ev(cena, u, 'nome', ganho)`. Depois rode `node export_events.js`, que gera `events.json` com os eventos e a curva de vento, e `python3 make_audio.py`, que gera a música, os SFX e o vento que acompanha a força do vento na tela.
6. **Prévia.** Rode `node preview.js t1,t2,…`, monte uma folha de contato e **olhe**. Corrija:
   - enquadramento;
   - sprites cortados ou gigantes;
   - câmera atravessando objetos;
   - pontos estourados de luz.
7. **Render.** Rode `node render.js` (para refazer só um trecho: `node render.js quadroIni quadroFim saida.mp4` e emende com ffmpeg). Depois junte o áudio com `loudnorm=I=-14:TP=-1.5`.
8. **Checagem antes de entregar.** Rode `python3 kit/static_check.py video.mp4`. O esperado é **0 trechos parados e 0 planos com mais de 4 s**. Se ele acusar um plano longo onde existe um corte, compare quadros dos dois lados antes de concluir. Confira também 1080x1920, 30 fps, áudio a ~-14 LUFS, e se a legenda bate com a cena em alguns quadros.

## Personagem: o essencial
```js
guy({x:0,y:0,s:1, t, style:'soft', seed:1,
     kit:{hairStyle:'bun', hair:'#a8432a', skin:'#f0a468', shirt:'#22465a', sleeveStripe:'#e0b040'},
     expr:'happy', walk:t*1.8, handR:'wave', aR:150, eR:-30, wind:.8, windDir:-1, sprout:true, glasses:true})
```
- **Vistas:** `view:'front'|'3q'|'side'|'back'` (e `dir:±1`). Para girar no meio da cena: `Object.assign(o, turn(graus))`.
- **Corpo e poses:** `walk`/`run`, `hop()`, `stance:'sit'|'crouch'|'kneel'`, `gesture:'crossed'|'hips'|'scratch'|'facepalm'|'think'|'shrug'|'dance'|'carry'|'highfive'|'handshake'|'push'|'hug'`, `reachR:[x,y]`.
- **Rosto e fala:** expressões `neutral`, `happy`, `laugh`, `shock`, `fear`, `angry`, `sleep`, `smirk`, `bored`, `suspicious`, `disgust`, `smug`, `halfsmile`, `tongue`. Boca falando: `Object.assign(o, talkV(t))`.
- **Close e acabamento:** `slump()` (debruçado na mesa) e `backlight(svg)` (halo de contraluz).
- **Bichos:** `dog`, `cat`, `birdy`, `butterfly`, `fish`, `chicken`, `cow`, `rat`.
- **Lista completa** de opções, câmera e efeitos: `references/kit.md`.

## Erros que já aconteceram (evite)
- **Personagem duro:** esqueceu o `t`.
- **Ação só na legenda:** se a legenda diz "voou", o personagem voa naquele segundo.
- **Sprite cortado:** use viewBox `[-560,-600,1120,1360]` (quadrado `[-1000,-1000,2000,2000]` para quem gira ou voa). Mova pulos pelo **mesh**, não pelo SVG.
- **Escala errada:** criança/personagem perto de cama ~0,78; cabeça de quem dorme ~0,6. Confira contra os móveis.
- **Cena preta:** o grupo do cenário ficou invisível porque `mood()` não incluía o modo novo.
- **`proj()` com a câmera do quadro anterior:** chame `cam.updateMatrixWorld()` (o `proj` do modelo já faz isso).
- **Constante usada antes de criada:** textura usada antes de definida (`const`) trava a página. Se a página não ficar pronta, procure `PAGEERR`.
- **Câmera dentro de objeto:** tudo borrado ou marrom. Afaste ou mova o móvel.
- **Brilho estourado num personagem:** a luz forte bate de perto no sprite. Escureça a cor do material e use mais emissivo só naquele plano.
- **Corte que não "lê":** dois planos parecidos parecem um só. Mude a escala (aberto → close) e ponha um flash.
- **Halo com `alphaTest` alto:** o halo some ou fica duro. Use material transparente nesse sprite.

## Referências
- `references/preferencias.md`: tudo que o usuário já pediu, para seguir como padrão.
- `references/kit.md`: tabela completa do kit e das funções de cinema.
- `assets/projeto/cena-quarto/DETALHES.md` e `DETALHES_PERSONAGENS.md`: o que compõe o visual do quarto (115 detalhes) e dos personagens (116 detalhes).
- `assets/projeto/exemplo-vento/`: vídeo completo, com roteiro, beat sheet, 8 cenas, eventos, trilha e render.
