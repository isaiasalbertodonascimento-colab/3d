# Preferências do usuário para vídeos curtos

> **Pacote pronto:** tudo foi empacotado na skill `video-cartoon-3d` (`pacote-video-cartoon/video-cartoon-3d/` e o arquivo `.skill`). Ao evoluir o kit aqui, atualize também o pacote e gere o `.skill` de novo.

## ESTILO VISUAL ATUAL (pedido do usuário, vale para todos os próximos vídeos)
Referência: vídeos estilo "Escola de Elementos" (personagens macios em quarto 3D aconchegante). Criar personagens e histórias **originais** nesse estilo, sem copiar personagens, nomes ou marcas do criador.
- **Personagens:** `guy({style:'soft', ...})` do `kit/chars.js`. Sem contorno grosso, pele com degradê suave, olhinhos de ponto, sobrancelha fina, boca pequena, bochecha rosada, cabelo liso em formas lisas (`hairStyle:'bob'|'short'|'bun'|'curly'`), óculos finos marrons (`glasses`), agasalho de escola com listra colorida na manga (`kit.shirt`, `kit.sleeveStripe`), gola branca, tênis branco, corpo esguio. Cada personagem com cabelo/cor de listra próprios; broto na cabeça (`sprout`) ou outro símbolo pequeno para o "elemento".
- **Cenário 3D:** quarto/dormitório aconchegante de internato: janela quadriculada (losangos) com luz de fim de tarde, cortinas roxas, paredes neutras, piso de madeira, tapete estampado, camas com cobertor azul-marinho, criado-mudo com despertador, copo d'água e livro, pôster de planeta, MUITAS plantas (samambaia grande, girassol no vaso, mudinhas no parapeito, trepadeira no chão). Luz quente e baixa, sombras arroxeadas, tom geral levemente roxo/dessaturado, vinheta e grão, aparência de pintura suave.
- **Acabamento de cinema (o que dá o nível das referências):**
  - profundidade de campo: fundo desfocado, foco no rosto (`BokehPass`);
  - contraluz da janela: halo quente e borda de luz no personagem (`backlight(svg, cor, força)` no `kit/chars.js`; sprite com material transparente);
  - bloom nas luzes;
  - textura de papel/pintura por cima (`estilo/paper.png`);
  - sombra gigante de um personagem fora de quadro projetada na parede (sprite invisível com `colorWrite=false` + spot atrás dele);
  - formas limpas no rosto: poros e brilhinhos só se pedir;
  - poses expressivas em close (`slump()` = debruçado na mesa).

  Modelo pronto: `estilo/index.html`, planos `mesa` e `sombra`.
- **Câmera e legendas:** câmera próxima e mexendo, close no rosto nas falas; legendas brancas grandes com destaque amarelo (como antes).

## Estilo que o usuário gosta
- Vídeo de curiosidade vertical 9:16 (TikTok/Reels/Shorts), estilo cartoon.
- Personagens 2D chapados (cabeça redonda laranja, cabelo cacheado, camiseta branca) dentro de **cenário 3D** com câmera próxima e em movimento. Referência pronta: `alcatraz/video3d.html`. Para animar, usar `kit/chars.js` + `kit/anim.js` e a skill `video-cartoon-animado`.
- **Sem narração** (sem voz): só legendas grandes branco/amarelo, música e efeitos sonoros.

## Próximo vídeo: BEM MAIS ANIMADO (pedido explícito do usuário)
O vídeo de Alcatraz foi considerado parado demais. No próximo, os personagens e a câmera precisam se mexer o tempo todo:
- **Personagem se movimentando a TODO momento (pedido do usuário):** nunca fica parado, nem entre ações. Sempre passar `t` no `guy()` do `kit/chars.js` (respiração, balanço, braços, olhos, piscada).
- **Mínimos detalhes (pedido do usuário):** cabelo balançando com o vento, barra da camiseta tremulando, poeira no ar, respiração. Vento no `guy()` com `wind`/`windDir`, mais forte ao ar livre e correndo.
- **Mãos com dedos (pedido do usuário):** sempre mãos com dedos e gestos que combinam com a cena (`handL`/`handR` no `guy()`: tchau, joinha, apontar, punho, paz e amor, segurando objeto).
- **Detalhes do personagem (pedido do usuário):** cílios, brilho nos olhos, bochechas coradas, sobrancelhas expressivas, orelhas mexendo, rugas na camiseta, tênis com cadarço, sombra que acompanha o pulo, vapor no frio (todos no `kit/chars.js`).
- **Mais opções do personagem (pedido do usuário):** dentes na risada, língua de fora, baba dormindo, sardas/pinta, acessórios (boné, óculos, mochila, fone, relógio), boca com vogais (`talkV`), piscada com squash, rastro de poeira e de movimento, roupas e cabelos diferentes por personagem, ruga de preocupação, veia de raiva, olhos de emoji (coração, estrela, tontura). **Sem balões de fala** (o usuário não quer).
- **Ainda mais opções (pedido do usuário):** unhas nas mãos, gestos prontos (braços cruzados, mão na cintura, coçar a cabeça, facepalm, pensando, dar de ombros, dancinha), sombra de contato nos pés, criança, idoso com barba e bengala, cachorro e gato, cenário tremendo com grito/pisão (`quake`), emoções na cabeça (corações, nuvem, ZZZ, estrelas, ideia, ?), "puf" de troca de roupa, luz de contorno.
- **Reações e bichos (pedido do usuário):** cabeça balançando ao falar, olhar para a câmera, lágrimas, raiva subindo com fumaça nas orelhas, derretendo/congelado, passarinho e borboleta pousando, pegadas 3D no chão, mais bichos (passarinho, peixe, galinha, vaca, rato), sombra suave na pele. Sempre 2D nesse estilo.
- **Realismo continuando 2D (pedido do usuário):** luz do cenário no personagem (`light`), gingado de ombros/quadril, dobras da roupa andando, camiseta colando no vento, peito respirando, cabelo com brilho e dois tons, peso no pouso, grão na pele, sapato dobrando, reflexo no olho, sujeira/arranhão/curativo, aperto em objetos, pé afundando na grama/neve.
- **Vistas e ainda mais realismo (pedido do usuário):** personagem de frente, **de lado** (perfil) e **de costas** (`view`); troca de peso, roupa molhada, neve no corpo, olhos marejados, pupila que muda, pelinhos, bochecha/orelha com movimento secundário, sombra do cenário passando (folhas/grade/janela), borda de luz, arcos de movimento e hesitação.
- **Mais poses e situações (pedido do usuário):** vista 3/4, personagem virando no meio da cena, sentado/agachado/ajoelhado/deitado, joelhos e cotovelos dobrando, subir escada, pular obstáculo, carregar peso, interações (toca aqui, aperto de mão, empurrão, abraço), roupas de inverno e praia, expressões intermediárias (sorriso de lado, desconfiado, entediado, nojo, convencido) e fala por fonema.
- **Personagens sempre em ação:** andar de verdade (pernas alternando, corpo balançando), correr, pular, gesticular com os dois braços, virar de lado; nada de ficar parado de pé por mais de ~1 s.
- **Rosto vivo:** boca mexendo enquanto a legenda "fala", piscadas, mudanças rápidas de expressão (susto, riso, raiva, medo), olhos seguindo a ação.
- **Squash & stretch e overshoot:** pulos com achatamento, impactos com tremida, objetos que quicam e giram.
- **Câmera mais dinâmica:** cortes mais curtos (2–4 s por plano, vários planos por bloco de legenda), zoom punch nos momentos fortes, whip pan entre cenas, câmera tremendo em impactos, close no rosto nas reações.
- **Mais efeitos na tela:** linhas de velocidade, poeira, estrelinhas, gotas de suor, onomatopeias ("POW", "PLOFT") com pop, emojis/ícones pulando, contadores animados.
- **Cenário vivo:** objetos de fundo com movimento (luzes piscando, poeira no ar, sombras passando, figurantes ao fundo).
- **Ritmo:** algo novo acontecendo a cada ~1 s; legendas com pop/tremida nas palavras-chave; efeitos sonoros em cada ação.
