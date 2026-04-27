import { useEffect, useRef } from 'react'
import styles from './BackgroundCanvas.module.css'

interface Props {
  density?: number
  speed?: number
  mode?: 'idle' | 'hyperspace'
}

interface Star {
  ox: number; oy: number
  x: number; y: number
  vx: number; vy: number
  r: number; o: number
  sp: number; ph: number
  flare: boolean
}

interface ShootingStar {
  x: number; y: number
  vx: number; vy: number
  life: number
}

interface Ripple {
  x: number; y: number
  radius: number
  alpha: number
  str: number
}

export function BackgroundCanvas({ density = 230, speed = 1, mode = 'idle' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const neb1Ref = useRef<HTMLDivElement>(null)
  const neb2Ref = useRef<HTMLDivElement>(null)
  const neb3Ref = useRef<HTMLDivElement>(null)

  // Keep latest prop values accessible inside the animation loop without restarting it
  const speedRef = useRef(speed)
  const modeRef = useRef(mode)
  const densityRef = useRef(density)
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { densityRef.current = density }, [density])

  // ── Star canvas
  useEffect(() => {
    const _canvas = canvasRef.current
    if (!_canvas) return
    const canvas = _canvas
    const ctx = canvas.getContext('2d')!

    const GR = 290, GF = 0.016, DAMP = 0.90

    let stars: Star[] = []
    let shoots: ShootingStar[] = []
    let ripples: Ripple[] = []
    const mouse = { x: -9999, y: -9999 }
    let prevX = 0, prevY = 0, mouseSpeed = 0, isHeld = false
    let rafId = 0

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function mkStar(): Star {
      const ox = Math.random() * canvas.width
      const oy = Math.random() * canvas.height
      return {
        ox, oy, x: ox, y: oy, vx: 0, vy: 0,
        r: Math.random() * 1.4 + 0.2,
        o: Math.random() * 0.55 + 0.2,
        sp: Math.random() * 0.002 + 0.0008,
        ph: Math.random() * Math.PI * 2,
        flare: Math.random() < 0.045,
      }
    }

    function init() {
      resize()
      stars = Array.from({ length: densityRef.current }, mkStar)
    }

    function shootingStar() {
      shoots.push({
        x: Math.random() * window.innerWidth * 0.7,
        y: Math.random() * window.innerHeight * 0.25,
        vx: 7 + Math.random() * 5,
        vy: 2.5 + Math.random() * 3,
        life: 1,
      })
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const spd = speedRef.current
      const boost = Math.min(mouseSpeed * 0.004, 0.45)

      for (const s of stars) {
        const dx = mouse.x - s.x
        const dy = mouse.y - s.y
        const d = Math.sqrt(dx * dx + dy * dy)

        if (isHeld && d < GR * 1.6 && d > 0) {
          // Spiral black-hole pull when mouse held
          const ang = Math.atan2(dy, dx)
          const sf = (1 - d / (GR * 1.6)) * 0.07
          s.vx += Math.cos(ang + 0.5) * sf * d * 0.013 * spd
          s.vy += Math.sin(ang + 0.5) * sf * d * 0.013 * spd
        } else if (d < GR && d > 0) {
          const str = (1 - d / GR) * GF * spd
          s.vx += dx * str
          s.vy += dy * str
        }

        // Spring back to origin
        s.vx += (s.ox - s.x) * 0.0038
        s.vy += (s.oy - s.y) * 0.0038

        // Ripple forces
        for (const rip of ripples) {
          const rdx = s.x - rip.x
          const rdy = s.y - rip.y
          const rd = Math.sqrt(rdx * rdx + rdy * rdy)
          const diff = Math.abs(rd - rip.radius)
          if (diff < 35) {
            const f = (1 - diff / 35) * 2.0 * rip.str
            const ang = Math.atan2(rdy, rdx)
            s.vx += Math.cos(ang) * f
            s.vy += Math.sin(ang) * f
          }
        }

        s.vx *= DAMP
        s.vy *= DAMP
        s.x += s.vx
        s.y += s.vy

        const alpha = s.o * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))
        const prox = d < GR ? (1 - d / GR) * 0.5 : 0
        const fa = Math.min(1, alpha + prox * 0.42 + boost)
        const fr = s.r + prox * 0.8

        // Star body
        ctx.beginPath()
        ctx.arc(s.x, s.y, fr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(215,215,255,${fa})`
        ctx.fill()

        // Lens flare
        if (s.flare) {
          const arm = fr * 5.5
          ctx.strokeStyle = `rgba(200,225,255,${fa * 0.5})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(s.x - arm, s.y); ctx.lineTo(s.x + arm, s.y)
          ctx.moveTo(s.x, s.y - arm); ctx.lineTo(s.x, s.y + arm)
          ctx.stroke()
        }
      }

      // Shooting stars
      for (let i = shoots.length - 1; i >= 0; i--) {
        const ss = shoots[i]
        ss.x += ss.vx; ss.y += ss.vy; ss.life -= 0.017
        if (ss.life <= 0) { shoots.splice(i, 1); continue }
        const g = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 12, ss.y - ss.vy * 12)
        g.addColorStop(0, `rgba(255,255,255,${ss.life})`)
        g.addColorStop(0.4, `rgba(167,139,250,${ss.life * 0.45})`)
        g.addColorStop(1, 'rgba(167,139,250,0)')
        ctx.beginPath()
        ctx.moveTo(ss.x, ss.y)
        ctx.lineTo(ss.x - ss.vx * 12, ss.y - ss.vy * 12)
        ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.stroke()
      }

      // Ripple rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += 4.5; r.str *= 0.93; r.alpha -= 0.014
        if (r.alpha <= 0) { ripples.splice(i, 1); continue }
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(167,139,250,${r.alpha * 0.3})`
        ctx.lineWidth = 1; ctx.stroke()
      }

      rafId = requestAnimationFrame(draw)
    }

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - prevX
      const dy = e.clientY - prevY
      mouseSpeed = Math.sqrt(dx * dx + dy * dy)
      prevX = mouse.x = e.clientX
      prevY = mouse.y = e.clientY
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    const onClick = (e: MouseEvent) => {
      ripples.push({ x: e.clientX, y: e.clientY, radius: 0, alpha: 1, str: 1 })
    }
    const onDown = () => { isHeld = true }
    const onUp = () => { isHeld = false }
    const onResize = () => { resize() }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('click', onClick)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('resize', onResize)

    const shootInterval = setInterval(() => {
      if (Math.random() < 0.7) shootingStar()
    }, 5000)

    init()
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      clearInterval(shootInterval)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('click', onClick)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // ── Nebula parallax
  useEffect(() => {
    const layers = [
      { ref: neb1Ref, sx: 0.55, sy: 0.55 },
      { ref: neb2Ref, sx: -0.5, sy: -0.4 },
      { ref: neb3Ref, sx: 0.3, sy: -0.45 },
    ]
    let bx = 0, by = 0, tx = 0, ty = 0
    let rafId = 0

    const onMove = (e: MouseEvent) => {
      bx = (e.clientX / window.innerWidth - 0.5) * 55
      by = (e.clientY / window.innerHeight - 0.5) * 55
    }

    function loop() {
      tx += (bx - tx) * 0.03
      ty += (by - ty) * 0.03
      for (const l of layers) {
        const el = l.ref.current
        if (el) el.style.transform = `translate(${tx * l.sx}px, ${ty * l.sy}px)`
      }
      rafId = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={neb1Ref} className={`${styles.nebula} ${styles.neb1}`} />
      <div ref={neb2Ref} className={`${styles.nebula} ${styles.neb2}`} />
      <div ref={neb3Ref} className={`${styles.nebula} ${styles.neb3}`} />
    </>
  )
}
