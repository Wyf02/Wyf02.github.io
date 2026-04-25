<template>
  <div class="misc-wrap">
    <canvas ref="bgCanvas" class="bg-canvas" aria-hidden="true"></canvas>

    <div class="misc">
      <header class="misc__header">
        <h1 class="misc__title">Misc</h1>
        <p class="misc__sub">Life beyond the papers.</p>
      </header>

      <!-- Category filter -->
      <div class="filters">
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['filter-btn', { active: activeCategory === cat }]"
          @click="activeCategory = cat"
        >{{ cat }}</button>
      </div>

      <!-- Masonry grid -->
      <div class="masonry">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="card"
        >
          <div class="card__inner">
            <!-- real image -->
            <img v-if="imgSrc(item)" :src="imgSrc(item)" :alt="item.caption" class="card__photo" />
            <!-- placeholder color block -->
            <div v-else class="card__placeholder" :style="{ background: item.color || '#1e3a30' }"></div>
            <div class="card__overlay">
              <span class="card__cat">{{ item.category }}</span>
              <p v-if="item.caption" class="card__caption">{{ item.caption }}</p>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 10vh;" />
    </div>
  </div>
</template>

<script>
import { miscItems, miscCategories } from '@/data/misc'

export default {
  name: 'MiscView',
  data() {
    return {
      allItems: miscItems,
      categories: miscCategories,
      activeCategory: 'All'
    }
  },
  computed: {
    filteredItems() {
      if (this.activeCategory === 'All') return this.allItems
      return this.allItems.filter(i => i.category === this.activeCategory)
    }
  },
  methods: {
    imgSrc(item) {
      if (!item.img) return null
      try { return require('@/assets/img/' + item.img) } catch (e) { return null }
    },
    initBg() {
      const c = this.$refs.bgCanvas
      if (!c) return
      this.bgCtx = c.getContext('2d')
      this.onResize()
      this.drawMountains()
    },
    onResize() {
      const c = this.$refs.bgCanvas
      if (!c) return
      const dpi = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight
      c.width = w * dpi
      c.height = h * dpi
      c.style.width = w + 'px'
      c.style.height = h + 'px'
      this.bgCtx && this.bgCtx.setTransform(dpi, 0, 0, dpi, 0, 0)
      this.drawMountains()
    },
    drawMountains() {
      const ctx = this.bgCtx
      if (!ctx) return
      const w = ctx.canvas.clientWidth
      const h = ctx.canvas.clientHeight
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#06110e')
      grad.addColorStop(1, '#0c1a15')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
      const layers = [
        { color: '#2f4e43', amp: 40, step: 40, base: h * 0.65 },
        { color: '#3b6e5b', amp: 70, step: 50, base: h * 0.75 },
        { color: '#4c896f', amp: 110, step: 60, base: h * 0.85 }
      ]
      for (const L of layers) {
        ctx.beginPath()
        ctx.moveTo(0, h)
        ctx.lineTo(0, L.base)
        let x = 0
        while (x <= w) {
          const y = L.base - (Math.sin(x * 0.004) + Math.sin(x * 0.011 + 2)) * 0.5 * L.amp - Math.random() * L.amp * 0.08
          ctx.lineTo(x, y)
          x += L.step
        }
        ctx.lineTo(w, h)
        ctx.closePath()
        ctx.fillStyle = L.color
        ctx.fill()
      }
    }
  },
  mounted() {
    this.initBg()
    window.addEventListener('resize', this.onResize, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  }
}
</script>

<style scoped>
.misc-wrap {
  position: relative;
  min-height: 100vh;
  color: #e8f4ff;
}

.bg-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  display: block;
}

.misc {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 0;
}

/* ── Header ── */
.misc__header {
  margin-bottom: 28px;
  text-align: left;
}

.misc__title {
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
}

.misc__sub {
  margin: 0;
  opacity: 0.55;
  font-size: 15px;
}

/* ── Filters ── */
.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 28px;
  text-align: left;
}

.filter-btn {
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #e8f4ff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 140ms, border-color 140ms;
}

.filter-btn:hover {
  border-color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.06);
}

.filter-btn.active {
  background: #5BA689;
  border-color: #5BA689;
  color: #001a10;
}

/* ── Masonry ── */
.masonry {
  column-count: 3;
  column-gap: 14px;
}

.card {
  break-inside: avoid;
  margin-bottom: 14px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.card__inner {
  position: relative;
  width: 100%;
}

.card__photo {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 220ms ease;
}

.card:hover .card__photo {
  transform: scale(1.03);
}

.card__placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  transition: transform 220ms ease;
}

.card:hover .card__placeholder {
  transform: scale(1.03);
}

.card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px;
  opacity: 0;
  transition: opacity 200ms ease;
}

.card:hover .card__overlay {
  opacity: 1;
}

.card__cat {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5BA689;
  margin-bottom: 4px;
}

.card__caption {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #e8f4ff;
  line-height: 1.4;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .masonry { column-count: 2; }
}

@media (max-width: 560px) {
  .masonry { column-count: 1; }
  .misc__title { font-size: 1.8rem; }
}
</style>
