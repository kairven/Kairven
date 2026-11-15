import {useEffect, useRef, useState} from 'react'
import {cn} from '@/lib/cn'
import {prefersReducedMotion} from '@/lib/smoothScroll'

/**
 * Hero backdrop — a single fullscreen triangle with a cheap fbm field.
 *
 * Deliberately small: one draw call, no textures, no post-processing, DPR
 * capped at 1.5, and the render loop stops entirely when the canvas scrolls
 * out of view or the tab is hidden. OGL is dynamically imported so the WebGL
 * chunk never lands in the initial bundle.
 */

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
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uIntro;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  float t = uTime * 0.055;

  // Warped flow field — reads as slow drifting current, not liquid noise.
  vec2 q = vec2(
    fbm(p * 1.6 + vec2(t, -t * 0.7)),
    fbm(p * 1.6 + vec2(-t * 0.8, t) + 5.2)
  );
  float field = fbm(p * 2.1 + q * 1.35 + vec2(0.0, t * 0.35));

  // Pointer-weighted warm bloom
  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);
  float pointerDist = length(p - pointer);
  float bloom = smoothstep(1.05, 0.0, pointerDist) * 0.5;

  // Contour bands: the "precision" read.
  float bands = smoothstep(0.42, 0.5, fract(field * 5.0)) * 0.16;

  vec3 volt = vec3(0.831, 1.0, 0.0);
  vec3 gold = vec3(0.886, 0.659, 0.337);
  vec3 base = vec3(0.02, 0.02, 0.028);

  vec3 col = base;
  col += volt * pow(field, 3.4) * 0.30;
  col += gold * pow(smoothstep(0.30, 0.92, field), 2.6) * 0.22;
  col += volt * bands * 0.35;
  col += mix(volt, gold, 0.45) * bloom * 0.22;

  // Radial falloff so the hero type always wins the contrast fight.
  float vignette = smoothstep(1.15, 0.12, length(p * vec2(0.85, 1.0)));
  col *= mix(0.28, 1.0, vignette);
  col *= uIntro;

  // Dither to kill banding in the near-black gradient.
  col += (hash(uv * uResolution) - 0.5) * 0.012;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

type OGLModules = {
  Renderer: typeof import('ogl').Renderer
  Program: typeof import('ogl').Program
  Triangle: typeof import('ogl').Triangle
}

export function WebGLField({className}: {className?: string}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let disposed = false
    let raf = 0
    let cleanup: (() => void) | undefined

    const reduce = prefersReducedMotion()

    const boot = async () => {
      let ogl: OGLModules
      try {
        ogl = (await import('ogl')) as unknown as OGLModules
      } catch {
        setFailed(true)
        return
      }
      if (disposed) return

      const {Renderer, Program, Triangle} = ogl
      let renderer: InstanceType<OGLModules['Renderer']>
      try {
        renderer = new Renderer({
          canvas,
          dpr: Math.min(window.devicePixelRatio || 1, 1.5),
          alpha: false,
          antialias: false,
          powerPreference: 'low-power',
          depth: false,
        })
      } catch {
        setFailed(true)
        return
      }

      const gl = renderer.gl
      if (!gl) {
        setFailed(true)
        return
      }

      const geometry = new Triangle(gl)
      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: {value: 0},
          uResolution: {value: [1, 1]},
          uPointer: {value: [0.62, 0.62]},
          uIntro: {value: 0},
        },
      })

      const resize = () => {
        const rect = canvas.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        program.uniforms.uResolution.value = [
          gl.drawingBufferWidth,
          gl.drawingBufferHeight,
        ]
      }

      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(canvas)

      // Smoothly trail the pointer instead of snapping the bloom.
      const pointer = {x: 0.62, y: 0.62}
      const target = {x: 0.62, y: 0.62}
      const onPointer = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect()
        target.x = (e.clientX - r.left) / Math.max(r.width, 1)
        target.y = 1 - (e.clientY - r.top) / Math.max(r.height, 1)
      }
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.addEventListener('pointermove', onPointer, {passive: true})
      }

      let visible = true
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting
        },
        {threshold: 0},
      )
      io.observe(canvas)

      let paused = false
      const onVisibility = () => {
        paused = document.hidden
      }
      document.addEventListener('visibilitychange', onVisibility)

      const start = performance.now()

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame)
        if (!visible || paused) return

        const elapsed = (now - start) / 1000
        pointer.x += (target.x - pointer.x) * 0.045
        pointer.y += (target.y - pointer.y) * 0.045

        program.uniforms.uTime.value = elapsed
        program.uniforms.uPointer.value = [pointer.x, pointer.y]
        program.uniforms.uIntro.value = Math.min(1, elapsed * 0.55)

        renderer.render({scene: geometry as unknown as never})
      }

      if (reduce) {
        program.uniforms.uIntro.value = 1
        program.uniforms.uTime.value = 12
        renderer.render({scene: geometry as unknown as never})
      } else {
        raf = requestAnimationFrame(frame)
      }

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        io.disconnect()
        document.removeEventListener('visibilitychange', onVisibility)
        window.removeEventListener('pointermove', onPointer)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    }

    // Only boot the GL context once the hero is actually on screen.
    const bootIO = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          bootIO.disconnect()
          void boot()
        }
      },
      {rootMargin: '200px'},
    )
    bootIO.observe(canvas)

    return () => {
      disposed = true
      bootIO.disconnect()
      cleanup?.()
    }
  }, [])

  if (failed) {
    // Graceful CSS-only fallback — the mesh gradient already carries the mood.
    return <div className={cn('mesh-bg absolute inset-0', className)} aria-hidden="true" />
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('absolute inset-0 h-full w-full', className)}
    />
  )
}

export default WebGLField
