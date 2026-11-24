// Pelo por camadas (shell texturing) sobre a malha SDF.
import * as THREE from './lib/three.module.js';
import { meshSDF } from './sdf.js';

function furMaterial(layer, n, opt) {
  const h = layer / n;
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: opt.rough ?? .82, metalness: 0 });
  m.onBeforeCompile = s => {
    s.uniforms.uH = { value: h }; s.uniforms.uLen = { value: opt.len }; s.uniforms.uFreq = { value: opt.freq };
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute float fur; attribute vec3 fp; uniform float uH, uLen; varying vec3 vFp; varying float vFur;')
      .replace('#include <begin_vertex>', 'vec3 transformed = position + normal * uH * uLen * fur; transformed.y -= uH * uH * uLen * .35 * fur; vFp = fp; vFur = fur;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>
uniform float uH, uFreq; varying vec3 vFp; varying float vFur;
float h31(vec3 p){ p = fract(p*vec3(.1031,.1030,.0973)); p += dot(p, p.yxz+33.33); return fract((p.x+p.y)*p.z); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  vec3 q = vFp * uFreq; vec3 c = floor(q); vec3 f = fract(q) - .5;
  float r = h31(c), r2 = h31(c + 17.3);
  float thick = (1. - uH) * .62 + .08;
  float strand = step(length(f.xz + (r2-.5)*.25), thick*.5) * step(uH, .35 + .65*r);
  vec3 q2 = vFp * uFreq * 2.3; float s2 = step(length(fract(q2).xz-.5), (1.-uH)*.3) * step(uH, h31(floor(q2))*.9);
  float a = max(strand, s2);
  if (uH > 0.001 && (a < .5 || vFur < .05)) discard;
  diffuseColor.rgb *= mix(1., mix(.5, 1.08, uH) * (.88 + .24 * r), clamp(vFur*1.5, 0., 1.));
  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.08,1.0,.9), uH);
}`);
  };
  m.customProgramCacheKey = () => 'fur' + layer + '_' + opt.len + '_' + opt.freq;
  return m;
}

export class FurBody {
  constructor(parent, opt = {}) {
    this.opt = Object.assign({ layers: 8, len: .0075, freq: 520, res: .011 }, opt);
    this.geo = new THREE.BufferGeometry();
    this.meshes = [];
    for (let i = 0; i <= this.opt.layers; i++) {
      const m = new THREE.Mesh(this.geo, furMaterial(i, this.opt.layers, this.opt));
      m.castShadow = i === 0; m.receiveShadow = true; m.frustumCulled = false; m.renderOrder = i;
      parent.add(m); this.meshes.push(m);
    }
  }
  update(prims, res) {
    const r = meshSDF(prims, res || this.opt.res);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(r.pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(r.nrm, 3));
    g.setAttribute('color', new THREE.BufferAttribute(r.col, 3));
    g.setAttribute('fur', new THREE.BufferAttribute(r.fur, 1));
    g.setAttribute('fp', new THREE.BufferAttribute(r.fp, 3));
    g.setIndex(new THREE.BufferAttribute(r.idx, 1));
    this.geo.dispose(); this.geo = g;
    for (const m of this.meshes) m.geometry = g;
    return r;
  }
  set visible(v) { for (const m of this.meshes) m.visible = v; }
}
