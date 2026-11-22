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

## Mãos (desenho novo)
Palma que afina no pulso, dedos com 2 falanges que dobram de verdade, polegar separado, borda suave (sem contorno grosso no estilo macio), dobrinhas nas juntas e unhas discretas.
| Quero… | Use |
|---|---|
| pose da mão | `handL`/`handR`: `relaxed` (padrão), `open`, `wave`, `fist`, `point`, `thumb` (joinha sempre para cima), `peace`, `grip` (com `holdL/holdR`), `claw`, `ok` |
| mão maior/menor | `kit:{handSize:1.15}` |
| sem unha / unha pintada | `kit:{nails:false}` / `kit:{nailColor:'#e2283b'}` |

## Física (kit/anim.js) — tudo determinístico: o mesmo `t` dá o mesmo quadro, então dá para renderizar em pedaços
Unidades: metros e segundos (as mesmas do mesh). Gravidade `G = 12` (cartoon, um pouco mais "snappy" que a real).
| Quero… | Use |
|---|---|
| personagem com física no corpo todo | `guy({... t, path: tt=>[x(tt), y(tt)]})` — `path` é a MESMA posição que você dá ao mesh (x = horizontal na tela, y = altura). Opcional: `mass` (2 pesado, .6 leve), `physGain`, `physFlip`, `tired:false` |
| pulo com gravidade de verdade (altura decide o tempo no ar) | `const J=jump(u,t0,.5)` -> `mesh.y += J.y`; passe `sq:J.sq` ao guy; `J.phase` ('pre','air','land'), `J.T` (tempo no ar) |
| queda de uma altura com quiques | `fall(u,t0,1.5,{e:.45})` -> `{y, vy, hit, n, rest}` (`hit` = s desde o último impacto: use para poeira/som/squash) |
| objeto arremessado (livro, bola) | `toss(u,t0,[x,y],[vx,vy],{floor,e,friction,spin})` -> `{x,y,rot,hit,rest}` |
| algo pendurado balançando (lustre, vaso, placa) | `pendulum(u,t0,amp,comprimento,amortecimento)` -> ângulo (rad) |
| empurrão / esbarrão que desliza e freia | `shove(u,t0,v0,atrito)` -> `{x, v}` |
| atraso de uma parte mole (genérico) | `inertia(path,t,k,c)` -> `{d:[dx,dy], v, a}` |

O que o `path` liga sozinho no personagem (`bodyPhys` no chars.js), cada parte com a sua mola:
- **tronco** inclina contra a aceleração e passa do ponto ao frear; inclina para a frente correndo;
- **freada**: pernas travam na frente (derrapagem);
- **cabelo, broto, coque, chaveiro**: mola mole e saltitante; sobem sozinhos em queda livre;
- **braços**: mola solta, atrasam mais que o tronco; na queda levantam e se agitam;
- **cabeça**: mola firme, atrasa pouco;
- **pouso**: squash proporcional ao impacto, joelhos dobram e afastam, corpo afunda, bochechas balançam, pisca;
- **no ar**: estica com a velocidade vertical, encolhe as pernas subindo; a sombra encolhe (`air` automático);
- **velocidade** vira vento na roupa e no cabelo;
- **cansaço**: depois de correr, respira rápido e fundo, boca entreabre, bochecha cora;
- **mass**: pesado atrasa menos e afunda mais no pouso.

## Colisão: ninguém atravessa nada
- Marque móveis, paredes, vasos, troncos e postes com `obj.userData.solid=true`. O modelo (`cenas-novas/index.html`) monta `SOLIDS` com a caixa 3D de cada um.
- Sempre posicione personagens com `place(sprite,x,y,z,escala)`. Ele empurra para fora de obstáculos e de outros personagens, e registra cada caso em `window.COLLIDE`.
- **Antes do render:** `node check.js` (roda a cena inteira sem fotos). O esperado é `0 atravessamentos`. Se acusar algo, corrija a posição ou o trajeto no roteiro, porque o empurrão é só rede de segurança.
- Funções: `solid(boxes,x,z,raio,y)` (pulando acima da altura `h` do obstáculo não conta), `apart(a,b,distMin)`.
- Porta: abra um VÃO na parede (paredes em pedaços). Personagem entrando por parede sem vão é atravessamento.
- Objeto arremessado com `toss` usa `floor` = altura da superfície. Confira que ele termina em cima da superfície (mesa de x0 a x1) e não flutuando fora dela.

## Elenco pronto (personagens originais, estilo macio)
`guy(ator('lia',{x:0,y:0,t,expr:'happy'}))` ou `Object.assign({},CAST.lia,{...})`.
| nome | jeito | visual |
|---|---|---|
| `lia` | planta, curiosa | coque ruivo, óculos, broto, listra dourada |
| `teo` | fogo, esquentado | cabelo curto escuro, agasalho vinho, listra vermelha, chaveiro |
| `nina` | água, calma | chanel azul, presilha, listra azul-clara, broches |
| `davi` | terra, forte e gentil | cacheado, pele escura, óculos, agasalho verde |
| `bia` | vento, agitada | chanel loiro, sardas, cílios, roxo com listra branca |
| `caio` | raio, rápido | ruivo curto, sardas, cinza-escuro com listra amarela |
| `maya` | lua, misteriosa | coque preto, brinco, roxo com listra lilás |
| `rafa` | gelo, tímido | cacheado castanho, bochecha corada, listra verde-água |
| `prof` | diretor | grisalho, óculos, agasalho marrom |

## Cenários novos (`cenas-novas/index.html`)
- **Sala de aula** (`ENV.sala`): quadro-negro com desenho a giz, 6 carteiras com cadeira, janela em arco, lustre pendurado (`ENV.lamp`, pêndulo), porta com vão (`ENV.door`), relógio (`ENV.hand1`), armário com globo e plantas.
- **Estufa** (`ENV.estufa`, x+40): paredes e telhado de vidro em grade de ferro, bancadas com vasos, vasos pendurados (`ENV.hang`, pêndulo), girassóis, regador (`ENV.can`), céu de pôr do sol.
- **Pátio ao entardecer** (`ENV.patio`, x+80): claustro com arcos, fonte com jato (`ENV.jet`), postes acesos, árvores, bancos, bandeirinhas (`ENV.flags`), bola (`ENV.ball`).
- Troca de cenário: `show('sala'|'estufa'|'patio')`. Câmera: `camAt(OX,[pos],[alvo],fov)`. Demo de 12 s com roteiro, eventos (`export_events.js` tira os tempos dos quiques da própria física), trilha e render.
