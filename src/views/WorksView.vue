<template>
  <div class="works-wrap">
    <canvas ref="bgCanvas" class="bg-canvas" aria-hidden="true"></canvas>
    <div class="works">
    <aside class="sidebar">
      <div class="panel">
        <input v-model="query" class="search" type="text" placeholder="Search title, desc, tags..." />

        <div class="facet">
          <div class="facet__title">Role</div>
          <button v-for="r in roles" :key="r" class="chip-select chip-select--role" :class="{active: filters.role.includes(r)}" @click="toggleFilter('role', r)">{{ r }}</button>
        </div>

        <div class="facet">
          <div class="facet__title">Tags</div>
          <button v-for="t in tags" :key="t" class="chip-select chip-select--tags" :class="{active: filters.tags.includes(t)}" @click="toggleFilter('tags', t)">{{ t }}</button>
        </div>
        <div class="facet">
          <div class="facet__title">Language</div>
          <button v-for="t in languages" :key="t" class="chip-select chip-select--language" :class="{active: filters.language.includes(t)}" @click="toggleFilter('language', t)">{{ t }}</button>
        </div>
        <div class="facet">
          <div class="facet__title">Tech</div>
          <button v-for="t in techs" :key="t" class="chip-select chip-select--tech" :class="{active: filters.tech.includes(t)}" @click="toggleFilter('tech', t)">{{ t }}</button>
        </div>

        <div class="facet">
          <div class="facet__title">Status</div>
          <button v-for="s in statuses" :key="s" class="chip-select chip-select--status" :class="{active: filters.status.includes(s)}" @click="toggleFilter('status', s)">{{ s }}</button>
        </div>

        <button class="clear" @click="clearFilters">CLEAR ALL</button>
      </div>
    </aside>

    <main class="main">
      <section class="section">
        <div class="section__header">
          <h2 class="section__title">Latest Research</h2>
          <span class="count">{{ researchItems.length }}</span>
        </div>
        <div class="cards  research-cards">
          <article v-for="it in researchItems" :key="it.id" class="card  research-card" @click="goDetail(it.id)">
            <div class="card__thumb" :style="cardThumb(it.cover)"></div>
            <div class="card__content">
              <h3 class="card__title"><span class="paper-tag" :data-type="it.titletag">{{ it.titletag }}</span>{{ it.title }}</h3>
              <p class="card__desc">{{it.author}} <br/> {{ it.description }}</p>
              
              <div class="meta">
                <span class="chip chip-select--role" v-for="r in it.role" :key="r">{{ r }}</span>
                <span class="chip chip-select--tags" v-for="t in it.tags" :key="t">{{ t }}</span>
              </div>
              
              <div class="meta">
                <span class="chip chip-select--language" v-for="t in it.language" :key="t">{{ t }}</span>
                <span class="chip chip-select--tech" v-for="t in it.tech" :key="t">{{ t }}</span>
              </div>
              <div class="links">
                  Paper:<a v-if="it.link" :href="it.link[0]" target="_blank" rel="noopener" @click.stop>Link</a>
                  <span class="sep">|</span>
                  Material: <a v-if="it.link[1]" :href="it.link[1]" target="_blank" rel="noopener" @click.stop>Website</a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="section__header">
          <h2 class="section__title">Selected Projects🚧</h2>
          <span class="count">{{ projectItems.length }}🚧🚧Updates in progress🚧🚧</span>
        </div>
        <div class="cards">
          <article v-for="it in projectItems" :key="it.id" class="card" @click="goDetail(it.id)">
            <div class="card__thumb" :style="cardThumb(it.cover, 'proj')"></div>
            <div class="card__content">
              <div class="card__head">
                <span class="badge">{{ it.year || '—' }}</span>
                <span class="badge badge--status">{{ it.status }}</span>
                <span class="badge badge--status project-tag" :data-type="it.titletag">{{ it.titletag }}</span>
              </div>
              <h3 class="card__title">{{ it.title }}</h3>
              <p class="card__desc">{{ it.description }}</p>
              <div class="meta">
                <span class="chip chip-select--role" v-for="r in it.role" :key="r">{{ r }}</span>
                <span class="chip chip-select--tags" v-for="t in it.tags" :key="t">{{ t }}</span>
              </div>
              
              <div class="meta">
                <span class="chip chip-select--language" v-for="t in it.language" :key="t">{{ t }}</span>
                <span class="chip chip-select--tech" v-for="t in it.tech" :key="t">{{ t }}</span>
              </div>
              <div class="links">
                    Material:<a v-for="(value, key, index) in it.link" :key="index" :href="value" target="_blank" rel="noopener" style="margin-right: 10px;" @click.stop>{{ key }} </a>
              </div>

            </div>
          </article>
        </div>
      </section>
      <div style="height: 30vh;"/>
    </main>
    </div>
  </div>
</template>

<script>
import { worksItems } from '@/data/works'

export default {
  name: 'WorksView',
  data() {
    return {
      query: '',
      filters: { role: [], tags: [], tech: [], language:[], status: [] },
      allItems: worksItems
    }
  },
  mounted() {
    this.initBg()
    window.addEventListener('resize', this.onResize, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    if (this.rafId) cancelAnimationFrame(this.rafId)
  },
  computed: {
    roles() { return this.uniqueFlat('role') },
    tags() { return this.uniqueFlat('tags') },
    techs() { return this.uniqueFlat('tech') },
    languages() { return this.uniqueFlat('language') },
    statuses() { return this.unique('status') },
    filtered() {
      const q = this.query.trim().toLowerCase()
      return this.allItems.filter(it => {
        const text = `${it.title} ${it.description} ${it.tags?.join(' ')} ${it.tech?.join(' ')} ${it.language?.join(' ')} ${it.role?.join(' ')}`.toLowerCase()
        if (q && !text.includes(q)) return false
        if (this.filters.role.length && !this.hasAny(it.role, this.filters.role)) return false
        if (this.filters.tags.length && !this.hasAny(it.tags, this.filters.tags)) return false
        if (this.filters.tech.length && !this.hasAny(it.tech, this.filters.tech)) return false
        if (this.filters.language.length && !this.hasAny(it.language, this.filters.language)) return false
        
        if (this.filters.status.length && !this.filters.status.includes(it.status)) return false
        return true
      })
    },
    researchItems() { return this.filtered.filter(i => i.type === 'research') },
    projectItems() { return this.filtered.filter(i => i.type === 'project') }
  },
  methods: {
    goDetail(id) {
      this.$router.push(`/works/${id}`)
    },
    toggleFilter(group, val) {
      const arr = this.filters[group]
      const idx = arr.indexOf(val)
      if (idx >= 0) arr.splice(idx, 1)
      else arr.push(val)
      this.filters = { ...this.filters }
    },
    cardThumb(name, group) {
      let bg = ''
      if (name) {
        try { bg = `url('${require('@/assets/img/thumb/' + name)}')` } catch(e) { bg = '' }
        if (!bg) { try { bg = `url('${require('@/assets/img/' + name)}')` } catch(e) { bg = '' } }
      }
      if (!bg) {
        bg = group==='proj' ? 'linear-gradient(135deg,#5ba689,#3b6e5b)' : 'linear-gradient(135deg,#3b6e5b,#2f4e43)'
      }
      return { backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center' }
    },
    hexToRgba(hex, a) {
      const h = hex.replace('#','')
      const bigint = parseInt(h.length===3 ? h.split('').map(x=>x+x).join('') : h, 16)
      const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255
      return `rgba(${r}, ${g}, ${b}, ${a})`
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
      this.bgCtx && this.bgCtx.setTransform(dpi,0,0,dpi,0,0)
      this.drawMountains()
    },
    drawMountains() {
      const ctx = this.bgCtx
      if (!ctx) return
      const w = ctx.canvas.clientWidth
      const h = ctx.canvas.clientHeight
      // night sky (dark teal)
      const grad = ctx.createLinearGradient(0,0,0,h)
      grad.addColorStop(0,'#06110e')
      grad.addColorStop(1,'#0c1a15')
      ctx.fillStyle = grad
      ctx.fillRect(0,0,w,h)
      // mountain layers (far to near) – hues around #5BA689
      const layers = [
        { color:'#2f4e43', amp:40, step:40, base: h*0.65 },
        { color:'#3b6e5b', amp:70, step:50, base: h*0.75 },
        { color:'#4c896f', amp:110, step:60, base: h*0.85 }
      ]
      for (const L of layers) {
        ctx.beginPath()
        ctx.moveTo(0,h)
        ctx.lineTo(0,L.base)
        let x=0
        while (x<=w) {
          const y = L.base - (Math.sin(x*0.004)+Math.sin(x*0.011+2))*0.5*L.amp - Math.random()*L.amp*0.08
          ctx.lineTo(x,y)
          x += L.step
        }
        ctx.lineTo(w,h)
        ctx.closePath()
        ctx.fillStyle = L.color
        ctx.fill()
      }
    },
    unique(field) { return [...new Set(this.allItems.map(i => i[field]).filter(Boolean))] },
    uniqueFlat(field) {
      const arr = []
      this.allItems.forEach(i => (i[field]||[]).forEach(v => arr.push(v)))
      return [...new Set(arr)]
    },
    hasAny(a, b) { if (!a||!b) return false; return a.some(x => b.includes(x)) },
    clearFilters() { this.query=''; this.filters={ role: [], tags: [], tech: [],language:[], status: [] } }
  }
}
</script>

<style scoped>
.works-wrap { position: relative; min-height: 100vh; }
.bg-canvas { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: -1; display: block; }
.works { display: grid; grid-template-columns: 300px 1fr; gap: 24px; padding: 24px; }
/* @media (max-width: 1000px){ .works { grid-template-columns: 1fr; } .sidebar { position: static; } } */

.sidebar {position: sticky;  top: 15vh; align-self: start; }
.panel { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 16px; color: #e8f4ff; }
.search { width: 90%; padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.35); color: #fff; margin-bottom: 12px; }
.facet { margin-top: 14px; }
.facet__title { font-weight: 800; margin-bottom: 8px; }
.chip-select { display: inline-block; margin: 4px 6px 2px 0; padding: 3px 9px; border-radius: 999px; font-size: 13px; background: transparent; border: 1.5px solid rgba(255,255,255,0.2); color: #e8f4ff; cursor: pointer; transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease; }
.chip-select.active { color: #001b2e; }
.chip-select--role { border-color: #4DA3FF; color: #4DA3FF; }
.chip-select--tags { border-color: #d174a6; color: #d174a6; }
.chip-select--language { border-color: #5BA689; color: #5BA689; }
.chip-select--tech { border-color: #F59E0B; color: #F59E0B; }
.chip-select--status { border-color: #A78BFA; color: #A78BFA; }
.chip-select--role.active { background: #4DA3FF; border-color: #4DA3FF; }
.chip-select--tags.active { background: #d174a6;; border-color: #d174a6;; }
.chip-select--language.active { background: #5BA689; border-color: #5BA689; }
.chip-select--tech.active { background: #F59E0B; border-color: #F59E0B; }
.chip-select--status.active { background: #A78BFA; border-color: #A78BFA; }
.clear { margin-top: 14px; width: 100%; padding: 10px; border-radius: 8px; background: #ff5a5f; color: #fff; border: none; font-weight: 800; cursor: pointer; }

.main { color: #e8f4ff; }
.section { margin-bottom: 40px; }
.section__header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
.section__title { font-size: 28px; font-weight: 900; }
.count { opacity: 0.8; }

.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 900px){ .cards { grid-template-columns: repeat(2, 1fr); } .sidebar {position: unset}}
@media (max-width: 600px){ .cards { grid-template-columns: 1fr; } }
.card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; overflow: hidden; text-align: left;}
.card { cursor: pointer; }
.card:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,0,0,0.25); border-color: rgba(255,255,255,0.18); }
.card__content {
  padding: 14px 14px 16px;
  color: #e8f4ff;
}
.card__thumb { height: 180px; background: #2f4e43; }
.card__head { display: flex; gap: 8px; }
.badge { background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 999px; font-size: 12px; }
.badge--status { background: rgba(159,224,255,0.8); color: #0a1722; font-weight: 800; }
.card__title { margin: 6px 0 6px 0; font-size: 18px; font-weight: 800; }
.card__desc { margin: 0 0 10px 0; opacity: 0.92; font-size: 14px;}
.meta { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.meta__label { opacity: 0.7; margin: 4px 4px 0 0; }
.chip { background: rgba(255,255,255,0.1); 
  border-width: 1px;
  border-style: solid;
  /* border-color: rgba(255,255,255,0.18); */
  margin-bottom: 6px;
  border-radius: 999px; padding: 2px 8px; font-size: 12px; }

.links a { color: #9fe0ff; font-weight: 700; text-decoration: none; }
.links a:hover { text-decoration: underline; }
.links .sep { margin: 0 8px; color: rgba(255,255,255,0.6); }

.research-cards {
  display: flex;
  flex-direction: column;
}
.research-card {
  display: flex;
  flex-direction: row; 
  gap: 16px;
  align-items: flex-start;
}
.research-card .card__thumb {
  width: 250px; /* 固定宽度 */
  height: 190px;
  background-size: cover;      /* ✅ 按比例放大，填满容器 */
  background-position: center; /* ✅ 居中显示 */
  background-repeat: no-repeat;
}
.research-card .card__content {
  flex: 1; /* 填满剩余空间 */
  padding: 8px 0; /* 上下间距可调 */
}


.paper-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  margin-right: 8px;
  color: #0a1722;
  background: #9fe0ff;
  vertical-align: middle;
  /* line-height: 1;  */
}
.paper-tag[data-type="journal"] { background: #ffd59f; }
.paper-tag[data-type="conference"] { background: #b0ffa6; }
.paper-tag[data-type="other"] { background: #d0b6ff; }

.project-tag{
  color: #0a1722;
}

.project-tag[data-type="Personal project"] { background: #ffd59f; }
.project-tag[data-type="Commercial"] { background: #b0ffa6; }
.project-tag[data-type="Other"] { background: #d0b6ff; }

</style>
  
  
  
  
  