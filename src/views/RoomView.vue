<template>
  <div class="room" ref="wrap">
    <div ref="mount" class="room__mount"></div>
    <div class="room__vignette"></div>
    <div v-if="fading" class="room__fade"></div>

    <div v-if="webglFailed" class="room__failed">
      <p>暂时无法加载 3D 书房（WebGL 不可用）。</p>
      <router-link to="/works">去看看作品页 →</router-link>
    </div>

    <!-- top bar -->
    <div class="room__topbar">
      <router-link class="room__back" to="/">← 回到主页</router-link>
      <div class="room__title">汪依凡的书房 · The Study</div>
    </div>

    <!-- hover tooltip -->
    <div v-if="tooltip.show" class="room__tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      {{ tooltip.text }}
    </div>

    <!-- first-visit hint -->
    <transition name="hint">
      <div v-if="hintVisible" class="room__hint">🖱️ 拖动环视书房 · 滚轮缩放 · 点击 ✨ 发光的物件</div>
    </transition>

    <!-- guide (bottom-right) -->
    <div class="guide">
      <button v-if="!guideOpen" class="guide__fab" title="书房指南" @click="toggleGuide">📜</button>
      <div v-else class="guide__panel">
        <div class="guide__head">
          <span>📜 书房指南</span>
          <button class="guide__close" @click="toggleGuide">✕</button>
        </div>
        <ul class="guide__list">
          <li><b>🖱️ 拖动</b> — 环视整个书房</li>
          <li><b>🔍 滚轮</b> — 靠近细看</li>
          <li><b>✨ 点击</b> — 发光的物件会展开一页纸</li>
          <li><b>⎋ Esc</b> — 或点空白处收起纸张</li>
        </ul>
        <div class="guide__legend">
          <div>📚 书架的书 — 研究论文</div>
          <div>💻 桌上电脑 — 项目作品</div>
          <div>📓 皮面手记 — 博客</div>
          <div>✉️ 一封信 — 关于我</div>
          <div>🖼️ 照片墙 — 走过的路</div>
          <div>💡 台灯 / 🪟 窗帘 — 点一下试试</div>
          <div>🕰️ 挂钟 — 看看现在几点</div>
        </div>
      </div>
    </div>

    <!-- unfolding paper overlay -->
    <transition name="paperfx">
      <div v-if="overlay" class="paper-layer" @click.self="closeOverlay">
        <!-- research: hardcover book (cover first, flip to details) -->
        <div v-if="overlay.kind === 'research'" class="book" :class="{ 'book--open': bookOpen }">
          <button class="paper__close paper__close--book" @click="closeOverlay">✕</button>
          <div class="book__board"></div>
          <div class="book__pages"></div>

          <!-- inner first page: the same markdown detail as /works/:id -->
          <div class="book__inner">
            <h2 class="paper__title book__title">{{ overlay.item.title }}</h2>
            <p class="paper__authors">{{ overlay.item.author }}</p>
            <p class="paper__venue">{{ overlay.item.description }}</p>
            <article v-if="bookHtml" class="book__md" v-html="bookHtml"></article>
            <p v-else class="book__md-empty">（这本书的正文还在撰写中……）</p>
            <div class="paper__links">
              <a v-if="overlay.item.link && overlay.item.link[0]" :href="overlay.item.link[0]" target="_blank" rel="noopener">📄 论文</a>
              <a v-if="overlay.item.link && overlay.item.link[1]" :href="overlay.item.link[1]" target="_blank" rel="noopener">🔗 网站</a>
              <router-link :to="'/works/' + overlay.item.id">完整详情页 →</router-link>
            </div>
            <div class="book__pageno">· 1 ·</div>
          </div>

          <!-- hardcover, hinged on the spine -->
          <div class="book__cover" :title="bookOpen ? '合上封面' : '翻开这本书'" @click="bookOpen = !bookOpen">
            <div class="book__cover-front">
              <div class="book__cover-img" :style="coverStyle(overlay.item.cover)"></div>
              <div class="book__cover-jacket">
                <div class="book__cover-tagrow">
                  <span class="paper__tag" :data-type="overlay.item.titletag">{{ overlay.item.titletag }}</span>
                  <span class="book__cover-year">{{ overlay.item.year }}</span>
                </div>
                <h3 class="book__cover-title">{{ overlay.item.title }}</h3>
                <div class="book__cover-rule"></div>
                <p class="book__cover-authors">{{ overlay.item.author }}</p>
                <p class="book__cover-venue">{{ overlay.item.description }}</p>
              </div>
              <div class="book__cover-spine"></div>
              <div class="book__cover-hint">👆 翻开这本书</div>
            </div>
            <div class="book__cover-back"></div>
          </div>
        </div>

        <!-- projects -->
        <div v-else-if="overlay.kind === 'projects'" class="paper">
          <button class="paper__close" @click="closeOverlay">✕</button>
          <h2 class="paper__title">💻 我的项目</h2>
          <p class="paper__sub">桌上这台电脑里，装着我做过的东西。</p>
          <div v-for="p in projects" :key="p.id" class="paper__entry">
            <div class="paper__entry-head">
              <span class="paper__badge">{{ p.year }}</span>
              <span class="paper__badge paper__badge--status">{{ p.status }}</span>
              <b>{{ p.title }}</b>
            </div>
            <p class="paper__entry-desc">{{ p.description }}</p>
            <div class="paper__links paper__links--small">
              <a v-for="(url, key) in p.link" :key="key" :href="url" target="_blank" rel="noopener">{{ key }}</a>
              <router-link :to="'/works/' + p.id">详情 →</router-link>
            </div>
          </div>
        </div>

        <!-- blogs -->
        <div v-else-if="overlay.kind === 'blogs'" class="paper">
          <button class="paper__close" @click="closeOverlay">✕</button>
          <h2 class="paper__title">📓 手记</h2>
          <p class="paper__sub">这本手记还在慢慢书写中……</p>
          <div class="paper__blogline">🚧 Blog 1 — Under construction, stay tuned.</div>
          <div class="paper__blogline">🚧 Blog 2 — Under construction, stay tuned.</div>
          <div class="paper__blogline">🚧 Blog 3 — Under construction, stay tuned.</div>
          <div class="paper__links">
            <router-link to="/blogs">去博客页看看 →</router-link>
          </div>
        </div>

        <!-- about (letter) -->
        <div v-else-if="overlay.kind === 'about'" class="paper paper--letter">
          <button class="paper__close" @click="closeOverlay">✕</button>
          <div class="paper__seal">汪</div>
          <h2 class="paper__title">见信如晤</h2>
          <div class="paper__letter-body">
            <img class="paper__me" :src="meSrc" alt="me" />
            <p>我是汪依凡。本科毕业于复旦大学计算机学院信息安全专业，并正在攻读AI方向的研究生。同时，也是一名可视化的爱好者。</p>
            <p>我对传播学很感兴趣，同时热衷于学习各门外语并到处旅行。希望我们能够一起在探索世界、认识社会的道路上越走越远！</p>
            <p class="paper__quote">理论是灰色的，而生命之树常青。</p>
          </div>
          <div class="paper__links">
            <router-link to="/about">了解更多 →</router-link>
          </div>
        </div>

        <!-- wall clock -->
        <div v-else-if="overlay.kind === 'clock'" class="paper paper--clock">
          <button class="paper__close" @click="closeOverlay">✕</button>
          <h2 class="paper__title">🕰️ 书房的挂钟</h2>
          <div class="clock-big">{{ clockTime }}</div>
          <div class="clock-date">{{ clockDate }}</div>
          <p class="clock-greet">{{ clockGreeting }}</p>
        </div>

        <!-- photo viewer -->
        <div v-else-if="overlay.kind === 'photo'" class="photo-view" @click.self="closeOverlay">
          <button class="paper__close paper__close--photo" @click="closeOverlay">✕</button>
          <button v-if="photoList.length > 1" class="photo-view__nav photo-view__nav--prev" @click.stop="stepPhoto(-1)">‹</button>
          <div class="photo-view__card">
            <img :src="photoSrc(currentPhoto)" :alt="currentPhoto.caption" />
            <div class="photo-view__caption">{{ currentPhoto.caption }}</div>
            <div class="photo-view__meta">
              <span>{{ currentPhoto.category }}</span>
              <span v-if="photoList.length > 1">{{ photoIndex + 1 }} / {{ photoList.length }}</span>
            </div>
          </div>
          <button v-if="photoList.length > 1" class="photo-view__nav photo-view__nav--next" @click.stop="stepPhoto(1)">›</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { marked } from 'marked'
import { buildRoom } from '@/three/roomBuilder'
import { worksItems } from '@/data/works'
import { miscItems } from '@/data/misc'
import { getWorkContent } from '@/content/worksContent'

const BOOK_LABELS = {
  r1_pvis2025_art: '论文 · PacificVis 2025 艺术可视化 🏆',
  r2_vis2025_octopus: '论文 · VIS 2025 章鱼地图',
  r3_vis2025_geo: '论文 · VIS 2025 情感地理可视化'
}
const POLAROID_IDS = ['m-l4', 'm-l8', 'm-l1', 'm-c1', 'm-c5', 'm-l6']
const FRAME_IDS = ['m-s6', 'm-s9', 'm-s2']

export default {
  name: 'RoomView',
  data() {
    return {
      overlay: null,
      bookOpen: false,
      bookHtml: '',
      photoList: [],
      photoIndex: 0,
      tooltip: { show: false, x: 0, y: 0, text: '' },
      hintVisible: true,
      guideOpen: localStorage.getItem('wyf_room_guide') !== 'closed',
      fading: true,
      webglFailed: false,
      now: new Date()
    }
  },
  computed: {
    projects() {
      return worksItems.filter((w) => w.type === 'project')
    },
    currentPhoto() {
      return this.photoList[this.photoIndex] || { caption: '', category: '', img: '' }
    },
    meSrc() {
      return require('@/assets/img/me.jpg')
    },
    clockTime() {
      const p = (n) => String(n).padStart(2, '0')
      return p(this.now.getHours()) + ':' + p(this.now.getMinutes()) + ':' + p(this.now.getSeconds())
    },
    clockDate() {
      const w = '日一二三四五六'
      return `${this.now.getFullYear()}年${this.now.getMonth() + 1}月${this.now.getDate()}日 · 星期${w[this.now.getDay()]}`
    },
    clockGreeting() {
      const h = this.now.getHours()
      if (h < 5) return '夜深了，愿你有个好梦。'
      if (h < 9) return '早上好，新的一天从书房开始。'
      if (h < 12) return '上午好，正是读书的好时光。'
      if (h < 14) return '午后时分，适合小憩片刻。'
      if (h < 18) return '下午好，来杯咖啡再继续吧。'
      if (h < 23) return '晚上好，台灯下的时光最安静。'
      return '夜深了，愿你有个好梦。'
    }
  },
  mounted() {
    this.initScene()
    window.addEventListener('resize', this.onResize, { passive: true })
    window.addEventListener('keydown', this.onKey)
    setTimeout(() => { this.hintVisible = false }, 7000)
    setTimeout(() => { this.fading = false }, 1300)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('keydown', this.onKey)
    if (this.clockTimer) clearInterval(this.clockTimer)
    this.disposeScene()
  },
  methods: {
    /* ---------- assets ---------- */
    thumbSrc(name) {
      try { return require('@/assets/img/thumb/' + name) } catch (e) { return '' }
    },
    coverStyle(name) {
      const url = this.thumbSrc(name)
      return url ? { backgroundImage: `url(${url})` } : {}
    },
    photoSrc(item) {
      try { return require('@/assets/img/' + item.img) } catch (e) { return '' }
    },
    miscById(id) {
      return miscItems.find((m) => m.id === id)
    },

    /* ---------- scene ---------- */
    initScene() {
      const mount = this.$refs.mount
      let renderer
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true })
      } catch (e) {
        this.webglFailed = true
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25
      renderer.outputColorSpace = THREE.SRGBColorSpace
      mount.appendChild(renderer.domElement)
      this.renderer = renderer

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x0d0906)
      scene.fog = new THREE.Fog(0x0d0906, 10, 18)
      this.scene = scene

      const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 60)
      camera.position.set(0.4, 1.85, 3.6)
      this.camera = camera

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.target.set(0, 1.35, -1.8)
      controls.enableDamping = true
      controls.dampingFactor = 0.06
      controls.enablePan = false
      controls.rotateSpeed = 0.5
      controls.minDistance = 2
      controls.maxDistance = 5.6
      controls.minPolarAngle = 0.95
      controls.maxPolarAngle = 1.62
      controls.minAzimuthAngle = -1.05
      controls.maxAzimuthAngle = 1.05
      controls.update()
      this.controls = controls

      // build room with site content wired onto objects
      const research = worksItems.filter((w) => w.type === 'research')
      const toPhoto = (id) => {
        const m = this.miscById(id)
        return m ? { label: m.caption, payload: m, url: this.photoSrc(m) } : null
      }
      const config = {
        books: research.map((w) => ({
          label: BOOK_LABELS[w.id] || '论文 · ' + w.year,
          payload: w,
          cover: this.thumbSrc(w.cover)
        })),
        polaroids: POLAROID_IDS.map(toPhoto).filter(Boolean),
        frames: FRAME_IDS.map(toPhoto).filter(Boolean)
      }
      this.api = buildRoom(scene, config)

      this.raycaster = new THREE.Raycaster()
      this.pointer = new THREE.Vector2()
      this.hovered = null
      this.hlMats = []
      this.tween = null
      this.saved = null

      const dom = renderer.domElement
      dom.addEventListener('pointermove', this.onPointerMove)
      dom.addEventListener('pointerdown', this.onPointerDown)
      dom.addEventListener('pointerup', this.onPointerUp)

      this.clock = new THREE.Clock()
      const tick = () => {
        this.rafId = requestAnimationFrame(tick)
        const dt = this.clock.getDelta()
        const t = this.clock.elapsedTime
        this.updateTween()
        this.controls.update()
        this.api.update(t, dt)
        // hover scale easing
        for (const root of this.api.interactables) {
          if (!root.userData.hoverScale) continue
          const target = root === this.hovered ? 1.06 : 1
          const s = root.scale.x + (target - root.scale.x) * Math.min(1, dt * 10)
          root.scale.set(s, s, s)
        }
        renderer.render(scene, camera)
      }
      tick()
    },

    onResize() {
      if (!this.renderer) return
      const w = window.innerWidth
      const h = window.innerHeight
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h)
    },

    onKey(e) {
      if (e.key === 'Escape' && this.overlay) this.closeOverlay()
    },

    /* ---------- picking ---------- */
    raycastAt(e) {
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
      this.raycaster.setFromCamera(this.pointer, this.camera)
      const hits = this.raycaster.intersectObjects(this.api.interactables, true)
      if (!hits.length) return null
      let obj = hits[0].object
      while (obj && !obj.userData.interact) obj = obj.parent
      return obj
    },

    onPointerMove(e) {
      if (this.overlay || this.tween || !this.api) return
      const root = this.raycastAt(e)
      if (root !== this.hovered) {
        this.clearHighlight()
        this.hovered = root
        if (root) this.applyHighlight(root)
        this.renderer.domElement.style.cursor = root ? 'pointer' : ''
      }
      if (root) {
        this.tooltip = { show: true, x: e.clientX + 16, y: e.clientY + 10, text: root.userData.label }
      } else {
        this.tooltip.show = false
      }
    },

    applyHighlight(root) {
      root.traverse((o) => {
        if (o.isMesh && o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          for (const m of mats) {
            if (m.emissive && !m.userData.hl) {
              m.userData.hl = true
              this.hlMats.push([m, m.emissive.getHex(), m.emissiveIntensity])
              m.emissive.setHex(0x664422)
              m.emissiveIntensity = 0.6
            }
          }
        }
      })
    },
    clearHighlight() {
      for (const [m, hex, intensity] of this.hlMats) {
        m.emissive.setHex(hex)
        m.emissiveIntensity = intensity
        m.userData.hl = false
      }
      this.hlMats = []
    },

    onPointerDown(e) {
      this.downXY = [e.clientX, e.clientY]
    },
    onPointerUp(e) {
      if (!this.downXY || this.overlay || this.tween) return
      const dx = e.clientX - this.downXY[0]
      const dy = e.clientY - this.downXY[1]
      if (dx * dx + dy * dy > 36) return
      const root = this.raycastAt(e)
      if (root) this.focusObject(root)
    },

    /* ---------- camera focus + overlay ---------- */
    focusObject(root) {
      const kind = root.userData.kind
      // toggle-type objects act in place, no camera move / paper
      if (kind === 'lamp' || kind === 'curtain') {
        this.api.visit(root.userData.sparkleKey)
        if (kind === 'lamp') this.api.toggleLamp()
        else this.api.toggleCurtains()
        if (this.tooltip.show) this.tooltip.text = root.userData.label
        return
      }
      this.tooltip.show = false
      this.clearHighlight()
      this.hovered = null
      this.renderer.domElement.style.cursor = ''
      this.api.visit(root.userData.sparkleKey)

      const box = new THREE.Box3().setFromObject(root)
      const center = box.getCenter(new THREE.Vector3())
      const camTo = center.clone().add(root.userData.viewOffset)
      this.saved = { pos: this.camera.position.clone(), tgt: this.controls.target.clone() }
      this.controls.enabled = false
      this.startTween(camTo, center, 850, () => this.openOverlayFor(root))
    },

    openOverlayFor(root) {
      const { kind, payload } = root.userData
      if (kind === 'research') {
        this.bookOpen = false
        // first page = the markdown detail from /content/works
        let html = ''
        try {
          const md = getWorkContent(payload.id)
          if (md) html = marked(md)
        } catch (e) { html = '' }
        this.bookHtml = html
        this.overlay = { kind, item: payload }
      } else if (kind === 'photo') {
        const list = miscItems.filter((m) => m.category === payload.category)
        this.photoList = list.length ? list : [payload]
        const idx = this.photoList.findIndex((m) => m.img === payload.img)
        this.photoIndex = idx >= 0 ? idx : 0
        this.overlay = { kind }
      } else if (kind === 'clock') {
        this.now = new Date()
        this.clockTimer = setInterval(() => { this.now = new Date() }, 250)
        this.overlay = { kind }
      } else {
        this.overlay = { kind }
      }
    },

    closeOverlay() {
      this.overlay = null
      if (this.clockTimer) {
        clearInterval(this.clockTimer)
        this.clockTimer = null
      }
      if (this.saved) {
        const { pos, tgt } = this.saved
        this.saved = null
        this.startTween(pos, tgt, 700, () => { this.controls.enabled = true })
      } else {
        this.controls.enabled = true
      }
    },

    stepPhoto(d) {
      const n = this.photoList.length
      this.photoIndex = (this.photoIndex + d + n) % n
    },

    startTween(toPos, toTgt, dur, cb) {
      this.tween = {
        t0: performance.now(), dur,
        fromP: this.camera.position.clone(), toP: toPos.clone(),
        fromT: this.controls.target.clone(), toT: toTgt.clone(),
        cb
      }
    },
    updateTween() {
      if (!this.tween) return
      const tw = this.tween
      const k = Math.min(1, (performance.now() - tw.t0) / tw.dur)
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
      this.camera.position.lerpVectors(tw.fromP, tw.toP, e)
      this.controls.target.lerpVectors(tw.fromT, tw.toT, e)
      if (k >= 1) {
        this.tween = null
        if (tw.cb) tw.cb()
      }
    },

    /* ---------- guide ---------- */
    toggleGuide() {
      this.guideOpen = !this.guideOpen
      localStorage.setItem('wyf_room_guide', this.guideOpen ? 'open' : 'closed')
    },

    /* ---------- cleanup ---------- */
    disposeScene() {
      if (this.rafId) cancelAnimationFrame(this.rafId)
      if (!this.renderer) return
      const dom = this.renderer.domElement
      dom.removeEventListener('pointermove', this.onPointerMove)
      dom.removeEventListener('pointerdown', this.onPointerDown)
      dom.removeEventListener('pointerup', this.onPointerUp)
      this.scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          for (const m of mats) {
            for (const key in m) {
              const v = m[key]
              if (v && v.isTexture) v.dispose()
            }
            m.dispose()
          }
        }
      })
      this.controls.dispose()
      this.renderer.dispose()
      if (dom.parentNode) dom.parentNode.removeChild(dom)
      this.renderer = null
    }
  }
}
</script>

<style scoped>
.room {
  position: fixed;
  inset: 0;
  background: #0b0806;
  overflow: hidden;
  z-index: 10;
}
.room__mount,
.room__mount :deep(canvas) {
  position: absolute;
  inset: 0;
  display: block;
}
.room__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 45%, transparent 52%, rgba(0, 0, 0, 0.55) 100%);
  z-index: 2;
}
.room__fade {
  position: absolute;
  inset: 0;
  background: #000;
  z-index: 40;
  pointer-events: none;
  animation: room-fadein 1.2s ease forwards;
}
@keyframes room-fadein {
  from { opacity: 1; }
  to { opacity: 0; }
}
.room__failed {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #e8dcc4;
  z-index: 50;
  font-size: 18px;
}
.room__failed a { color: #ffd9a0; }

/* top bar */
.room__topbar {
  position: absolute;
  top: 18px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 18px;
  z-index: 20;
  pointer-events: none;
}
.room__back {
  pointer-events: auto;
  color: #f0e4c8;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(20, 12, 6, 0.55);
  border: 1px solid rgba(240, 228, 200, 0.25);
  backdrop-filter: blur(4px);
  transition: background 150ms ease;
}
.room__back:hover { background: rgba(60, 40, 20, 0.7); }
.room__title {
  color: rgba(240, 228, 200, 0.85);
  font-family: Georgia, 'Songti SC', 'Noto Serif SC', serif;
  font-size: 16px;
  letter-spacing: 3px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

/* tooltip */
.room__tooltip {
  position: fixed;
  z-index: 25;
  pointer-events: none;
  background: rgba(28, 18, 8, 0.9);
  color: #f5e9cd;
  border: 1px solid rgba(220, 190, 130, 0.4);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
}

/* hint */
.room__hint {
  position: absolute;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  color: rgba(240, 228, 200, 0.9);
  background: rgba(20, 12, 6, 0.55);
  border: 1px solid rgba(240, 228, 200, 0.2);
  padding: 9px 20px;
  border-radius: 999px;
  font-size: 14px;
  backdrop-filter: blur(4px);
  pointer-events: none;
}
.hint-enter-active, .hint-leave-active { transition: opacity 0.8s ease; }
.hint-enter-from, .hint-leave-to { opacity: 0; }

/* guide */
.guide {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 22;
}
.guide__fab {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid rgba(220, 190, 130, 0.5);
  background: rgba(30, 20, 10, 0.75);
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
  transition: transform 150ms ease;
}
.guide__fab:hover { transform: scale(1.1); }
.guide__panel {
  width: 236px;
  padding: 14px 16px;
  border-radius: 10px;
  color: #3a2d1e;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.25), transparent 40%),
    #efe2c2;
  border: 1px solid #c9b083;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.55);
  font-size: 13px;
}
.guide__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 800;
  font-size: 14px;
  margin-bottom: 8px;
  font-family: Georgia, 'Songti SC', serif;
}
.guide__close {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: #7a6746;
}
.guide__list {
  margin: 0;
  padding: 0 0 10px 0;
  list-style: none;
  line-height: 1.9;
}
.guide__legend {
  border-top: 1px dashed #b39b6e;
  padding-top: 8px;
  line-height: 1.9;
  color: #5d4a2e;
}

/* ===== paper overlay ===== */
.paper-layer {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 5, 2, 0.55);
  backdrop-filter: blur(3px);
  perspective: 1200px;
  overflow: hidden;
}
.paper {
  position: relative;
  width: min(640px, 92vw);
  max-height: 78vh;
  overflow-y: auto;
  padding: 40px 46px;
  color: #3a2d22;
  border-radius: 6px;
  background:
    linear-gradient(105deg, transparent 48%, rgba(120, 90, 50, 0.06) 50%, transparent 52%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.4), transparent 30%),
    radial-gradient(ellipse at 30% 20%, rgba(255, 250, 235, 0.6), transparent 60%),
    #f4ead2;
  box-shadow: 0 34px 90px rgba(0, 0, 0, 0.65), inset 0 0 70px rgba(120, 90, 50, 0.16);
  transform-origin: 50% 0%;
  font-family: Georgia, 'Songti SC', 'Noto Serif SC', serif;
}
.paperfx-enter-active { transition: opacity 0.3s ease; }
.paperfx-leave-active { transition: opacity 0.26s ease; }
.paperfx-enter-from, .paperfx-leave-to { opacity: 0; }
.paperfx-enter-active .paper {
  animation: paper-unfold 0.7s cubic-bezier(0.22, 1.25, 0.32, 1) both;
}
.paperfx-leave-active .paper {
  animation: paper-fold 0.26s ease-in both;
}
@keyframes paper-unfold {
  from { transform: rotateX(-75deg) translateY(-40px) scale(0.92); opacity: 0; }
  to { transform: none; opacity: 1; }
}
@keyframes paper-fold {
  from { transform: none; opacity: 1; }
  to { transform: rotateX(-40deg) translateY(-20px) scale(0.95); opacity: 0; }
}

/* ===== hardcover book (research) ===== */
.book {
  position: relative;
  width: min(440px, 86vw);
  height: min(620px, 76vh);
  perspective: 2200px;
}
.paperfx-enter-active .book {
  animation: book-in 0.6s cubic-bezier(0.22, 1.2, 0.32, 1) both;
}
.paperfx-leave-active .book {
  animation: paper-fold 0.26s ease-in both;
}
@keyframes book-in {
  from { transform: translateY(46px) rotateX(14deg) scale(0.9); opacity: 0; }
  to { transform: none; opacity: 1; }
}
/* back hardcover board sticking out behind the pages */
.book__board {
  position: absolute;
  inset: -7px -11px -7px -7px;
  background: linear-gradient(120deg, #4c3722, #33241a);
  border-radius: 6px 12px 12px 6px;
  box-shadow: 0 34px 90px rgba(0, 0, 0, 0.7);
}
/* stacked page edges on the right */
.book__pages {
  position: absolute;
  top: 5px;
  bottom: 5px;
  right: -6px;
  width: 12px;
  background: repeating-linear-gradient(to right, #ecdfc4 0 2px, #c8b795 2px 3px);
  border-radius: 0 5px 5px 0;
}
.book__inner {
  position: absolute;
  inset: 0;
  padding: 34px 30px 26px;
  overflow-y: auto;
  color: #3a2d22;
  font-family: Georgia, 'Songti SC', 'Noto Serif SC', serif;
  border-radius: 3px 8px 8px 3px;
  background:
    linear-gradient(90deg, rgba(120, 90, 50, 0.22), transparent 7%),
    radial-gradient(ellipse at 30% 16%, rgba(255, 250, 235, 0.55), transparent 60%),
    #f4ead2;
  box-shadow: inset 14px 0 26px -16px rgba(90, 60, 30, 0.55);
}
.book__title { font-size: clamp(18px, 2.6vw, 22px); }
/* markdown detail rendered as book text (ink on cream) */
.book__md {
  margin: 16px 0 10px;
  text-align: left;
}
.book__md :deep(h1),
.book__md :deep(h2) {
  margin: 20px 0 10px;
  font-size: 17px;
  font-weight: 800;
  color: #33241a;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(90, 70, 40, 0.3);
  font-family: Georgia, 'Songti SC', 'Noto Serif SC', serif;
}
.book__md :deep(h3) {
  margin: 16px 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #4a3a26;
}
.book__md :deep(p) {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.9;
  text-align: justify;
  color: #3a2d22;
}
.book__md :deep(h2:first-child + p)::first-letter {
  float: left;
  font-size: 2.5em;
  line-height: 0.95;
  padding: 2px 7px 0 0;
  color: #8c3f37;
  font-family: Georgia, serif;
}
.book__md :deep(ul),
.book__md :deep(ol) {
  margin: 0 0 12px 20px;
  padding: 0;
}
.book__md :deep(li) {
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.8;
}
.book__md :deep(a) {
  color: #8c3f37;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(140, 63, 55, 0.35);
}
.book__md :deep(strong) { color: #33241a; }
.book__md :deep(img) {
  max-width: 100%;
  border-radius: 4px;
  margin: 12px 0;
  display: block;
  filter: sepia(0.12);
  box-shadow: 0 4px 14px rgba(60, 40, 20, 0.25);
}
.book__md :deep(blockquote) {
  border-left: 3px solid #b39b6e;
  margin: 14px 0;
  padding: 8px 14px;
  background: rgba(120, 90, 50, 0.07);
  font-style: italic;
  border-radius: 0 6px 6px 0;
}
.book__md :deep(blockquote p) { margin: 0; }
.book__md :deep(code) {
  background: rgba(90, 70, 40, 0.12);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12.5px;
}
.book__md :deep(pre) {
  background: rgba(60, 44, 26, 0.9);
  color: #e9dcc2;
  padding: 12px 14px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12.5px;
  margin: 12px 0;
}
.book__md :deep(pre code) { background: none; color: inherit; }
.book__md :deep(hr) {
  border: none;
  border-top: 1px dashed rgba(90, 70, 40, 0.35);
  margin: 18px 0;
}
.book__md-empty {
  margin: 24px 0;
  font-style: italic;
  opacity: 0.6;
}
.book__pageno {
  text-align: center;
  margin-top: 26px;
  color: #9a8a70;
  font-size: 13px;
}
/* the cover itself — hinged on the left (spine) */
.book__cover {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  transform-style: preserve-3d;
  transition: transform 1s cubic-bezier(0.45, 0.05, 0.2, 1);
  border-radius: 3px 10px 10px 3px;
  cursor: pointer;
  z-index: 3;
}
.book--open .book__cover { transform: rotateY(-178deg); }
.book__cover-front,
.book__cover-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: inherit;
  overflow: hidden;
}
.book__cover-front {
  display: flex;
  flex-direction: column;
  background: #241810;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.6);
}
/* top half: artwork */
.book__cover-img {
  flex: 0 0 40%;
  background-color: #3a2c1e;
  background-size: cover;
  background-position: center;
  border-bottom: 3px solid rgba(200, 160, 90, 0.55);
}
/* bottom half: classic book jacket with full info */
.book__cover-jacket {
  flex: 1;
  min-height: 0;
  padding: 18px 24px 46px 32px;
  background: linear-gradient(180deg, #33241a, #221609);
  color: #f0e4c8;
  text-align: left;
  overflow: hidden;
}
.book__cover-tagrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.book__cover-year {
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(240, 228, 200, 0.6);
  font-family: Georgia, serif;
}
.book__cover-title {
  margin: 0 0 12px;
  font: 700 clamp(14px, 2vw, 18px) / 1.5 Georgia, 'Songti SC', 'Noto Serif SC', serif;
  color: #f5ecd8;
}
.book__cover-rule {
  width: 44px;
  height: 2px;
  background: rgba(200, 160, 90, 0.7);
  margin-bottom: 12px;
}
.book__cover-authors {
  margin: 0 0 8px;
  font-size: 12.5px;
  line-height: 1.7;
  color: rgba(240, 228, 200, 0.88);
}
.book__cover-venue {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.7;
  font-style: italic;
  color: rgba(240, 228, 200, 0.6);
}
.book__cover-spine {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 18px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.18) 60%, transparent);
}
.book__cover-hint {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(245, 236, 216, 0.9);
  font-size: 13px;
  animation: hint-pulse 1.6s ease-in-out infinite;
}
@keyframes hint-pulse {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
}
/* inside face of the cover, visible after flipping */
.book__cover-back {
  transform: rotateY(180deg);
  background:
    linear-gradient(270deg, rgba(120, 90, 50, 0.22), transparent 7%),
    #efe4c8;
}
.paper__close--book {
  top: -16px;
  right: -16px;
  background: rgba(0, 0, 0, 0.55);
  border-color: rgba(255, 255, 255, 0.35);
  color: #fff;
  z-index: 5;
}

.paper__close {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(90, 70, 40, 0.35);
  background: rgba(90, 70, 40, 0.08);
  color: #5d4a2e;
  font-size: 14px;
  cursor: pointer;
  z-index: 2;
}
.paper__close:hover { background: rgba(90, 70, 40, 0.18); }
.paper__close--photo {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
}

.paper__banner {
  width: calc(100% + 92px);
  margin: -40px -46px 22px;
  height: 190px;
  object-fit: cover;
  display: block;
  border-radius: 6px 6px 0 0;
  filter: sepia(0.15);
}
.paper__tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 999px;
  background: #d9c79a;
  color: #4a3a20;
  margin-bottom: 10px;
  text-transform: capitalize;
}
.paper__tag[data-type='journal'] { background: #e3c493; }
.paper__tag[data-type='conference'] { background: #c3d3a0; }
.paper__title {
  margin: 0 0 10px;
  font-size: clamp(20px, 3vw, 26px);
  line-height: 1.35;
  color: #33241a;
}
.paper__sub {
  margin: 0 0 20px;
  opacity: 0.75;
  font-style: italic;
}
.paper__authors { margin: 0 0 4px; font-size: 14px; opacity: 0.85; }
.paper__venue { margin: 0 0 14px; font-size: 14px; opacity: 0.75; font-style: italic; }
.paper__chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.paper__chip {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid rgba(90, 70, 40, 0.35);
  color: #5d4a2e;
}
.paper__links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px dashed rgba(90, 70, 40, 0.35);
}
.paper__links a {
  color: #8c3f37;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px solid rgba(140, 63, 55, 0.35);
  font-size: 15px;
}
.paper__links a:hover { border-bottom-color: #8c3f37; }
.paper__links--small { border-top: none; padding-top: 4px; gap: 14px; }
.paper__links--small a { font-size: 13px; }

.paper__entry {
  padding: 14px 0;
  border-bottom: 1px dashed rgba(90, 70, 40, 0.25);
}
.paper__entry:last-of-type { border-bottom: none; }
.paper__entry-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 16px;
}
.paper__badge {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(90, 70, 40, 0.14);
}
.paper__badge--status { background: #c3d3a0; }
.paper__entry-desc {
  margin: 0 0 8px;
  font-size: 13.5px;
  line-height: 1.7;
  opacity: 0.85;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.paper__blogline {
  padding: 10px 0;
  border-bottom: 1px dashed rgba(90, 70, 40, 0.25);
  font-size: 15px;
  opacity: 0.8;
}

/* letter variant */
.paper--letter { background-color: #f6eedb; }
.paper__seal {
  position: absolute;
  top: 20px;
  right: 62px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #c04848, #8c2f2a 70%);
  color: #f6e8d0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-family: 'Kaiti SC', 'STKaiti', KaiTi, serif;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}
.paper__letter-body { line-height: 2; font-size: 15.5px; }
.paper__letter-body p { margin: 0 0 14px; }
.paper__me {
  float: right;
  width: 108px;
  height: 108px;
  object-fit: cover;
  border-radius: 8px;
  margin: 0 0 12px 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  transform: rotate(2deg);
  border: 4px solid #fff;
}
.paper__quote {
  font-style: italic;
  color: #8c3f37;
  font-family: 'Kaiti SC', 'STKaiti', KaiTi, serif;
}

/* clock variant */
.paper--clock {
  width: min(420px, 90vw);
  text-align: center;
}
.clock-big {
  font-size: clamp(48px, 9vw, 68px);
  font-weight: 700;
  letter-spacing: 4px;
  color: #33241a;
  font-variant-numeric: tabular-nums;
  margin: 8px 0 4px;
}
.clock-date {
  font-size: 16px;
  color: #5d4a2e;
  margin-bottom: 16px;
}
.clock-greet {
  margin: 0;
  padding-top: 14px;
  border-top: 1px dashed rgba(90, 70, 40, 0.35);
  font-style: italic;
  color: #8c3f37;
  font-family: 'Kaiti SC', 'STKaiti', KaiTi, serif;
}

/* photo viewer */
.photo-view {
  position: relative;
  display: flex;
  align-items: center;
  gap: 22px;
  max-width: 94vw;
}
.photo-view__card {
  background: #f7f3e8;
  padding: 16px 16px 14px;
  border-radius: 4px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
  animation: photo-tilt 0.5s cubic-bezier(0.22, 1.25, 0.32, 1) both;
  max-width: min(640px, 84vw);
}
@keyframes photo-tilt {
  from { transform: rotate(-4deg) scale(0.85); opacity: 0; }
  to { transform: rotate(-1deg); opacity: 1; }
}
.photo-view__card img {
  display: block;
  max-width: 100%;
  max-height: 58vh;
  border-radius: 2px;
}
.photo-view__caption {
  margin-top: 12px;
  font-size: 17px;
  color: #3a2d22;
  font-family: 'Kaiti SC', 'STKaiti', KaiTi, cursive;
}
.photo-view__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: #9a8a70;
}
.photo-view__nav {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 150ms ease;
}
.photo-view__nav:hover { background: rgba(0, 0, 0, 0.65); }
.paper__close--photo { top: -10px; right: -6px; }

@media (max-width: 640px) {
  .paper { padding: 30px 24px; }
  .paper__banner { width: calc(100% + 48px); margin: -30px -24px 18px; }
  .guide__panel { width: 200px; font-size: 12px; }
  .room__title { display: none; }
}
</style>
