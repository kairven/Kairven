import { useEffect, useRef } from "react"
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl"

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;

// cheap hash / noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  float t = uTime * 0.12;
  float warp = fbm(p * 2.4 + vec2(t, -t * 0.7));
  float n = fbm(p * 3.1 + warp * 1.6 + vec2(-t * 0.5, t));

  float bands = smoothstep(0.35, 0.85, n);
  vec3 col = mix(uColorA, uColorB, bands);

  // glow core
  float d = length(p);
  col += uColorB * 0.28 * smoothstep(0.75, 0.0, d);

  // vignette + grain
  col *= 1.0 - smoothstep(0.45, 1.05, d) * 0.75;
  float grain = hash(uv * uRes + uTime) - 0.5;
  col += grain * 0.045;

  gl_FragColor = vec4(col, 1.0);
}
`

interface Props {
  colorA?: [number, number, number]
  colorB?: [number, number, number]
  className?: string
}

export default function ShaderCanvas({
  colorA = [0.04, 0.04, 0.05],
  colorB = [0.78, 0.99, 0.24],
  className,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const renderer = new Renderer({ alpha: false, dpr: Math.min(window.devicePixelRatio, 2) })
    const gl = renderer.gl
    host.appendChild(gl.canvas)
    gl.canvas.style.width = "100%"
    gl.canvas.style.height = "100%"
    gl.canvas.style.display = "block"

    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new Vec2(1, 1) },
      uColorA: { value: colorA },
      uColorB: { value: colorB },
    }

    const geometry = new Triangle(gl)
    const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms })
    const mesh = new Mesh(gl, { geometry, program })

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host
      renderer.setSize(w, h)
      uniforms.uRes.value.set(w, h)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(host)

    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(host)

    const start = performance.now()
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      uniforms.uTime.value = prefersReduced ? 0 : (performance.now() - start) / 1000
      renderer.render({ scene: mesh })
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      program.remove?.()
      gl.canvas.remove()
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [colorA, colorB])

  return <div ref={hostRef} className={className} aria-hidden="true" />
}
