<template>
  <div class="detail-wrap">

    <!-- ── Banner ── -->
    <div v-if="item" class="banner" :style="bannerStyle">
      <div class="banner__overlay"></div>
      
    </div>

    <!-- ── Body ── -->
    <div class="detail-body" v-if="item">

      <!-- Left sidebar: metadata -->
      <aside class="sidebar">
        <section class="meta-section">
            <router-link class="back" to="/works">← Back to Works</router-link>
        </section>
        
        <div class="nav-arrows" v-if="prevWork || nextWork">
          <router-link v-if="prevWork" :to="`/works/${prevWork.id}`" class="nav-btn nav-prev" title="Previous work">← {{ prevWork.title.substring(0, 20) }}</router-link>
          <router-link v-if="nextWork" :to="`/works/${nextWork.id}`" class="nav-btn nav-next" title="Next work">{{ nextWork.title.substring(0, 20) }} →</router-link>
        </div>
        <section class="meta-section">
          <h2 class="meta-section__title">Roles</h2>
          <div class="chips">
            <span class="chip chip--role" v-for="r in item.role || []" :key="`role-${r}`">{{ r }}</span>
          </div>
        </section>

        <section class="meta-section">
          <h2 class="meta-section__title">Tags</h2>
          <div class="chips">
            <span class="chip chip--tags" v-for="t in item.tags || []" :key="`tag-${t}`">{{ t }}</span>
          </div>
        </section>

        <section class="meta-section">
          <h2 class="meta-section__title">Language</h2>
          <div class="chips">
            <span class="chip chip--language" v-for="l in item.language || []" :key="`lang-${l}`">{{ l }}</span>
          </div>
        </section>

        <section class="meta-section">
          <h2 class="meta-section__title">Tech</h2>
          <div class="chips">
            <span class="chip chip--tech" v-for="t in item.tech || []" :key="`tech-${t}`">{{ t }}</span>
          </div>
        </section>

        <hr class="divider" />

        <section class="meta-section">
          <h2 class="meta-section__title">Links</h2>
          <div class="links" v-if="resolvedLinks.length">
            <a
              v-for="link in resolvedLinks"
              :key="link.label + link.url"
              :href="link.url"
              target="_blank"
              rel="noopener"
              class="link-btn"
            >{{ link.label }} ↗</a>
          </div>
          <p v-else class="empty">—</p>
        </section>
      </aside>

      <!-- Right main: header + content -->
      <main class="main">
        <header class="header">
          <div class="badges">
            <span class="badge badge--type">{{ item.type }}</span>
            <span class="badge badge--titletag">{{ item.titletag }}</span>
            <span class="badge badge--status">{{ item.status }}</span>
            <span class="badge badge--year">{{ item.year || '—' }}</span>
          </div>
          <h1 class="title">{{ item.title }}</h1>
          <p v-if="item.author" class="author">{{ item.author }}</p>
          <p class="desc">{{ item.description }}</p>
        </header>

        <!-- Content: Compiled Markdown -->
        <article class="content" v-if="contentHtml" v-html="contentHtml"></article>
        <div class="loading" v-else-if="loading">Loading content...</div>
      </main>

    </div>

    <!-- ── Not Found ── -->
    <div class="detail-body detail--empty" v-else>
      <h1>Work Not Found</h1>
      <p>The requested item does not exist or has been removed.</p>
      <router-link class="back" to="/works">Return to Works</router-link>
    </div>

  </div>
</template>

<script>
import { getWorkById, worksItems } from '@/data/works'
import { getWorkContent } from '@/content/worksContent'
import { marked } from 'marked'

export default {
  name: 'WorkDetailView',
  data() {
    return {
      contentHtml: '',
      loading: true
    }
  },
  computed: {
    item() {
      return getWorkById(this.$route.params.id)
    },
    bannerStyle() {
      if (!this.item) return {}
      const name = this.item.cover
      const isProj = this.item.type === 'project'
      let bg = ''
      if (name) {
        try { bg = `url('${require('@/assets/img/thumb/' + name)}')` } catch (e) { bg = '' }
        if (!bg) { try { bg = `url('${require('@/assets/img/' + name)}')` } catch (e) { bg = '' } }
      }
      if (!bg) {
        bg = isProj
          ? 'linear-gradient(135deg,#5ba689,#3b6e5b)'
          : 'linear-gradient(135deg,#3b6e5b,#2f4e43)'
      }
      return { backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center' }
    },
    resolvedLinks() {
      if (!this.item || !this.item.link) return []
      if (Array.isArray(this.item.link)) {
        const links = []
        if (this.item.link[0]) links.push({ label: 'Paper', url: this.item.link[0] })
        if (this.item.link[1]) links.push({ label: 'Material', url: this.item.link[1] })
        return links
      }
      return Object.entries(this.item.link).map(([label, url]) => ({ label, url }))
    },
    currentIndex() {
      return worksItems.findIndex(w => w.id === this.$route.params.id)
    },
    prevWork() {
      if (this.currentIndex <= 0) return null
      return worksItems[this.currentIndex - 1]
    },
    nextWork() {
      if (this.currentIndex < 0 || this.currentIndex >= worksItems.length - 1) return null
      return worksItems[this.currentIndex + 1]
    }
  },
  methods: {
    loadMarkdown() {
      if (!this.item) return
      this.loading = true
      try {
        const mdContent = getWorkContent(this.item.id)
        if (mdContent) {
          this.contentHtml = marked(mdContent)
        } else {
          this.contentHtml = '<p>No detailed content available for this work.</p>'
        }
      } catch (e) {
        console.error('Failed to load markdown:', e)
        this.contentHtml = '<p>Failed to load content.</p>'
      }
      this.loading = false
    }
  },
  watch: {
    '$route.params.id'() {
      this.loadMarkdown()
    }
  },
  mounted() {
    this.loadMarkdown()
  }
}
</script>

<style scoped>
/* ── Page ── */
.detail-wrap {
  min-height: 100vh;
  background: linear-gradient(180deg, #08130f 0%, #10211a 100%);
  color: #e8f4ff;
}

/* ── Banner ── */
.banner {
  width: 100%;
  height: 300px;
  position: relative;
  background-color: #2f4e43;
  overflow: hidden;
  margin-top: -10vh;
}

.banner__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(8,19,15,0.72) 100%);
}



/* ── Body: sidebar + main ── */
.detail-body {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  padding: 0 10vw 100px;
  align-items: start;
}

/* ── Sidebar ── */
.sidebar {
  position: sticky;
  top: 32px;
  padding: 36px 24px 36px 0;
  border-right: 1px solid rgba(255,255,255,0.08);
}

.meta-section {
  margin-bottom: 22px;
}

.meta-section__title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.45;
  margin: 0 0 8px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  border-width: 1px;
  border-style: solid;
  border-radius: 999px;
  padding: 2px 9px;
  font-size: 12px;
}

.chip--role     { border-color: #4DA3FF; color: #4DA3FF; }
.chip--tags     { border-color: #d174a6; color: #d174a6; }
.chip--language { border-color: #5BA689; color: #5BA689; }
.chip--tech     { border-color: #F59E0B; color: #F59E0B; }

.divider {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.09);
  margin: 18px 0;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 7px;
  border: 1px solid rgba(159, 224, 255, 0.3);
  color: #9fe0ff;
  font-weight: 700;
  text-decoration: none;
  font-size: 13px;
  transition: background 150ms, border-color 150ms;
}
.link-btn:hover {
  background: rgba(159, 224, 255, 0.1);
  border-color: rgba(159, 224, 255, 0.65);
}

.empty {
  margin: 0;
  opacity: 0.4;
  font-size: 13px;
}

/* ── Main ── */
.main {
  padding: 36px 0 36px 36px;
  text-align: left;
}

.header {
  margin-bottom: 36px;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.badge {
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.02em;
}

.badge--type     { background: rgba(255,255,255,0.14); }
.badge--titletag { background: #b0ffa6; color: #0a1722; font-weight: 800; }
.badge--status   { background: #9fe0ff; color: #0a1722; font-weight: 800; }
.badge--year     { background: rgba(255,255,255,0.14); }

.title {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.3;
  margin: 0 0 14px;
  letter-spacing: -0.01em;
  text-align: left;
}

.author {
  margin: 0 0 12px;
  color: #c7dff5;
  font-weight: 600;
  font-size: 14px;
  opacity: 0.9;
}

.desc {
  margin: 0;
  line-height: 1.85;
  font-size: 15px;
  opacity: 0.88;
}

/* ── Content (Markdown) ── */
.content {
  margin-top: 36px;
  padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,0.08);
  text-align: left;
}

:deep(.content) h1,
:deep(.content) h2,
:deep(.content) h3,
:deep(.content) h4 {
  text-align: left;
}

:deep(.content) h2 {
  margin: 36px 0 14px;
  font-size: 1.35rem;
  font-weight: 800;
  color: #e8f4ff;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding-bottom: 8px;
}

:deep(.content) h3 {
  margin: 24px 0 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #c7dff5;
}

:deep(.content) h4 {
  margin: 18px 0 8px;
  font-size: 1rem;
  font-weight: 700;
  opacity: 0.8;
}

:deep(.content) p {
  margin: 0 0 16px;
  line-height: 1.85;
  font-size: 15px;
  opacity: 0.88;
}

:deep(.content) ul,
:deep(.content) ol {
  margin: 0 0 16px 22px;
  padding: 0;
}

:deep(.content) li {
  margin-bottom: 8px;
  line-height: 1.75;
  font-size: 15px;
  opacity: 0.88;
}

:deep(.content) strong {
  color: #e8f4ff;
  font-weight: 700;
  opacity: 1;
}

:deep(.content) code {
  background: rgba(0,0,0,0.35);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #b0ffa6;
}

:deep(.content) pre {
  background: rgba(0,0,0,0.4);
  border-left: 3px solid #5BA689;
  padding: 16px 18px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 20px 0;
  font-size: 13px;
  text-align: left;
}

:deep(.content) pre code {
  background: none;
  padding: 0;
  color: #b0ffa6;
}

:deep(.content) blockquote {
  border-left: 3px solid #5BA689;
  margin: 20px 0;
  padding: 12px 18px;
  background: rgba(91,166,137,0.08);
  border-radius: 0 8px 8px 0;
  color: #9fe0ff;
  font-style: italic;
  text-align: left;
}

:deep(.content) blockquote p {
  margin: 0;
}

:deep(.content) a {
  color: #9fe0ff;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(159,224,255,0.4);
}

:deep(.content) a:hover {
  text-decoration-color: #9fe0ff;
}

:deep(.content) img {
  max-width: 100%;
  border-radius: 8px;
  margin: 20px 0;
  display: block;
}

:deep(.content) hr {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin: 32px 0;
}

.loading {
  margin-top: 32px;
  opacity: 0.6;
  font-size: 14px;
  text-align: left;
}

/* ── Navigation ── */
.nav-arrows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.nav-btn {
  display: block;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.15);
  color: #9fe0ff;
  font-size: 12px;
  text-decoration: none;
  transition: background 150ms, border-color 150ms;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-btn:hover {
  background: rgba(159, 224, 255, 0.1);
  border-color: rgba(159, 224, 255, 0.4);
}

.nav-prev { text-align: right; }
.nav-next { text-align: left; }

/* ── Not Found ── */
.back {
  color: #9fe0ff;
  font-weight: 700;
  text-decoration: none;
}
.back:hover { text-decoration: underline; }

.detail--empty {
  text-align: center;
  padding-top: 80px;
  grid-column: 1 / -1;
}

/* ── Responsive ── */
@media (max-width: 750px) {
  .banner { height: 220px; }
  .back--banner { top: 14px; left: 14px; }

  .detail-body {
    grid-template-columns: 1fr;
    padding: 0 16px 60px;
  }

  .sidebar {
    position: static;
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 28px 0 20px;
  }

  .main {
    padding: 24px 0 0;
  }

  .title { font-size: 1.55rem; }
}
</style>
