<template>
  <AppNavbar v-if="$route.name !== 'room'" />
  <div class="page" :class="{ 'page--room': $route.name === 'room' }">
  <router-view/>
  </div>
</template>

<script>
import AppNavbar from './components/Navbar.vue'
export default {
  name: 'App',
  components: { AppNavbar }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* Reset default body margin to avoid top gap */
html, body { margin: 0; }

/* Leave space for fixed navbar (approx 52px height) */
.page {
  padding-top: 10vh;
}
/* Full-viewport immersive pages (3D room) */
.page--room {
  padding-top: 0;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
