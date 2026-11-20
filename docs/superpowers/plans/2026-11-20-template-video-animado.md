# Modelo de vídeo animado: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `template/`, um projeto de vídeo 9:16 pronto para copiar. Nele, o motor 3D de `alcatraz/video3d.html` já usa `kit/chars.js` e `kit/anim.js`, os eventos das cenas viram efeitos sonoros automaticamente, e uma cena demo de 6 s passa no `kit/static_check.py`.

**Architecture:** O motor (renderer, sprites, luzes, legendas, loop de render) fica separado das cenas. `template/engine.js` exporta helpers. `template/scenes.js` contém só as cenas e a tabela de eventos `EV`. `make_audio.py` lê `events.json`, gerado a partir de `EV`, em vez de tempos fixos no código. Todo o render passa por Playwright com `page.route`, sem servidor e sem flags de GPU.

**Tech Stack:** Three.js 0.170 (ES module em `template/lib/`), SVG, Playwright (global, `NODE_PATH=$(npm root -g)`), ffmpeg, Python 3 + numpy/scipy.

**Spec:** `.claude/skills/video-cartoon-animado/SKILL.md` + `CLAUDE.md` (preferências do usuário).

## Global Constraints
- Vídeo 1080x1920, 30 fps, H.264 yuv420p + AAC 192k, loudnorm `I=-14:TP=-1.5`.
- Sem narração. Legendas em Anton, branco com destaque `#ffd23f`, contorno preto, faixa y 1480–1600.
- Personagens 2D (SVG de `kit/chars.js`) em planos billboard dentro do cenário 3D. viewBox do sprite de personagem: `[-560,-600,1120,1360]`.
- Nenhum plano com mais de 4 s. `python3 kit/static_check.py <mp4>` deve reportar **0 trechos parados (limiar 5) e 0 planos > 4 s**.
- Sem servidor HTTP em segundo plano e sem `--enable-unsafe-swiftshader`. Os arquivos são servidos via `page.route('http://video.local/**')`.
- Todo personagem se mexe o tempo todo: toda chamada `guy()` nas cenas recebe `t` (idle de `kit/chars.js`).
- `render(t)` é determinístico: nada de `requestAnimationFrame`, `Date.now()` ou `Math.random()` nas cenas (use `rnd()`).

## Review Focus
1. **Troca de cena deixando tela preta ou fov errado:** ao mudar de cena, a visibilidade dos grupos e o fov base precisam ser recalculados. O `punch` nunca pode acumular entre quadros. Teste: `check.js` renderiza o último quadro de uma cena e o primeiro da seguinte, e os dois têm variância de pixel > 50.
2. **Efeito 2D no lugar errado:** `proj()` chamado antes de posicionar a câmera no quadro. Teste: `engine.test.js` verifica que `proj` do alvo do `lookAt` cai no centro da tela (±2 px).
3. **Personagem cortado:** braços erguidos, corrida ou pulo saindo do viewBox. Teste: `check.js` desenha `guy({walk:.25,run:true,aL:170,aR:170})` no viewBox do sprite e confirma que a borda de 4 px é toda transparente.
4. **Evento com nome sem SFX, ou fora da duração:** `make_audio.py` deve falhar com mensagem clara (`SFX desconhecido: 'xyz'`) e ignorar com aviso eventos depois do fim. Teste em `test_audio.py`.
5. **`timing.json` editado e boca dessincronizada:** `window.GROUPS` precisa ser recalculado no `setup()`, e `talk(t)` volta 0 fora das palavras. Teste em `engine.test.js`: `talk` no meio da 1ª palavra > 0 e no intervalo entre blocos = 0.

---

### Task 1: Motor separado das cenas, com o kit integrado

**Files:**
- Create: `template/engine.js` (renderer, `ctex`, `sprite`, `mood`, `proj`, `camAt`, legendas, `render`), `template/index.html`, `template/scenes.js` (cena vazia de 3 s), `template/open.js` (abre a página com `page.route`, devolve `{b,p,info}`)
- Copy: `alcatraz/lib/three.module.js`, `alcatraz/fonts/anton.woff2`, `alcatraz/grain.png` para `template/`
- Test: `template/engine.test.js`

**Interfaces:**
- Consumes: globais de `kit/chars.js` (`guy`, `head`, `label`, `seg`, `ease`, `back`, `lerp`, `rnd`, `f`, `cl`) e `kit/anim.js` (`talk`, `punch`, `shake`, `shots`, `whip`, `speedLines`, `popText`…).
- Produces (export de `engine.js`):
  - `THREE`, `scene`, `cam`, `V(x,y,z)`, `K = .0021`, `HEADY = 724*K`
  - `sprite(vb:number[4], k:number, res?:number, parent?:Object3D) -> {mesh, set(svg:string):Promise<void>}`. O padrão para personagem é `CHAR_VB = [-560,-600,1120,1360]`.
  - `proj(x,y,z) -> {x,y}` em pixels 1080x1920, chamando `cam.updateMatrixWorld()` antes.
  - `camAt(p:Vector3, l:Vector3, t:number, opts?:{shake?:[dx,dy], whip?:number})`
  - `defineVideo({scenes:Scene[], EV:Array<[number,number,string]>, HL:string[][]})`, em que `Scene = {mood:string, fov?:number, up(u,d):Promise<string>}` e `up` devolve o SVG da UI.
  - Em todo quadro, `render(t)` aplica `cam.fov = (scene.fov ?? 55) * (scene.fovMul ?? 1)`. A cena define `this.fovMul = punch(...)`, que zera a cada quadro.
  - `window.render(t)`, `window.INFO = {total, scenes:[{s,d}]}`, `window.GROUPS`, `window.EVENTS = [{t:abs, name, gain}]`.

- [ ] **Step 1: Write the failing test.** `engine.test.js` usa `open.js` e roda via `node`. Asserts:
  - `INFO.total` = soma de (`dur` + 0,42) dos blocos + 1,6.
  - Depois de `render(1.0)`: `proj(lookAt)` dentro de 540±2 e 960±2.
  - `talk` no meio da 1ª palavra > 0, e `talk(INFO.scenes[1].s - .05)` = 0.
  - `window.EVENTS` com tempos absolutos = `s` da cena + `u`.
  - Nenhum `pageerror`.
- [ ] **Step 2:** `NODE_PATH=$(npm root -g) node template/engine.test.js`. Esperado: FAIL (arquivos não existem).
- [ ] **Step 3:** Implementar `engine.js`, `index.html`, `open.js` e `scenes.js`, extraindo de `alcatraz/video3d.html`.
  - Fica de fora tudo que é específico de Alcatraz: cela, mar, cartazes.
  - O motor mantém só uma sala genérica (`buildRoom({wall, floor})`), luzes e `mood('day'|'night')`.
- [ ] **Step 4:** Rodar o teste. Esperado: `OK` impresso e exit 0.
- [ ] **Step 5:** Commit: `git add template && git commit -m "template: motor 3D separado das cenas com kit integrado"`

### Task 2: Eventos viram efeitos sonoros

**Files:**
- Create: `template/export_events.js` (abre a página e grava `events.json` a partir de `window.EVENTS`), `template/test_audio.py`
- Create: `template/make_audio.py` (a partir de `alcatraz/make_audio.py`; os SFX ficam num dicionário `SFX = {'pop','whoosh','thud','ding','click','step','boing','sting','splash','scrape'}`)

**Interfaces:**
- Consumes: `window.EVENTS` (Task 1).
- Produces: `events.json = [{"t":float,"name":str,"gain":float}]`. `make_audio.py [events.json] -> audio/trilha.wav` (48 kHz estéreo, música + SFX). Um whoosh automático entra em cada início de cena > 0, em `s - .18`.

- [ ] **Step 1: Write the failing test** `test_audio.py`:
  - Gera `events.json` temporário com `[{"t":1.0,"name":"thud","gain":1}]` e uma duração de 3 s. Roda `make_audio.py` com a música desligada (`--sem-musica`). O RMS na janela 1,0–1,2 s deve ser maior que 10× o RMS na janela 0,2–0,4 s.
  - Evento `{"name":"xyz"}` → exit ≠ 0 e stderr contém `SFX desconhecido: 'xyz'`.
  - Evento em t = duração + 2 → exit 0 e stdout contém `aviso: evento fora da duração`.
- [ ] **Step 2:** `python3 template/test_audio.py`. Esperado: FAIL.
- [ ] **Step 3:** Implementar o argumento `--sem-musica`, a leitura de `events.json` e as validações em `make_audio.py`, além de `export_events.js`.
- [ ] **Step 4:** `python3 template/test_audio.py`. Esperado: `OK`.
- [ ] **Step 5:** Commit: `git commit -m "template: eventos das cenas viram SFX via events.json"`

### Task 3: Cena demo de 6 s (prova de que o modelo anima)

**Files:**
- Modify: `template/scenes.js` (troca a cena vazia pela demo), `template/timing.js` + `template/timing.json` (1 bloco: "ELE CORREU, PULOU... E CAIU!", dur 5.5)
- Create: `template/render.js` (igual a `alcatraz/render3d.js`, mas usa `open.js`), `template/check.js`

**Interfaces:**
- Consumes: Task 1 (`sprite`, `camAt`, `defineVideo`, `CHAR_VB`) e Task 2 (`events.json`).
- Produces: `template/demo.mp4`, ignorado no git.

Beat sheet obrigatório, que a cena precisa cumprir. Em todas as linhas o herói recebe `t` (idle sempre ligado):

| t | plano/câmera | personagem | efeito | SFX |
|---|---|---|---|---|
| 0–1 | plano 1, aberto, travelling lateral | entra correndo (`walk:t*3, run:true, lean:12`), `mouth:talk(t)` | `puff` nos pés | step ×3 |
| 1–2 | plano 1 | `hop` em 1,2 s, braços para cima, `expr:'laugh'` | `sparkle` no topo | boing |
| 2–3 | plano 2, close no rosto, `punch` em 2,4 | pousa com squash, depois `expr:'fear'`, `look:darting(t)` | `sweat`, `emanata` | sting |
| 3–4 | plano 3, whip pan | tropeça (`lean` de 0 a 70) | `speedLines` | whoosh |
| 4–5 | plano 3, `shake` em 4,2 | cai (mesh desce), `expr:'shock'` | `popText('PLOFT!')` | thud |
| 5–6 | plano 4, zoom out | levanta tremendo (`tremble`), `expr:'smirk'`, pisca | `counter` 0→1 "QUEDA" | pop |

- [ ] **Step 1: Write the failing test** `check.js`:
  - Renderiza t = 0,5; 1,5; …; 5,5 e salva em `template/preview/`.
  - Cada quadro tem variância > 50.
  - `guy({walk:.25,run:true,aL:170,aR:170})` no `CHAR_VB` tem borda de 4 px 100% transparente (desenhar num canvas e ler alfa).
  - Personagem nunca parado: em 6 instantes com 0,1 s de intervalo dentro de cada plano, o SVG do herói (`HERO.last`) é diferente a cada passo.
  - O último quadro da cena e o primeiro da seguinte (cena 2 = cópia curta da demo) não são pretos.
- [ ] **Step 2:** `NODE_PATH=$(npm root -g) node template/check.js`. Esperado: FAIL (a cena demo ainda não existe).
- [ ] **Step 3:** Implementar a cena demo em `scenes.js` seguindo a tabela, com `shots(u,[0,2,3,5],d)`. Declare cada SFX da tabela em `EV`.
- [ ] **Step 4:** Rodar `check.js` (esperado: `OK`) e olhar `template/preview/` montando uma folha com `alcatraz/sheet.py`.
- [ ] **Step 5:** Gerar o vídeo:
  ```
  cd template
  node export_events.js
  python3 make_audio.py
  node render.js
  ```
  Juntar com ffmpeg (como no LEIA-ME de alcatraz). Depois rodar `python3 ../kit/static_check.py demo.mp4`. Esperado: `trechos parados ... 0` e `planos com mais de 4 s sem corte: 0`.
- [ ] **Step 6:** Commit, sem o mp4: `git commit -m "template: cena demo animada passando no static_check"`

### Task 4: Skill aponta para o modelo

**Files:**
- Modify: `.claude/skills/video-cartoon-animado/SKILL.md`. No passo 1 do Fluxo, trocar "copiar `alcatraz/`…" por "copiar `template/` (sem `preview/` e `demo.mp4`), escrever o roteiro em `timing.json`, apagar a cena demo de `scenes.js`". Na tabela de referência, citar `defineVideo`, `CHAR_VB` e `this.fovMul`.
- Modify: `CLAUDE.md`, com uma linha: "Ponto de partida de vídeo novo: `template/` (ver skill video-cartoon-animado)."

- [ ] **Step 1:** Um subagente, com a skill e a tarefa "planeje uma cena de 6 s" (a mesma do teste de base), deve citar `template/` e `defineVideo` e não inventar helpers que já existem.
- [ ] **Step 2:** Aplicar as edições.
- [ ] **Step 3:** Rodar o subagente. Esperado: o plano usa `template/scenes.js`, `defineVideo`, `hop`/`talk`/`shots`/`punch` e lista no máximo 2 helpers novos, com justificativa.
- [ ] **Step 4:** Commit: `git commit -m "skill: video-cartoon-animado usa template/"`
