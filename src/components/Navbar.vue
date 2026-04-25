<template>
  <nav :class="['navbar', navbarClass ]">
    <div class="navbar__inner">
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/works">Works</router-link>
      <router-link to="/blogs">Blogs</router-link>
      <router-link to="/misc">Misc</router-link>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppNavbar',
  computed: {
    navbarClass() {
      if (this.$route.path === '/') return 'navbar--home';
      if (this.$route.path.startsWith('/works')) return 'navbar--works';
      if (this.$route.path === '/misc') return 'navbar--works';
      return 'navbar--default'
    }
  }
}
</script>

<style>
/* fixed to top with no gap */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  height: 10vh;
  display: flex;
  align-items: center;
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: 100%;
  padding: 0 20px;
}

.navbar a {
  font-weight: 700;
  text-decoration: none;
  font-size: 20px;
}

/* Home (over dark background) */
.navbar--home {
  /* background: rgba(127, 40, 40, 0.25); */
  -webkit-backdrop-filter: saturate(160%) blur(6px);
  backdrop-filter: saturate(160%) blur(6px);
}
.navbar--home a { color: #f2f6ff; }
.navbar--home a.router-link-exact-active { color: rgba(0, 149, 255, 0.851); }
.navbar--works{
  -webkit-backdrop-filter: saturate(160%) blur(6px);
  backdrop-filter: saturate(160%) blur(6px);
}
.navbar--works a { color: #f2f6ff; }
.navbar--works a.router-link-exact-active { color: #5BA689 }

/* Default (light) for other pages */
.navbar--default {
  background: rgba(255, 255, 255, 0.86);
  -webkit-backdrop-filter: saturate(160%) blur(6px);
  backdrop-filter: saturate(180%) blur(8px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.navbar--default a { color: #2c3e50; }
.navbar--default a.router-link-exact-active { color: #5BA689; }
</style>


