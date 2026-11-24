// Pós-processamento: profundidade de campo, bloom, tonemapping, grão, vinheta, borrão de chicote.
import * as THREE from './lib/three.module.js';
const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
export class Post {
  constructor(R, W, H) {
    this.R = R; this.W = W; this.H = H;
    const rt = (w, h, depth) => { const t = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 0 }); if (depth) { t.depthTexture = new THREE.DepthTexture(w, h); t.depthTexture.type = THREE.FloatType; } return t; };
    this.scene = rt(W, H, true); this.dof = rt(W, H); this.b1 = rt(W / 4, H / 4); this.b2 = rt(W / 4, H / 4); this.b3 = rt(W / 8, H / 8); this.b4 = rt(W / 8, H / 8);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); this.qs = new THREE.Scene(); this.qs.add(this.quad); this.qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.mDof = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { tC: { value: null }, tD: { value: null }, uFocus: { value: 3 }, uAp: { value: .02 }, uNear: { value: .05 }, uFar: { value: 1000 }, uRes: { value: new THREE.Vector2(W, H) }, uMax: { value: 22 } },
      fragmentShader: `varying vec2 vUv; uniform sampler2D tC, tD; uniform float uFocus, uAp, uNear, uFar, uMax; uniform vec2 uRes;
float lin(float d){ return uNear*uFar/(uFar - d*(uFar-uNear)); }
float coc(vec2 uv){ float z = lin(texture2D(tD, uv).x); return clamp(abs(z-uFocus)/z * uAp * uRes.y, 0., uMax); }
void main(){ float c0 = coc(vUv); vec3 acc = texture2D(tC, vUv).rgb; float wsum = 1.;
  if (c0 > .6) { for (int i=0;i<24;i++){ float a = float(i)*2.39996; float r = sqrt(float(i)+.5)/sqrt(24.); vec2 o = vec2(cos(a),sin(a))*r*c0/uRes;
    vec2 uv = vUv+o; float cs = coc(uv); float w = smoothstep(r*c0-1., r*c0+1., cs+ .5) ; vec3 s = texture2D(tC, uv).rgb; w *= 1. + dot(s, vec3(.3))*.6; acc += s*w; wsum += w; } }
  gl_FragColor = vec4(acc/wsum, 1.); }` });
    this.mBright = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { tC: { value: null } }, fragmentShader: 'varying vec2 vUv; uniform sampler2D tC; void main(){ vec3 c = texture2D(tC, vUv).rgb; float l = dot(c, vec3(.3,.59,.11)); gl_FragColor = vec4(c * smoothstep(1.1, 3., l), 1.); }' });
    this.mBlur = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { tC: { value: null }, uDir: { value: new THREE.Vector2() } }, fragmentShader: 'varying vec2 vUv; uniform sampler2D tC; uniform vec2 uDir; void main(){ vec3 s = vec3(0.); float w[7]; w[0]=.2;w[1]=.18;w[2]=.14;w[3]=.1;w[4]=.06;w[5]=.035;w[6]=.02; s += texture2D(tC,vUv).rgb*w[0]; for(int i=1;i<7;i++){ s += (texture2D(tC,vUv+uDir*float(i)).rgb + texture2D(tC,vUv-uDir*float(i)).rgb)*w[i]; } gl_FragColor = vec4(s/1.29, 1.); }' });
    this.mFinal = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { tC: { value: null }, tB1: { value: null }, tB2: { value: null }, uExp: { value: 1 }, uT: { value: 0 }, uWhip: { value: new THREE.Vector2() }, uFlash: { value: 0 }, uBloom: { value: .5 } },
      fragmentShader: `varying vec2 vUv; uniform sampler2D tC, tB1, tB2; uniform float uExp, uT, uFlash, uBloom; uniform vec2 uWhip;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14), 0., 1.); }
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uT*7.13)*43758.5453); }
void main(){ vec3 c = vec3(0.); float wl = length(uWhip);
  if (wl > .0001) { for (int i=0;i<16;i++){ float f = float(i)/15.-.5; c += texture2D(tC, vUv + uWhip*f).rgb; } c /= 16.; }
  else { vec2 ca = (vUv-.5)*.0025; c = vec3(texture2D(tC, vUv+ca).r, texture2D(tC, vUv).g, texture2D(tC, vUv-ca).b); }
  c += (texture2D(tB1, vUv).rgb*.6 + texture2D(tB2, vUv).rgb*.9) * uBloom;
  c *= uExp; c = aces(c);
  c = pow(c, vec3(1./2.2));
  c = mix(c, c*vec3(1.04,1.,.92), .5); c = (c-.5)*1.06+.5;
  vec2 q = vUv-.5; c *= 1. - dot(q*vec2(1.,.75), q*vec2(1.,.75))*.9;
  c += (h(vUv*1000.)-.5)*.045;
  c = mix(c, vec3(1.), uFlash);
  gl_FragColor = vec4(c, 1.); }` });
  }
  pass(m, target) { this.quad.material = m; this.R.setRenderTarget(target); this.R.render(this.qs, this.qc); }
  render(scene, cam, o) {
    const R = this.R; R.setRenderTarget(this.scene); R.render(scene, cam);
    // resolve MSAA depth: profundidade fica em depthTexture
    const d = this.mDof.uniforms; d.tC.value = this.scene.texture; d.tD.value = this.scene.depthTexture; d.uFocus.value = o.focus; d.uAp.value = o.aperture; d.uNear.value = cam.near; d.uFar.value = cam.far;
    this.pass(this.mDof, this.dof);
    this.mBright.uniforms.tC.value = this.dof.texture; this.pass(this.mBright, this.b1);
    const bl = this.mBlur.uniforms;
    bl.tC.value = this.b1.texture; bl.uDir.value.set(1.5 / (this.W / 4), 0); this.pass(this.mBlur, this.b2);
    bl.tC.value = this.b2.texture; bl.uDir.value.set(0, 1.5 / (this.H / 4)); this.pass(this.mBlur, this.b1);
    bl.tC.value = this.b1.texture; bl.uDir.value.set(2 / (this.W / 8), 0); this.pass(this.mBlur, this.b3);
    bl.tC.value = this.b3.texture; bl.uDir.value.set(0, 2 / (this.H / 8)); this.pass(this.mBlur, this.b4);
    const f = this.mFinal.uniforms; f.tC.value = this.dof.texture; f.tB1.value = this.b1.texture; f.tB2.value = this.b4.texture;
    f.uExp.value = o.exposure ?? 1; f.uT.value = o.t; f.uWhip.value.set(...(o.whip || [0, 0])); f.uFlash.value = o.flash || 0; f.uBloom.value = o.bloom ?? .5;
    this.pass(this.mFinal, null);
  }
}
