# Detalhes de efeito novos (118 em 2D + 20 em 3D)

Tudo em `kit/fx2.js` (SVG de tela, assinatura `FX2.nome(x, y, t, p, o)`) e `kit/ambiente3d.js` (Three.js, `AMB3D(THREE).nome(pai, opções)` devolve `{obj, update(t)}`).
- **x, y**: centro do efeito na tela; para efeitos de personagem, o centro da cabeça. Efeitos de tela cheia ignoram x,y.
- **t**: tempo em segundos. **p**: 0 a 1 (progresso ou intensidade). **o**: `{s: escala, dir: ±1, txt, col, ...}`.
- Veja todos desenhados: `node teste-fx/shot.js` (gera `teste-fx/folha_N.png`) e `node teste-fx/amb3d.js` (3D).

## Personagem (25)
| # | nome | o que faz |
|---|---|---|
| 1 | `hearts` | corações subindo (amor) |
| 2 | `dizzyStars` | estrelinhas girando na cabeça (tontura) |
| 3 | `ideaBulb` | lâmpada de ideia com raios |
| 4 | `angerVein` | veia de raiva (💢) pulsando |
| 5 | `steamEars` | fumaça saindo das orelhas |
| 6 | `blushLines` | riscos de vergonha nas bochechas |
| 7 | `coldSweatBig` | gota grande de suor escorrendo |
| 8 | `questionBurst` | interrogação explodindo em faíscas |
| 9 | `exclaim` | exclamação vermelha batendo |
| 10 | `musicNotes` | notas musicais flutuando |
| 11 | `sparkleEyes` | brilhos de estrela nos olhos |
| 12 | `tearDrop` | lágrima escorrendo pela bochecha |
| 13 | `sighCloud` | nuvem de suspiro saindo da boca |
| 14 | `fireAura` | chamas em volta do corpo (raiva/poder) |
| 15 | `iceShiver` | cristais de gelo e tremedeira |
| 16 | `sickGreen` | nuvem verde de enjoo com riscos de fedor |
| 17 | `skullDeath` | caveira subindo (morreu) |
| 18 | `ghostSoul` | alma saindo da cabeça |
| 19 | `angelHalo` | auréola brilhante sobre a cabeça |
| 20 | `devilHorns` | chifrinhos de diabo |
| 21 | `sneezeSpray` | perdigotos de espirro |
| 22 | `angryRedFace` | rosto vermelho pulsando (raiva) |
| 23 | `lovePulse` | ondas de coração pulsando em volta |
| 24 | `thinkDots` | reticências pensando |
| 25 | `surpriseLines` | riscos de espanto saindo dos lados |

## Ação (26)
| # | nome | o que faz |
|---|---|---|
| 26 | `speedStreak` | riscos de velocidade atrás do corpo (o.dir = ±1) |
| 27 | `dustTrail` | poeira atrás dos pés |
| 28 | `shockwaveRing` | anel de choque se expandindo |
| 29 | `groundCrack` | rachadura no chão |
| 30 | `jumpArc` | arco pontilhado de pulo |
| 31 | `swooshArc` | arco de golpe (swoosh) em foice |
| 32 | `spinLines` | riscos circulares de giro |
| 33 | `landingRings` | anéis de pouso no chão |
| 34 | `afterimageBars` | rastro de imagens fantasma (barras translúcidas) |
| 35 | `bounceMarks` | tracinhos de quique em volta do ponto de impacto |
| 36 | `debrisBurst` | estilhaços voando |
| 37 | `comicBoom` | explosão de HQ com texto (o.txt) |
| 38 | `glassShatter` | vidro rachando em teia |
| 39 | `slashLine` | corte diagonal brilhante |
| 40 | `waterRipple` | ondas na água |
| 41 | `smokeCloud` | nuvem de fumaça cinza crescendo |
| 42 | `explosion` | explosão laranja com núcleo branco |
| 43 | `fireworkBurst` | fogos de artifício |
| 44 | `impactFlash` | clarão radial de impacto |
| 45 | `wobbleLines` | linhas de vibração em volta do objeto |
| 46 | `groundShadow` | sombra suave no chão (o.w largura) |
| 47 | `skidMarks` | marcas de derrapagem |
| 48 | `rocketFlame` | chama de propulsão/jato |
| 49 | `ripplePunch` | onda de soco (círculos concêntricos) |
| 50 | `trailDots` | rastro de pontinhos atrás do movimento |
| 51 | `sparkTrail` | faíscas caindo (metal raspando) |

## UI e texto (25)
| # | nome | o que faz |
|---|---|---|
| 52 | `lowerThird` | faixa com nome e subtítulo (o.name, o.sub) |
| 53 | `progressBar` | barra de progresso (p = preenchimento) |
| 54 | `countdownRing` | anel de contagem regressiva (o.n) |
| 55 | `checkItem` | item de lista com ✓ aparecendo (o.txt) |
| 56 | `achievementBadge` | medalha de conquista com brilho |
| 57 | `toast` | notificação que desce do topo (o.txt) |
| 58 | `likeHeart` | botão de curtir pulsando |
| 59 | `bellRing` | sininho de inscrição tocando |
| 60 | `bigArrow` | seta grande quicando (o.dir graus, 0=baixo) |
| 61 | `circleHighlight` | círculo desenhado à mão em volta de algo (o.r) |
| 62 | `scribbleUnderline` | rabisco sublinhando |
| 63 | `spotlightMask` | escurece a tela deixando um círculo de foco |
| 64 | `newsTicker` | faixa de notícia rolando embaixo (o.txt) |
| 65 | `recIndicator` | bolinha REC piscando |
| 66 | `viewfinder` | moldura de câmera com cantos |
| 67 | `glitchText` | texto com falha RGB (o.txt) |
| 68 | `dateStamp` | etiqueta de data/local estilo documentário (o.txt) |
| 69 | `timerClock` | relógio de ponteiro correndo |
| 70 | `percentRing` | anel de porcentagem (p = valor) |
| 71 | `versusBadge` | selo VS com raios |
| 72 | `rankMedal` | medalha de ranking (o.n) |
| 73 | `starRating` | cinco estrelas acendendo |
| 74 | `hashtagTag` | etiqueta #hashtag (o.txt) |
| 75 | `popCounter` | contador que pula ao mudar (o.v) |
| 76 | `quoteMarks` | aspas grandes decorativas |

## Ambiente (29)
| # | nome | o que faz |
|---|---|---|
| 77 | `rainOverlay` | chuva diagonal em duas camadas |
| 78 | `snowOverlay` | neve caindo balançando |
| 79 | `fireflies` | vaga-lumes piscando |
| 80 | `leavesFalling` | folhas girando caindo |
| 81 | `dustMotes` | partículas de poeira no ar |
| 82 | `godRays` | raios de luz diagonais (o.col) |
| 83 | `fogLayer` | névoa rolando na base da tela |
| 84 | `lensFlare` | reflexo de lente com círculos (x,y = fonte) |
| 85 | `bokehBalls` | bolas de bokeh coloridas flutuando |
| 86 | `filmScratches` | riscos e pó de filme antigo |
| 87 | `vhsScanlines` | linhas de TV/VHS com tremida |
| 88 | `vignettePulse` | vinheta pulsando (suspense) |
| 89 | `heatHaze` | ondulação de calor (linhas translúcidas) |
| 90 | `lightningFlash` | relâmpago de tela cheia piscando |
| 91 | `confetti` | confete colorido caindo |
| 92 | `embers` | brasas subindo |
| 93 | `bubblesRise` | bolhas subindo |
| 94 | `petals` | pétalas de flor caindo |
| 95 | `twinkleStars` | estrelas do céu cintilando |
| 96 | `cloudsDrift` | nuvens deslizando no alto |
| 97 | `birdsV` | bando de pássaros em V cruzando |
| 98 | `batsFlock` | morcegos voando |
| 99 | `smokeColumn` | coluna de fumaça subindo (x,y = base) |
| 100 | `neonFlicker` | moldura de neon piscando (o.col) |
| 101 | `searchlight` | feixe de holofote varrendo |
| 102 | `sunburstBg` | raios de sol giratórios no fundo (o.col) |
| 103 | `halftoneDots` | pontilhado de HQ nos cantos |
| 104 | `cobwebCorner` | teia de aranha no canto |
| 105 | `rainDrops` | gotas escorrendo na lente |

## Transição (13)
| # | nome | o que faz |
|---|---|---|
| 106 | `irisClose` | íris fechando em círculo (p 0→1) |
| 107 | `wipeDiagonal` | cortina diagonal |
| 108 | `letterbox` | faixas pretas de cinema (p = altura) |
| 109 | `glitchBars` | barras de glitch coloridas |
| 110 | `flashFrame` | clarão branco de corte |
| 111 | `filmBurn` | queima de filme laranja |
| 112 | `whipBlurBars` | borrão de whip pan (barras horizontais) |
| 113 | `checkerWipe` | cortina de xadrez |
| 114 | `zoomRings` | anéis concêntricos de zoom |
| 115 | `fadeToColor` | fade para cor (o.col) |
| 116 | `lightLeak` | vazamento de luz laranja nas bordas |
| 117 | `dollyZoomRings` | linhas de fuga (dolly zoom) |
| 118 | `pageFlip` | folha virando (cortina em duas metades) |

## Ambiente 3D (20) — `kit/ambiente3d.js`
| # | nome | o que faz |
|---|---|---|
| 119 | `fireflies` | vaga-lumes que piscam e vagam |
| 120 | `rain` | chuva em riscos |
| 121 | `snow` | neve balançando |
| 122 | `dust` | poeira flutuando no ar |
| 123 | `godRay` | feixes de luz em cone |
| 124 | `fogCards` | névoa rasteira no chão |
| 125 | `candle` | chama de vela tremulando com luz |
| 126 | `lantern` | lanterna balançando com luz |
| 127 | `flag` | bandeira/pano ao vento (malha animada) |
| 128 | `water` | lâmina d'água com ondas |
| 129 | `stars` | céu estrelado cintilando |
| 130 | `moon` | lua com halo |
| 131 | `clouds` | nuvens andando |
| 132 | `steam` | vapor/fumaça subindo de um ponto |
| 133 | `sparksEmitter` | emissor de faíscas com gravidade |
| 134 | `birds` | bando de pássaros em V |
| 135 | `lightning` | relâmpago (luz + valor .flash para overlay 2D) |
| 136 | `neonSign` | letreiro de neon piscando |
| 137 | `footsteps` | pegadas aparecendo uma a uma |
| 138 | `groundGlow` | brilho pulsando no chão |

Total: 138 detalhes novos.
