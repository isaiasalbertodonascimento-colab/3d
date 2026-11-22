# Referência do kit (`kit/chars.js` + `kit/anim.js`)

Todas as opções dos personagens, da câmera e dos efeitos. Personagem = `guy({...})` (devolve SVG); cabeça = `head({...})`.

## Referência rápida do kit
| Quero… | Use |
|---|---|
| personagem nunca parado (OBRIGATÓRIO em todo `guy`) | `guy({t, seed:2, ...})`. `seed` diferente por personagem; `blink`/`look` passados explicitamente têm prioridade. |
| mínimos detalhes: cabelo e camiseta ao vento | vêm juntos com `t`. Ajuste por cena: `wind:0` (sala fechada) a `wind:1.5` (mar, telhado, corrida), `windDir:±1`. Correndo, use `wind` ≥1 e `windDir` contrário ao movimento. |
| mãos com dedos (padrão) e gestos | `handL`/`handR`: `'relaxed'` (padrão), `'open'`, `'wave'` (tchau), `'fist'`, `'point'`, `'thumb'` (joinha, sempre para cima: dobre o antebraço, ex. `aR:70,eR:-95`), `'peace'`, `'grip'` (automático com `holdL`/`holdR`). Escolha o gesto pela emoção da cena: apontar ao explicar, punho com raiva, joinha no fim. |
| detalhes do rosto e corpo | automáticos: cílios, brilho nos olhos, orelhas com vento/susto, bochechas coradas ao rir, rugas na camiseta ao dobrar, tênis com cadarço. Controláveis: `blush:0..1` (vergonha), `browUp:-1..1`, `cold:true` (vapor no frio), `air:-j.y` no pulo (a sombra fica no chão). |
| visual por personagem | `kit:{hairStyle:'curly'\|'straight'\|'afro'\|'ponytail'\|'bald', hair:'#cor'}`, `freckles`, `mole`, `glasses`, `cap` (+`capColor`), `phones`, `backpack`, `watch`, `shirtStyle:'stripes'\|'hoodie'` (+`kit.stripe`), `shorts`. Dê a cada personagem uma combinação própria. |
| rosto extra | `expr:'tongue'` (careta), dentes automáticos em `laugh`/`happy`, baba no `sleep`, ruga de medo e veia 💢 de raiva automáticas, `eyeFx:'heart'\|'star'\|'spiral'`. Boca com vogais: `Object.assign(o, talkV(t))` no lugar de `mouth:talk(t)`. |
| ação rápida | `trail(o, dx, dy, 3)` (cópias fantasmas atrás). Andando/correndo já solta poeira; `moveDir:±1` = lado para onde anda. |
| gestos prontos | `gesture:'crossed'\|'hips'\|'scratch'\|'facepalm'\|'think'\|'shrug'\|'dance'`. Mão em qualquer ponto: `reachR:[x,y]` (cabeça = 0,0; pés = 712), com `front:'R'` para a mão passar na frente do rosto. |
| outros personagens | criança: `kid:true, kit:KIDKIT`. Idoso: `kit:ELDER, hunch:true, holdR:cane()`. Bichos: `dog({t,walk,dir})`, `cat({t,walk,dir})` (patas tocam o chão em y=150). |
| emoção e efeitos no boneco | `emote:'hearts'\|'cloud'\|'zzz'\|'stars'\|'idea'\|'question'`. `poof(p)` troca de roupa com fumaça (mude o visual em p>.5). `rim:'#ff9a5a', rimDir:±1` (luz de contorno no pôr do sol/noite). Unhas automáticas; `kit:{nailColor:'#e2283b'}` pinta. Sombra de contato nos pés automática. |
| cenário reagindo | `const [dx,dy,rz]=quake(t,t0)` somado no mesh do objeto (grito, pisão, explosão). |
| reações fortes | `lookCam:true` (olha para quem assiste), `tears:'drip'\|'stream'`, `rage:0..1` (rosto enche de vermelho; >0.6 solta fumaça nas orelhas), `melt:0..1` (derrete com poça), `frozen:true` (bloco de gelo tremendo), `perch:'bird'\|'butterfly'`. Ao falar (`mouth`), a cabeça balança sozinha. Sombra suave no queixo automática (`shade:false` tira). |
| mais bichos | `birdy({t,sit,dir})`, `butterfly(t)`, `fish({t,dir})`, `chicken({t,walk,dir})`, `cow({t,walk,dir})`, `rat({t,walk,dir})`. |
| pegadas 3D | `import {footprints, stepsAlong} from '../kit/props3d.js'`; `fp=footprints(THREE, grupo)`; a cada quadro `fp.set(stepsAlong(caminho, t))`. Exemplo: `cena-quarto/` (pegadas: `props3d.js`). |
| realismo 2D | `light:{color,az,amt}` (luz do cenário: pôr do sol `#ffb070`, noite `#8fa8ff`, floresta `#b8e0a0`; `az` = de onde vem a luz). Gingado de ombros, dobras da roupa andando, peito respirando, cabelo em dois tons com brilho, grão na pele e cabelo/roupa atrasando no pouso: automáticos. `eyeRefl:'window'\|'sun'`, `dirt:0..1`, `scratch`, `bandage`, `sink:px` + `sinkType:'grass'\|'snow'`, `squeeze:0..1` (aperta o objeto na mão). Vento >0.9 cola a camiseta. |
| de lado e de costas | `view:'side'` (perfil; `dir:±1` vira; braço/perna da frente e de trás: `aF/eF/aB/eB`, `legF/legB`, `handF/handB`, `holdF/holdB`; anda/corre com `walk`/`run`) e `view:'back'` (de costas, mesmos parâmetros do de frente). Use de lado para correr/andar atravessando a tela e de costas quando ele vai embora ou olha a paisagem. |
| mais realismo | `weight` (troca de perna parado, automático), `wet:0..1` (roupa escura pingando), `snowCap:0..1` (neve na cabeça e ombros), `teary`, `pupil:0.6..1.5` (luz forte/escuro/apaixonado), `fuzz` (pelinhos), `jiggle` (bochecha no impacto; automático no pouso), `castShadow:{type:'leaves'\|'bars'\|'window', shift, amt}` (sombra do cenário; anime `shift`). Com `light`, a borda de luz entra sozinha. Sombra de contato no corpo e orelha batendo na corrida: automáticos. `swing(p,a0,a1,e0,e1)` (arco com follow-through) e `hesitate(u,t0,dur)` (pausa olhando antes de agir) no `anim.js`. |
| 3/4 e virar | `view:'3q', dir:±1` (meio de lado, ótimo para conversas). Para girar no meio da cena: `Object.assign(o, turn(graus))` animando de 0 (frente) → 90 (lado) → 180 (costas); `sxMul` esconde o pulo entre vistas. |
| posturas e joelhos | `stance:'sit'\|'crouch'\|'kneel'` (de frente e de lado; `'lie'` = deitado, use sprite quadrado). Joelhos: `kneeL/kneeR` (frente), `kneeF/kneeB` (lado; dobram sozinhos ao andar/correr). Escada: `Object.assign(o, climb(fase))` + subir o mesh a cada degrau. Obstáculo: `hurdle(p)` (pose + `lift` para mover o mesh). |
| interação e carga | `gesture:'highfive'\|'handshake'\|'push'\|'hug'` com `toward:±1` (lado do parceiro); abraço e aperto ficam melhores de lado (`view:'side'`, um com `dir:-1`). Parceiros a ~420 unidades SVG. `gesture:'carry'` (caixa pesada; ande devagar, expressão de esforço). |
| roupas | `outfit:'winter'` (casaco, cachecol voando, gorro com pompom, vapor) ou `'beach'` (camisa florida, shorts, chinelo, óculos escuros); peças soltas: `coat`, `scarf`, `beanie`, `sunglasses`, `floatie`, `flipflops`, `shirtStyle:'hawaiian'`. |
| expressões e fala | novas: `'halfsmile'`, `'suspicious'`, `'bored'`, `'disgust'`, `'smug'`. Fonemas no `talkV(t)`: A, E, O, U, F/V (dente no lábio), L (língua), M/B/P (boca fechada). |
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

## Funções do acabamento de cinema
| Quero… | Use |
|---|---|
| contraluz (halo quente + borda de luz no topo) | `backlight(svgDoPersonagem, '#ffd49a', força)` — no sprite 3D use material transparente (`alphaTest:.02, transparent:true`) |
| debruçado na mesa, cabeça no braço (close) | `slump({t, kit, expr:'bored', glasses, sprout, hand})` — braço tocando a mesa em y≈316 do SVG |
| fundo desfocado | `BokehPass` (em `cena-quarto/index.html`: `focus` = distância câmera→rosto, `aperture` .01–.03 em close) |
| sombra gigante na parede | sprite do personagem com `material.colorWrite=false` + `SpotLight` com sombra atrás dele, apontado para a parede (plano `sombra` do quarto) |
| textura de pintura | `<image href="../paper.png" style="mix-blend-mode:overlay" opacity=".22">` na camada SVG por cima |

## Efeitos de tela e HUD (`kit/fx.js`)
Carregue `<script src="../kit/fx.js"></script>` depois de `chars.js` e `anim.js`. Tudo devolve uma string SVG para a camada 1080x1920. Para `bolt3D`, faça `window.proj=proj` na página. Os filtros `#glow`, `#eball` e `#sglow` ficam no `<defs>` de `exemplo-elevador/head.html`.

| Quero… | Use |
|---|---|
| raio caindo do céu num ponto 3D | `bolt3D(V(x,50,z), V(x,0,z), seed, {w,jag,n,br,op})`, com `strike(u,t0,dur)` para piscar e `flashRect(op)` para o clarão |
| arco elétrico entre dois pontos da tela | `zap(x1,y1,x2,y2,seed,{w,br,jag})`; faíscas em volta: `sparks(x,y,r,t)`; bola de energia: `eball(x,y,r,t)` |
| faíscas laranja de metal raspando | `sparksSVG(x,y,t,n,spread,seed,dirx,g)` |
| contador grande com ponto de milhar | `counterBR(x,y,30000,p,{suf:' °C'})` |
| velocímetro / mostrador de andar | `gaugeSVG(x,y,r,v,vmax)`, `floorSVG(x,y,andar,w,h,piscar)` |
| lupa com zoom num detalhe | `lens(x,y,r,p,IC.finger\|IC.shoe\|IC.sleeve\|svg,'RÓTULO',id)` |
| seta com rótulo apontando algo | `arrow(x1,y1,x2,y2,p,'TEXTO',tx,ty)` |
| carimbo / selo / etiqueta brilhante presa num ponto 3D | `stamp(x,y,p,'TEXTO',cor)`, `tag(x,y,p,'TEXTO',cor)` (use `proj()` do ponto) |
| ? que vira ✓ | `qmark(x,y,p,t,ok)` |
| objetos desenhados | `coin()`, `watch()` (pêndulo), `elephant()` + `bubble()` (pensamento), `cardsFan()` (4 ases), `remote()`, `cake(x,y,s,comido)`, `medCross()`, `book()`, `sunIcon()`, `socket()` (tomada BR), `card()` (horóscopo) |
| estalo de dedos, barra de porcentagem, ZZZ | `snap(x,y,p)`, `bar(x,y,w,p,pct,t)`, `zz(x,y,t)` |
| planta azul explicativa (diagrama técnico) | `diagram(u,t)` (modelo: limitador de velocidade do elevador, rótulos aparecendo um a um) |
| cartaz antigo sépia com selo de data | `otis(u,t)` (modelo: plataforma, corda cortada, selo "1853") |
| legenda 1–3 palavras no meio (Montserrat) | `capSVG(['PALAVRA','OUTRA'],p,y,tamanho,new Set(['OUTRA']))` (veja o render de `exemplo-elevador/sc.part.js`) |
| final "próximo vídeo: A ou B" | `abChoice(v,'TEMA A','TEMA B')` |
| escurecer a tela | `dark(alpha)` |

## Cenários prontos além do quarto
| Cenário | Onde | Destaques |
|---|---|---|
| bairro (dia, pôr do sol, noite, tempestade) | `exemplo-vento`, `exemplo-raio` | casas, árvores, grama com vento, postes e janelas que acendem (`postOn`, `H.win`), chuva, onda de choque |
| centro antigo de SP ao entardecer | `exemplo-elevador` (`CITY`) | fachadas art déco com janelas acesas, pedra portuguesa, marquise, sol rasante |
| poço de elevador em corte | `exemplo-elevador` (`SHAFT`) | 16 andares numerados, cabina com garras de freio, cabos, contrapeso, fosso |
| cabina de elevador por dentro | `exemplo-elevador` (`CAB`) | painel 1–15, portas deslizantes, mostrador, luz de emergência vermelha |

Truque do "broto" trocado: sobrescreva `window.sprout=function(){…}` para desenhar outro símbolo na cabeça (raiozinho, olho, cabelo arrepiado, fumaça). Ele é desenhado dentro da cabeça e acompanha o movimento.

## +138 detalhes de efeito (`kit/fx2.js` e `kit/ambiente3d.js`)
Lista completa com o que cada um faz: `assets/projeto/DETALHES_EFEITOS.md`. Resumo:
- **`FX2.*` (118, SVG de tela):** Personagem (25: corações, tontura, ideia, veia de raiva, fumaça nas orelhas, auréola, chifres, alma, fogo no corpo, gelo…), Ação (30: velocidade, poeira, choque, rachadura, explosão, fogos, vidro quebrando, corte, HQ BUM…), UI e texto (28: faixa de nome, barra de progresso, contagem regressiva, medalha, notificação, círculo à mão, REC, enquadramento de câmera, glitch…), Ambiente (25: chuva, neve, vaga-lumes, folhas, god rays, névoa, lens flare, filme antigo, VHS, confete, brasas, morcegos, neon…), Transição (12: íris, cortina diagonal, letterbox, glitch, queima de filme, xadrez, vazamento de luz…).
- **`AMB3D(THREE).*` (20, Three.js):** vaga-lumes, chuva, neve, poeira, feixe de luz, névoa rasteira, vela, lanterna, bandeira, água, estrelas, lua, nuvens, vapor, faíscas, pássaros, relâmpago, neon, pegadas, brilho no chão. Todos com `update(t)` determinístico.
- Uso: `<script src="../kit/fx2.js"></script>` e `ui.innerHTML += FX2.hearts(x,y,t,1,{s:1})`. No 3D: `import {AMB3D} from '../kit/ambiente3d.js'; const A=AMB3D(THREE); const rain=A.rain(scene); … rain.update(t)`.
- Testar: `node teste-fx/shot.js` (folhas dos 118) e `node teste-fx/amb3d.js` (os 20 do 3D).
