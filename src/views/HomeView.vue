<template>
  <div class="home">
    <canvas ref="wavesCanvas" class="waves-canvas" aria-hidden="true"></canvas>
    <div style="height: 5vh;"></div> 
    <div class="home-content">
      <h1 class="hero-name">
        <span class="hero-name__first">WANG</span>
        <span class="hero-name__last">YIFAN</span>
      </h1>

      <h2 class="hero-keep">
        <span class="muted">Keep</span>
        <transition name="flip" mode="out-in">
          <span class="cycling" :key="currentWord">{{ currentWord }}</span>
        </transition>
      </h2>

      <router-link class="cta" to="/about">Get in Touch</router-link>

      <div class="spacer"></div>
    </div>
  
  <!-- Sections -->
  <div class="sections">
    <section class="section">
      <div class="section__header">
        <h3 class="section__title">Latest Research</h3>
        <router-link class="see-more" to="/research">SEE MORE >></router-link>
      </div>
      <div class="cards">
        <article v-for="(item, i) in latestResearch" :key="'res-'+i" class="card">
          <div class="card__thumb" :style="thumbStyle(item.cover)"></div>
          <div class="card__content">
            <h4 class="card__title">
              <span class="paper-tag" :data-type="item.tag">{{ item.tag }}</span>
              {{ item.title }}
            </h4>
            <p class="paper-meta">{{ item.venue }}</p>
            <div class="paper-links">
              Paper:<a v-if="item.paperUrl" :href="item.paperUrl" target="_blank" rel="noopener">Link</a>
              <span v-if="item.paperUrl && item.siteUrl" class="sep">|</span>
              Material: <a v-if="item.siteUrl" :href="item.siteUrl" target="_blank" rel="noopener">Website</a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <h3 class="section__title">Selected Project</h3>
        <span class="section__tag">建设中</span>
        <router-link class="see-more" to="/works">SEE MORE >></router-link>
      </div>
      <div class="cards">
        <article v-for="(item, i) in selectedProjects" :key="'proj-'+i" class="card">
          <div class="card__thumb" :style="thumbStyle(item.cover, 'proj')"></div>
          <div class="card__content">
            <h4 class="card__title">{{ item.title }}</h4>
            <p class="card__desc">{{ item.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <h3 class="section__title">Blogs</h3>
        <span class="section__tag">建设中</span>
        <router-link class="see-more" to="/blogs">SEE MORE >></router-link>
      </div>
      <div class="cards">
        <article v-for="(item, i) in latestBlogs" :key="'blog-'+i" class="card">
          <div class="card__thumb" :style="thumbStyle(item.cover, 'blog')"></div>
          <div class="card__content">
            <h4 class="card__title">{{ item.title }}</h4>
            <p class="card__desc">{{ item.desc }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>

  <!-- Personal Info -->
  <div class="personal">
    <div class="personal__grid">
      <div class="personal__quote">
      <div class="personal__photo">
        <img :src="require('@/assets/img/me.jpg')" alt="me" />
      </div>
      <p class="personal__para" style="color:aliceblue">理论是灰色的，而生命之树常青。<br/>
          Grau, teurer Freund, ist alle Theorie. Und grün des Lebens goldner Baum.</p>
      </div>
      <div class="personal__content">
        <h3 class="personal__title">汪依凡<span style="color:#ff5a5f; margin-left:10px;">WANG YIFAN</span></h3>
        <h4 class="hero-keep personal__subtitle">
          <span class="muted">Keep</span>
          <transition name="flip" mode="out-in">
            <span class="cycling" :key="currentWord">{{ currentWord }}</span>
          </transition>
        </h4>
        <p class="personal__para">我是汪依凡。本科毕业于复旦大学计算机学院信息安全专业，并正在攻读AI方向的研究生。同时，也是一名可视化的爱好者。我对传播学很感兴趣，同时热衷于学习各门外语并到处旅行。希望我们能够一起在探索世界、认识社会的道路上越走越远！</p>
        <p class="personal__para">如果想要获取更多关于我的信息，请点击“更多”按钮——感谢您的关注！</p>
        <br/>
        <router-link class="cta" to="/about">了解更多</router-link>
      </div>
    </div>
  </div>
  </div>
  <div style="height: 25vh;"></div>
</template>

<script>
export default {
  name: 'HomeView',
  computed: {
    currentWord() {
      return this.words[this.wordIndex]
    }
    
  },
  data() {
    return {
      rafId: null,
      ctx: null,
      width: 0,
      height: 0,
      dpi: 1,
      t: 0,
      waves: [],
      words: ['Growing', 'Thinking', 'Creating'],
      wordIndex: 0,
      wordTimer: null,
      latestResearch: [
        { tag: 'conference', title: 'More Than Beautiful: Exploring Design Features, Practical Perspectives, and Implications of Artistic Data Visualization', venue: 'Proceedings of the IEEE Pacific Visualization Conference (PacificVis 2025). 🏆 Best Paper Award', paperUrl: 'https://arxiv.org/pdf/2502.04940', siteUrl: 'https://artisticvis.github.io/',cover: 'pvis2025_art.png'},
        { tag: 'journal', title: 'Unveiling the Visual Rhetoric of Persuasive Cartography: A Case Study of the Design of Octopus Maps', venue: 'To appear at IEEE VIS 2025.', paperUrl: 'https://arxiv.org/abs/2507.11903', siteUrl: 'https://octopusmap.github.io/',cover: 'vis2025_octopus.jpeg' },
        { tag: 'journal', title: '"Mapping What I Feel": Understanding Affective Geovisualization Design Through the Lens of People-Place Relationships', venue: 'To appear at IEEE VIS 2025.', paperUrl: 'https://arxiv.org/abs/2507.11841', siteUrl: 'https://affectivegeovis.github.io/',cover: 'vis2025_geo.png' }
      ],
      selectedProjects: [
        { title: 'Project X', desc: 'Under construction — coming soon.', cover: '' },
        { title: 'Project Y', desc: 'Under construction — coming soon.', cover: '' },
        { title: 'Project Z', desc: 'Under construction — coming soon.', cover: '' }
      ],
      latestBlogs: [
        { title: 'Blog 1', desc: 'Under construction — stay tuned.', cover: '' },
        { title: 'Blog 2', desc: 'Under construction — stay tuned.', cover: '' },
        { title: 'Blog 3', desc: 'Under construction — stay tuned.', cover: '' }
      ]
    }
  },
  mounted() {
    this.initCanvas()
    window.addEventListener('resize', this.onResize, { passive: true })
    this.startWordCycle()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    if (this.rafId) cancelAnimationFrame(this.rafId)
    if (this.wordTimer) clearInterval(this.wordTimer)
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.wavesCanvas
      if (!canvas) return
      this.ctx = canvas.getContext('2d')
      this.onResize()
      // Configure multiple layered waves
      this.waves = [
        { amp: 12, len: 0.012, speed: 0.015, color: 'rgba(0, 150, 255, 0.25)' },
        { amp: 20, len: 0.008, speed: 0.010, color: 'rgba(0, 120, 255, 0.20)' },
        { amp: 34, len: 0.005, speed: 0.007, color: 'rgba(0, 90, 255, 0.15)' }
      ]
      this.animate()
    },
    thumbStyle(name, fallbackGroup) {
      // Resolve image path (Vue CLI / webpack). Try assets/img then assets/imh
      let bg = ''
      if (name) {
        try {
          const url = require('@/assets/img/thumb/' + name)
          bg = `url('${url}')`
        } catch (e) {
          console.log(e)
        }
      }
      
      if (!bg) {
        if (fallbackGroup === 'proj') bg = 'linear-gradient(135deg, #5f2c3e, #2a0f18)'
        else if (fallbackGroup === 'blog') bg = 'linear-gradient(135deg, #1f5f4e, #0d2e27)'
        else bg = 'linear-gradient(135deg, #164b75, #0a2940)'
      }
      return {
        backgroundImage: bg,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    onResize() {
      const canvas = this.$refs.wavesCanvas
      if (!canvas) return
      this.dpi = window.devicePixelRatio || 1
      this.width = window.innerWidth
      this.height = window.innerHeight
      canvas.width = this.width * this.dpi
      canvas.height = this.height * this.dpi
      canvas.style.width = this.width + 'px'
      canvas.style.height = this.height + 'px'
      if (this.ctx) this.ctx.setTransform(this.dpi, 0, 0, this.dpi, 0, 0)
    },
    animate() {
      const step = () => {
        this.draw()
        this.t += 1
        this.rafId = requestAnimationFrame(step)
      }
      this.rafId = requestAnimationFrame(step)
    },
    startWordCycle() {
      this.wordTimer = setInterval(() => {
        this.wordIndex = (this.wordIndex + 1) % this.words.length
      }, 1800)
    },
    draw() {
      const ctx = this.ctx
      if (!ctx) return
      // Background
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, this.width, this.height)

      // Draw layered sine waves
      for (let i = 0; i < this.waves.length; i++) {
        const { amp, len, speed, color } = this.waves[i]
        ctx.beginPath()
        ctx.moveTo(0, this.height)
        const baseline = this.height * 0.65 + i * 12
        for (let x = 0; x <= this.width; x += 2) {
          const y = baseline + Math.sin(x * len + this.t * speed) * amp
          ctx.lineTo(x, y)
        }
        ctx.lineTo(this.width, this.height)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()

        // Optional: floating particles along the wave
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        for (let p = 0; p < 12; p++) {
          const px = ((p * 97 + this.t * (0.4 + i * 0.15)) % this.width)
          const py = baseline + Math.sin(px * len + this.t * speed) * amp
          ctx.beginPath()
          ctx.arc(px, py - 6, 1.2 + i * 0.3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }
}
</script>

<style scoped>
.home {
  position: relative;
  min-height: 200vh; /* ensure page has scrollable content */
}

.waves-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  z-index: -1;
  pointer-events: none;
}

.home-content {
  position: relative;
  z-index: 1;
  color: #e8f4ff;
  padding: 20vh 24px 24px;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

/* Hero heading */
.hero-name {
  margin: 0 0 8px 0;
  font-size: clamp(40px, 8vw, 80px);
  font-weight: 900;
  letter-spacing: 2px;
}
.hero-name__first { color: #ffffff; margin-right: 10px; }
.hero-name__last { color: #ff5a5f; }

.hero-keep {
  margin: 10px 0 28px 0;
  font-size: clamp(24px, 4.8vw, 35px);
  font-weight: 800;
  perspective: 800px; /* enable 3D for child flip */
  /* 原本想在最下面，效果有点一般 */
  /* perspective-origin: bottom; */
}
.hero-keep .muted { color: rgba(255, 255, 255, 0.65); font-weight: 700; margin-right: 10px; }
.hero-keep .cycling { color: #ffffff; display: inline-block; transform-style: preserve-3d; transform-origin: 50% 50%; }

/* Flip: current word "躺倒" 并淡出，下一词自下向上翻起 */
.flip-enter-active { animation: flip-up 520ms cubic-bezier(.2,.8,.2,1) both; }
.flip-leave-active { animation: lay-down 520ms cubic-bezier(.2,.8,.2,1) both; }
@keyframes lay-down {
  0% { opacity: 1; transform: rotateX(0deg) translateY(0); }
  100% { opacity: 0; transform: rotateX(90deg) translateY(4px); }
}
@keyframes flip-up {
  0% { opacity: 0; transform: rotateX(-90deg) translateY(-4px); }
  100% { opacity: 1; transform: rotateX(0deg) translateY(0); }
}

.cta {
  display: inline-block;
  padding: 13px 26px;
  border-radius: 999px;
  background: #ff5a5f;
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 6px 20px rgba(255, 90, 95, 0.35);
  transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
}
.cta:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(255, 90, 95, 0.45); filter: brightness(1.05); }
.cta:active { transform: translateY(0); box-shadow: 0 6px 20px rgba(255, 90, 95, 0.35); }

.spacer { height: 60vh; }

/* ===== Sections below hero ===== */
.sections {
  position: relative;
  z-index: 1;
  padding: 24px;
  max-width: clamp(500px, 75vw, 1200px);
  margin: 0 auto 80px auto;
}

.section {
  text-align: left;
  margin-bottom: 56px;
}

.section__header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.section__title {
  font-size: clamp(28px, 3.3vw, 35px);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.see-more {
  margin-left: auto;
  font-size: 18px;
  color: #9fe1ffe3;
  text-decoration: none;
  font-weight: 800;
}
.see-more:hover { text-decoration: underline; }

.section__tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.85);
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .cards { grid-template-columns: 1fr; }
}

.card {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  overflow: hidden;
  backdrop-filter: blur(2px);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,0,0,0.25); border-color: rgba(255,255,255,0.18); }

.card__thumb {
  height: 180px;
  background: linear-gradient(135deg, #164b75, #0a2940);
}
.card__content {
  padding: 14px 14px 16px;
  color: #e8f4ff;
}
.card__title {
  font-weight: 800;
  margin: 0 0 6px 0;
  font-size: 18px;
  
}
.card__desc {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
  line-height: 1.6;
}

/* Research card custom meta */
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

.paper-meta {
  margin: 0 0 8px 0;
  opacity: 0.9;
  font-size: 14px;
}
.paper-links a {
  color: #9fe0ff;
  text-decoration: none;
  font-weight: 700;
}
.paper-links a:hover { text-decoration: underline; }
.paper-links .sep { margin: 0 8px; color: rgba(255,255,255,0.6); }

/* ===== Personal Info ===== */
.personal {
  position: relative;
  z-index: 1;
  padding: 24px;
  max-width: 1100px;
  margin: 20px auto 100px auto;
}
.personal__grid {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 100px;
  align-items: start;
}
@media (max-width: 1000px) {
  .personal__grid { grid-template-columns: 1fr; }
}
.personal__photo {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 14px 40px rgba(0,0,0,0.35);
  height:50vh;
  margin-bottom: 20px;
}
.personal__photo img { width: 100%; height: auto; display: block; }

.personal__content { color: #e8f4ff; text-align: left; }
.personal__title {
  font-weight: 900;
  font-size: clamp(32px, 5vw, 50px);
  margin: 0 0 30px 0;
}
.personal__subtitle { margin: 0 0 30px 0; font-size: 30px; opacity: 0.9; }
.personal__para { margin: 0 0 20px 0; line-height: 1.9; font-size: 18px; opacity: 0.95; }
</style>
