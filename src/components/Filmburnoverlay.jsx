import { useEffect, useRef, useState } from "react";

// ─── Vertex Shader ────────────────────────────────────────────────────────────
const VS = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// ─── Fragment Shader: Fire Burn Wisps ─────────────────────────────────────────
const FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_t;    // transition progress 0.0 → 1.0
uniform float u_time; // elapsed seconds (for animation)

float hash(vec2 p){
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}
float hash1(float n){ return fract(sin(n) * 43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p, int oct){
  float v=0.0, a=0.5;
  for(int i=0;i<8;i++){
    if(i>=oct) break;
    v+=a*noise(p); p*=2.1; a*=0.5;
  }
  return v;
}
float wfbm(vec2 p, float t){
  vec2 q=vec2(fbm(p+vec2(0.0,t*0.3),5),fbm(p+vec2(5.2,t*0.2),5));
  vec2 r=vec2(fbm(p+4.0*q+vec2(1.7,9.2),5),fbm(p+4.0*q+vec2(8.3,2.8),5));
  return fbm(p+4.0*r,5);
}
float eIn(float t){ return t*t*t; }
float eOut(float t){ float s=1.0-t; return 1.0-s*s*s; }

vec3 burnColor(float h){
  vec3 c=vec3(0.0);
  c=mix(c,vec3(0.35,0.02,0.0),smoothstep(0.0,0.3,h));
  c=mix(c,vec3(0.9,0.25,0.02),smoothstep(0.25,0.55,h));
  c=mix(c,vec3(1.0,0.6,0.05),smoothstep(0.5,0.72,h));
  c=mix(c,vec3(1.0,0.92,0.4),smoothstep(0.68,0.88,h));
  c=mix(c,vec3(1.0,1.0,1.0),smoothstep(0.85,1.0,h));
  return c;
}

void main(){
  vec2 uv=v_uv;
  vec2 fuv=vec2(uv.x, 1.0-uv.y);
  float p=clamp(u_t,0.0,1.0);
  float p1=min(1.0,p/0.55);
  float p2=max(0.0,(p-0.5)/0.5);

  vec3 col=vec3(0.0);
  float alpha=0.0;

  if(p1>0.0){
    // Warped fire rising from bottom
    vec2 fp=fuv;
    fp.y += wfbm(fuv*1.8+vec2(0.0,-u_time*0.4),u_time)*0.35*p1;

    float fh=1.0-fp.y;
    float fw=max(0.0,1.0-abs(fp.x-0.5)*1.5);
    float bn=wfbm(vec2(fuv.x*2.0+u_time*0.05, fuv.y*1.5-u_time*0.5),u_time);
    float fire=smoothstep(0.05,0.7,(fh*fw+bn*0.4)*p1);

    col=burnColor(fire)*fire;
    alpha=fire*p1;

    // Flame wisps / tendrils
    for(int i=0;i<7;i++){
      float fi=float(i);
      float wx=hash1(fi*13.7)*0.8+0.1;
      float wph=fract(u_time*0.3+hash1(fi*7.1));
      float wy=1.0-wph;
      float wHt=hash1(fi*3.9)*0.4+0.2;
      float wd=length((fuv-vec2(wx,wy))*vec2(8.0,1.0/wHt));
      float wisp=smoothstep(1.0,0.0,wd)*p1*smoothstep(0.0,0.15,p1);
      float wHeat=1.0-smoothstep(0.0,0.6,wd);
      col+=burnColor(wHeat)*wisp*0.8;
      alpha+=wisp*0.8*p1;
    }

    // Depth vignette
    float vig=clamp(1.0-length((fuv-0.5)*vec2(1.0,0.8)),0.0,1.0);
    col*=0.3+0.7*vig+0.4*p1;
    alpha*=0.3+0.7*vig+0.4*p1;
  }

  // Fade out to black/transparent
  if(p2>0.0){
    float fade=eIn(p2);
    col*=1.0-fade;
    alpha*=1.0-fade;
  }

  // Film grain
  float grain=(hash(uv+vec2(u_time*1.3))-0.5)*0.035;
  col=clamp(col+grain,0.0,1.0);
  alpha=clamp(alpha,0.0,1.0);

  // Output with alpha — use mix-blend-mode: screen on the canvas element
  // for zero-black transparent compositing
  fragColor=vec4(col, alpha);
}`;

function mkShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}
function mkProg(gl) {
  const p = gl.createProgram();
  gl.attachShader(p, mkShader(gl, gl.VERTEX_SHADER, VS));
  gl.attachShader(p, mkShader(gl, gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(p);
  return p;
}

/**
 * FilmBurnOverlay
 *
 * Props:
 *   progress  {number}  0.0 → 1.0  — drive the transition manually, OR
 *   autoPlay  {boolean} — auto-loop the transition (default: true)
 *   duration  {number}  — auto loop duration in seconds (default: 2.2)
 *   style     {object}  — extra styles for the canvas wrapper
 *   blendMode {string}  — CSS mix-blend-mode (default: "screen")
 */
export default function FilmBurnOverlay({
  progress = null,
  autoPlay = true,
  duration = 2.2,
  style = {},
  blendMode = "screen",
}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const progRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  // Init WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) { console.error("WebGL2 not supported"); return; }
    glRef.current = gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const prog = mkProg(gl);
    progRef.current = prog;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      if (glRef.current) glRef.current.viewport(0, 0, canvas.width, canvas.height);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Draw a single frame
  const drawFrame = (t, elapsed) => {
    const gl = glRef.current;
    const prog = progRef.current;
    if (!gl || !prog) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniform1f(gl.getUniformLocation(prog, "u_t"), t);
    gl.uniform1f(gl.getUniformLocation(prog, "u_time"), elapsed);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // Auto-play loop
  useEffect(() => {
    if (!autoPlay || progress !== null) return;
    const loop = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const loopDur = duration + 0.4; // gap at end
      const t = elapsed % loopDur;
      const normT = Math.min(t / duration, 1.0);
      drawFrame(normT, elapsed);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [autoPlay, progress, duration]);

  // Manual progress control
  useEffect(() => {
    if (progress === null) return;
    drawFrame(Math.max(0, Math.min(1, progress)), performance.now() / 1000);
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        mixBlendMode: blendMode,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}


// ─── DEMO wrapper (remove this if using as a pure component) ─────────────────
// Uncomment to preview the overlay over a background:
//
// export function Demo() {
//   return (
//     <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#1a0a00", overflow: "hidden" }}>
//       {/* Your content here */}
//       <img src="your-scene.jpg" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//
//       {/* Overlay — absolutely positioned on top, full coverage */}
//       <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
//         <FilmBurnOverlay autoPlay blendMode="screen" />
//       </div>
//     </div>
//   );
// }