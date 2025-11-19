
<template>
  <div class="blogs">
    <section class="pinned">
      <div class="pinned-list">
        <article v-for="item in pinned" :key="item.id" class="pinned-item">
          <a :href="item.link" target="_blank" rel="noopener" class="pinned-link">
            <div class="pinned-meta">
              <h3 class="pinned-title">{{ item.title }}</h3>
              <p class="pinned-excerpt">{{ item.excerpt }}</p>
              <div class="pinned-footer">
                <span class="pinned-date">{{ item.date }}</span>
                <span class="pinned-tag" v-if="item.tag">{{ item.tag }}</span>
              </div>
            </div>
          </a>
        </article>
      </div>
    </section>

    <section class="content">
      
      <h1>🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧</h1>
      <p>Latest posts and writings.</p>
      <!-- https://mp.weixin.qq.com/s/achw2tYPwVepKQAeuXOM2A [more than beautiful]-->
    </section>

  </div>
</template>

<script>
export default {
  name: 'BlogsView',
  data() {
    return {
      pinned: [
        { id: 1, title: 'leetcode notebook', excerpt: 'my lc practise book', date: '2025-11-19', link: 'https://wyf02.github.io/lcbook/', tag: 'pinned' },
        { id: 2, title: 'My CSDN', excerpt: 'CSDN PAGES， not a lot, but🚧🚧🚧', date: '2020-now', link: 'https://blog.csdn.net/weixin_51561130', tag: 'pinned' },
        { id: 3, title: 'My Github', excerpt: 'Welcome! 🚧🚧🚧', date: '2020-now', link: 'https://github.com/Wyf02', tag: 'pinned' }
      ]
    }
  }
}
</script>

<style scoped>
.blogs {
  padding: 24px;
}
.pinned {
  width: 80%;
  margin: 0 auto;
}

.pinned h2 {
  margin: 0 0 12px;
  font-size: 1.2rem;
}
.pinned-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
.pinned-item {
  background: #ffffff;
  border: 1px solid #5ba6892b;
  padding: 12px;
  border-radius: 10px;
  width: 300px;
   box-shadow: 0 4px 12px rgba(0,0,0,0.08);

  transition: transform .15s ease, box-shadow .15s ease;
}
.pinned-item:hover { transform: translateY(-4px); }
.pinned-link { color: inherit; text-decoration: none; display:block; }
.pinned-title { margin: 0 0 6px; font-size: 1rem; }
.pinned-excerpt { margin: 0 0 8px; color: #555; font-size: 0.9rem; }
.pinned-footer { display:flex; justify-content:space-between; font-size:0.8rem; color:#888; }
.pinned-tag { background:#5BA689; padding:2px 6px; border-radius:4px; color:white; }
.content { margin-top: 8px; }
</style>




