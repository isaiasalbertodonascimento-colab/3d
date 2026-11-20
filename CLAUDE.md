# Preferências do usuário para vídeos curtos

## Estilo que o usuário gosta
- Vídeo de curiosidade vertical 9:16 (TikTok/Reels/Shorts), estilo cartoon.
- Personagens 2D chapados (cabeça redonda laranja, cabelo cacheado, camiseta branca) dentro de **cenário 3D** com câmera próxima e em movimento. Referência pronta: `alcatraz/video3d.html`. Para animar, usar `kit/chars.js` + `kit/anim.js` e a skill `video-cartoon-animado`.
- **Sem narração** (sem voz): só legendas grandes branco/amarelo, música e efeitos sonoros.

## Próximo vídeo: BEM MAIS ANIMADO (pedido explícito do usuário)
O vídeo de Alcatraz foi considerado parado demais. No próximo, os personagens e a câmera precisam se mexer o tempo todo:
- **Personagem se movimentando a TODO momento (pedido do usuário):** nunca fica parado, nem entre ações. Sempre passar `t` no `guy()` do `kit/chars.js` (respiração, balanço, braços, olhos, piscada).
- **Mínimos detalhes (pedido do usuário):** cabelo balançando com o vento, barra da camiseta tremulando, poeira no ar, respiração. Vento no `guy()` com `wind`/`windDir`, mais forte ao ar livre e correndo.
- **Personagens sempre em ação:** andar de verdade (pernas alternando, corpo balançando), correr, pular, gesticular com os dois braços, virar de lado; nada de ficar parado de pé por mais de ~1 s.
- **Rosto vivo:** boca mexendo enquanto a legenda "fala", piscadas, mudanças rápidas de expressão (susto, riso, raiva, medo), olhos seguindo a ação.
- **Squash & stretch e overshoot:** pulos com achatamento, impactos com tremida, objetos que quicam e giram.
- **Câmera mais dinâmica:** cortes mais curtos (2–4 s por plano, vários planos por bloco de legenda), zoom punch nos momentos fortes, whip pan entre cenas, câmera tremendo em impactos, close no rosto nas reações.
- **Mais efeitos na tela:** linhas de velocidade, poeira, estrelinhas, gotas de suor, onomatopeias ("POW", "PLOFT") com pop, emojis/ícones pulando, contadores animados.
- **Cenário vivo:** objetos de fundo com movimento (luzes piscando, poeira no ar, sombras passando, figurantes ao fundo).
- **Ritmo:** algo novo acontecendo a cada ~1 s; legendas com pop/tremida nas palavras-chave; efeitos sonoros em cada ação.
