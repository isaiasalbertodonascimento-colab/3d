# Escrevendo as cenas (scenes.js)

## Contrato

```js
import * as THREE from 'three';
import { studio, kid, posekid, blob, tube, clay, wet, glow, cut, particles, smooth, lerp, clamp, V } from './lib.js';
export default {
  nomeDaCena(ctx) {            // ctx = { THREE, env, W, H, shot, args, rng }
    const { scene } = studio(ctx, { top: '#3b5bdb', bottom: '#0d1330' });
    // ... monte objetos ...
    return {
      scene,
      rig: { target: V(0, 1, 0), dist: 3, yaw: 0, pitch: 0.15, fov: 35 }, // o motor aplica shot.camera
      bloom: [0.5, 0.5, 0.8],  // opcional: força, raio, limiar
      update(t, d, k) { /* t = s desde o início do shot, d = duração, k = t/d (0..1) */ },
    };
  },
};
```

- Cada **shot** constrói sua cena do zero (os anteriores são descartados), então `args` permite
  reusar a mesma função com variações: `{ "cena": "menino", "args": { "acao": "engolir" } }`.
- Tudo deve depender só de `t`/`k` (nada de `Date.now()`, nada de `Math.random()` solto — use
  `ctx.rng()`), senão quadros vizinhos ficam incoerentes e a retomada de render quebra.
- Se quiser câmera própria, devolva `cam` e não devolva `rig`.
- O motor já faz: cortes, zoom de impacto/tremida/flash, legendas, etiqueta, títulos, barra de
  progresso e fade de entrada/saída. A cena só cuida do 3D.

Um exemplo completo e testado (6 cenas: personagem, cabeça em corte, esôfago, close, estômago,
intestino) está em `assets/exemplo-chiclete/` — leia antes de escrever cenas de corpo humano.

## Direção de arte "massinha"

- **Materiais:** `clay(cor)` para pele, roupa, objetos; `wet(cor)` para órgãos, mucosa, líquidos;
  `glow(cor, intensidade)` para o que deve brilhar (ácido, sinal nervoso, destaque) — combina com bloom.
- **Cores saturadas e poucas:** fundo em degradê escuro de uma família (azul, vinho, verde-petróleo),
  assunto em cor quente contrastante. Órgãos: rosa/coral/vinho; líquidos: amarelo-esverdeado brilhante.
- **Luz:** `studio()` já tem key quente com sombra, rim colorido atrás (`rimColor`) e fill. O rim é o
  que separa o objeto do fundo — troque a cor para combinar com o tema.
- **Escala no quadro:** o assunto deve ocupar 40–70 % da largura. A metade de baixo (y > 880 px)
  recebe legenda; mantenha o foco no terço do meio/alto (`target` levemente abaixo do assunto
  sobe ele na tela).
- **Movimento sempre:** algo se mexe em todo shot (respiração do personagem, peristaltismo, bolhas
  subindo, rotação lenta). Tela parada parece travada.

## Receitas

**Personagem reagindo**
```js
const k = kid({ shirt: 0xe8543a, hair: 0x3a2214 }); scene.add(k);
// update: posekid(k, t, { talk: true, open: 0..1, shock: 0..1, swallow: 0..1, armR: 0..1, lookX, lookY, turn, nod })
```
Altura ~1,6; rosto em y≈1,55. Close do rosto: `rig: { target: V(0,1.5,0), dist: 1.3, fov: 30 }`.
Corpo inteiro: `target V(0,1,0), dist 3.2`.

**Corte anatômico (ver o interior)**
```js
const plano = cut(V(0, 0, -1));   // esconde tudo com z > 0 (a metade virada para a câmera)
const pele = clay(0xf2b38f, { clip: [plano], side: THREE.DoubleSide });
```
Ponha o "conteúdo" (órgão, objeto) inteiro, sem corte, dentro da casca cortada. A face interna da
casca aparece graças ao `DoubleSide`; deixe-a um pouco mais escura com uma segunda casca menor
`wet(corEscura, { clip:[plano], side: THREE.BackSide })`.

**Tubo do corpo (esôfago, intestino, veia, nervo)**
```js
const pts = [[0,2,0],[0.1,1,0],[-0.1,0,0]];
const t = tube(pts, u => 0.25 + 0.03*Math.sin(u*40), wet(0xd9667a, { clip:[cut()], side: THREE.DoubleSide }));
const p = t.userData.curve.getPointAt(k);  // posição ao longo do tubo -> mova a "bolinha" por ele
```
Peristaltismo: anime o raio refazendo o tubo é caro; prefira escalar `blob`s em anel ao longo da curva.

**Objeto orgânico:** `blob(raio, material, { seed, noise: 0.05–0.25, freq: 2–6, stretch: V(1,0.7,1) })`.

**Partículas (enzimas, bolhas, esporos, poeira):** `const p = particles(200, [x,y,z,w,h,d], { color, size, rise })`,
`scene.add(p.points)` e `p.update(t)` no update.

## Erros comuns (vistos em testes)

- **Título cobrindo o rosto.** Nos shots com título (o primeiro e o último), o título ocupa
  y≈230–560 px. Suba o `target` do rig (o assunto desce na tela) ou afaste a câmera.
- **Imagem estourada/leitosa.** `glow` grande + bloom forte + `envI` alto lavam a cena. Para
  líquidos brilhantes use intensidade 0,6–0,9, bloom ≤ 0,5 e `studio({ keyI: 1.6–2, envI: 0.25–0.35 })`.
- **Corte que não lê como corte.** Câmera perto demais mostra só parede rosa. Afaste até a silhueta
  inteira do órgão/cabeça caber no quadro; a casca externa clara e a face interna escura dão a leitura.
- **Coisa brilhante "vazando" para fora do corte.** `glow` também aceita `{ clip: [plano] }`; passe o
  mesmo plano da casca.
- **Objeto pequeno se perde no close.** Faça a câmera seguir: `rig.target` pode ser um Vector3 que
  você atualiza no `update` (ex.: `foco.copy(objeto.position)`).
- **Close ocupando a tela toda.** No close, o assunto deve ocupar ~60 % da largura, não 100 %.

## Velocidade de renderização (CPU)

- Sombra só na key light (já é assim). Evite `transmission` e muitas luzes pontuais.
- Geometria: esferas com 24–48 segmentos bastam; tubos 120–200 segmentos.
- Até ~300 meshes por cena é tranquilo. Para multidões, use `InstancedMesh`.
- Texturas de canvas: crie uma vez por cena; tamanho até 1024.
