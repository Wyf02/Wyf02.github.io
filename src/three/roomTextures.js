// Procedural canvas textures for the 3D study room.
// Everything is generated at runtime so no image assets are needed for materials.
import * as THREE from 'three'

const rand = (a, b) => a + Math.random() * (b - a)

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function toTexture(c, repeat) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1])
  }
  return t
}

/* ---------- wood ---------- */
export function woodTexture({ base = '#6e4629', streak = '#4f3018', light = '#8a5c38', repeat = null } = {}) {
  const c = makeCanvas(512, 512)
  const ctx = c.getContext('2d')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 150; i++) {
    ctx.strokeStyle = Math.random() < 0.5 ? streak : light
    ctx.globalAlpha = 0.04 + Math.random() * 0.08
    ctx.lineWidth = 1 + Math.random() * 2.5
    const x = Math.random() * 512
    ctx.beginPath()
    ctx.moveTo(x + rand(-6, 6), -10)
    ctx.bezierCurveTo(x + rand(-20, 20), 170, x + rand(-20, 20), 340, x + rand(-14, 14), 522)
    ctx.stroke()
  }
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    ctx.globalAlpha = 0.1
    ctx.strokeStyle = streak
    for (let r = 2; r < 14; r += 3) {
      ctx.beginPath()
      ctx.ellipse(x, y, r, r * 1.7, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
  return toTexture(c, repeat)
}

/* ---------- floor planks ---------- */
export function floorTexture() {
  const c = makeCanvas(512, 512)
  const ctx = c.getContext('2d')
  const plankH = 128
  for (let row = 0; row < 4; row++) {
    const y = row * plankH
    const shift = (row % 2) * 256
    for (let col = -1; col < 2; col++) {
      const x = col * 512 + shift
      const base = 96 + Math.floor(Math.random() * 26)
      ctx.fillStyle = `rgb(${base + 28}, ${base - 12}, ${Math.floor(base * 0.52)})`
      ctx.fillRect(x, y, 512, plankH)
      ctx.globalAlpha = 0.16
      ctx.strokeStyle = 'rgba(56,34,16,0.9)'
      for (let i = 0; i < 10; i++) {
        ctx.lineWidth = 0.6 + Math.random()
        const gy = y + Math.random() * plankH
        ctx.beginPath()
        ctx.moveTo(x, gy)
        ctx.bezierCurveTo(x + 170, gy + rand(-6, 6), x + 340, gy + rand(-6, 6), x + 512, gy + rand(-4, 4))
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(28,16,7,0.85)'
      ctx.fillRect(x, y, 512, 3)
      ctx.fillRect(x - 2, y, 4, plankH)
    }
  }
  return toTexture(c, [3, 2.4])
}

/* ---------- walls / cork ---------- */
export function wallTexture(base = '#b3a08a') {
  const c = makeCanvas(512, 512)
  const ctx = c.getContext('2d')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 1600; i++) {
    ctx.globalAlpha = 0.02 + Math.random() * 0.03
    ctx.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#000000'
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5)
  }
  ctx.globalAlpha = 1
  const g = ctx.createLinearGradient(0, 0, 0, 512)
  g.addColorStop(0, 'rgba(255,255,255,0.05)')
  g.addColorStop(1, 'rgba(0,0,0,0.12)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  return toTexture(c, [2, 1])
}

export function corkTexture() {
  const c = makeCanvas(256, 256)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#b48a5a'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 1400; i++) {
    ctx.globalAlpha = 0.05 + Math.random() * 0.1
    ctx.fillStyle = Math.random() < 0.5 ? '#8a6238' : '#d0a878'
    const r = 0.8 + Math.random() * 2.2
    ctx.beginPath()
    ctx.arc(Math.random() * 256, Math.random() * 256, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  return toTexture(c)
}

/* ---------- rug ---------- */
export function rugTexture() {
  const c = makeCanvas(512, 512)
  const ctx = c.getContext('2d')
  const cx = 256
  ctx.fillStyle = '#39544a'
  ctx.fillRect(0, 0, 512, 512)
  // subtle weave noise
  for (let i = 0; i < 2400; i++) {
    ctx.globalAlpha = 0.03 + Math.random() * 0.04
    ctx.fillStyle = Math.random() < 0.5 ? '#22352d' : '#557d6d'
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2)
  }
  ctx.globalAlpha = 1
  // rings
  ctx.strokeStyle = '#e6d8b8'
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.arc(cx, cx, 236, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(cx, cx, 214, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cx, 120, 0, Math.PI * 2)
  ctx.stroke()
  // diamond motifs between rings
  ctx.fillStyle = 'rgba(230,216,184,0.85)'
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const r = 168
    const x = cx + Math.cos(a) * r
    const y = cx + Math.sin(a) * r
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(a)
    ctx.beginPath()
    ctx.moveTo(0, -12)
    ctx.lineTo(9, 0)
    ctx.lineTo(0, 12)
    ctx.lineTo(-9, 0)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  // center medallion
  ctx.beginPath()
  ctx.arc(cx, cx, 34, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#39544a'
  ctx.beginPath()
  ctx.arc(cx, cx, 20, 0, Math.PI * 2)
  ctx.fill()
  return toTexture(c)
}

/* ---------- window night view ---------- */
export function paneTexture() {
  const c = makeCanvas(256, 320)
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 320)
  g.addColorStop(0, '#16233f')
  g.addColorStop(0.7, '#31486b')
  g.addColorStop(1, '#4c6488')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 320)
  // stars
  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = 0.3 + Math.random() * 0.7
    ctx.fillStyle = '#f5f2e2'
    const s = Math.random() < 0.9 ? 1 : 2
    ctx.fillRect(Math.random() * 256, Math.random() * 220, s, s)
  }
  ctx.globalAlpha = 1
  // moon
  ctx.save()
  ctx.shadowColor = 'rgba(244,240,220,0.9)'
  ctx.shadowBlur = 34
  ctx.fillStyle = '#f2eddc'
  ctx.beginPath()
  ctx.arc(178, 84, 26, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // distant hills
  ctx.fillStyle = '#101a2c'
  ctx.beginPath()
  ctx.moveTo(0, 320)
  ctx.lineTo(0, 262)
  for (let x = 0; x <= 256; x += 16) {
    ctx.lineTo(x, 262 - Math.sin(x * 0.045) * 14 - Math.random() * 4)
  }
  ctx.lineTo(256, 320)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#0a1220'
  ctx.beginPath()
  ctx.moveTo(0, 320)
  ctx.lineTo(0, 292)
  for (let x = 0; x <= 256; x += 20) {
    ctx.lineTo(x, 292 - Math.sin(x * 0.03 + 2) * 10)
  }
  ctx.lineTo(256, 320)
  ctx.closePath()
  ctx.fill()
  return toTexture(c)
}

/* ---------- laptop screen ---------- */
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function screenTexture() {
  const c = makeCanvas(512, 320)
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 320)
  g.addColorStop(0, '#111a26')
  g.addColorStop(1, '#0a1016')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 320)
  const tg = ctx.createLinearGradient(0, 0, 512, 0)
  tg.addColorStop(0, '#ff5a5f')
  tg.addColorStop(1, '#a83a58')
  ctx.fillStyle = tg
  ctx.fillRect(0, 0, 512, 46)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px Georgia, serif'
  ctx.fillText('wyf.dev — projects', 18, 31)
  const titles = ['Personal Site · 2025', '知云威胁感知系统 · 2023']
  for (let i = 0; i < 2; i++) {
    const y = 68 + i * 116
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    roundRectPath(ctx, 24, y, 464, 98, 10)
    ctx.fill()
    ctx.fillStyle = '#9fe0ff'
    ctx.font = 'bold 22px Georgia, "Microsoft YaHei", sans-serif'
    ctx.fillText(titles[i], 44, y + 38)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillRect(44, y + 56, 300, 8)
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.fillRect(44, y + 72, 220, 8)
  }
  return toTexture(c)
}

/* ---------- notebook cover ---------- */
export function notebookTexture() {
  const c = makeCanvas(256, 340)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#4d3a29'
  ctx.fillRect(0, 0, 256, 340)
  for (let i = 0; i < 900; i++) {
    ctx.globalAlpha = 0.03 + Math.random() * 0.05
    ctx.fillStyle = Math.random() < 0.5 ? '#2f2115' : '#6a5138'
    ctx.fillRect(Math.random() * 256, Math.random() * 340, 2, 2)
  }
  ctx.globalAlpha = 0.9
  ctx.strokeStyle = '#c9a45a'
  ctx.lineWidth = 3
  ctx.strokeRect(14, 14, 228, 312)
  ctx.lineWidth = 1
  ctx.strokeRect(22, 22, 212, 296)
  ctx.fillStyle = '#d8b56a'
  ctx.font = '64px "Kaiti SC", "STKaiti", KaiTi, serif'
  ctx.textAlign = 'center'
  ctx.fillText('手 记', 128, 168)
  ctx.font = '18px Georgia, serif'
  ctx.fillText('B L O G · N O T E S', 128, 216)
  ctx.globalAlpha = 1
  return toTexture(c)
}

/* ---------- book pages edge ---------- */
export function pagesTexture() {
  const c = makeCanvas(128, 128)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#e7dabd'
  ctx.fillRect(0, 0, 128, 128)
  ctx.strokeStyle = 'rgba(120,95,60,0.45)'
  ctx.lineWidth = 0.6
  for (let y = 2; y < 128; y += 3) {
    ctx.beginPath()
    ctx.moveTo(0, y + rand(-1, 1))
    ctx.lineTo(128, y + rand(-1, 1))
    ctx.stroke()
  }
  return toTexture(c)
}

/* ---------- clock face ---------- */
export function clockTexture() {
  const c = makeCanvas(256, 256)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#f3ead6'
  ctx.beginPath()
  ctx.arc(128, 128, 128, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#3a2d20'
  ctx.lineWidth = 6
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const long = i % 3 === 0
    const r0 = long ? 96 : 106
    ctx.beginPath()
    ctx.moveTo(128 + Math.cos(a) * r0, 128 + Math.sin(a) * r0)
    ctx.lineTo(128 + Math.cos(a) * 116, 128 + Math.sin(a) * 116)
    ctx.stroke()
  }
  return toTexture(c)
}

/* ---------- sprites ---------- */
export function sparkTexture() {
  const c = makeCanvas(64, 64)
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,224,160,0.85)')
  g.addColorStop(0.6, 'rgba(255,200,120,0.25)')
  g.addColorStop(1, 'rgba(255,200,120,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return toTexture(c)
}

export function blobTexture() {
  const c = makeCanvas(256, 256)
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128)
  g.addColorStop(0, 'rgba(0,0,0,0.5)')
  g.addColorStop(0.55, 'rgba(0,0,0,0.28)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return toTexture(c)
}
