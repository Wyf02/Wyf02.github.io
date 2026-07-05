// Builds the low-poly cozy study room scene.
// Returns { interactables, update(t, dt), visit(key) } — RoomView.vue drives it.
import * as THREE from 'three'
import {
  woodTexture, floorTexture, wallTexture, corkTexture, rugTexture, paneTexture,
  screenTexture, notebookTexture, pagesTexture, clockTexture, sparkTexture, blobTexture
} from './roomTextures'

const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const BOOK_COLORS = ['#8c3f37', '#3f5c4c', '#b08d4f', '#54657e', '#7a5033', '#9c6b52', '#485d43', '#6e4a68', '#a8552f', '#37505c', '#845b4b', '#5b4a72']

export function buildRoom(scene, config) {
  const interactables = []
  const sparkleMap = new Map()
  const animated = { sparkles: [], dust: null, clock: null, lampLight: null, lampBase: 0 }
  // toggle states (desk lamp / curtains), animated smoothly in update()
  const state = { lampOn: true, lampCur: 1, curtainsClosed: false, curtainP: 0 }
  const MOON_BASE = 0.7
  let lampRoot = null
  let bulbMat = null
  let curtainRefs = null
  const pendingSparkles = []
  const loader = new THREE.TextureLoader()
  const sparkTex = sparkTexture()
  const blobTex = blobTexture()

  /* ---------- helpers ---------- */
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o })
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d)
  const C = (rt, rb, h, seg = 20, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open)
  const S = (r, ws = 12, hs = 10) => new THREE.SphereGeometry(r, ws, hs)
  const P = (w, h) => new THREE.PlaneGeometry(w, h)

  function add(parent, geo, mat, opt = {}) {
    const m = new THREE.Mesh(geo, mat)
    const p = opt.p || [0, 0, 0]
    const r = opt.r || [0, 0, 0]
    m.position.set(p[0], p[1], p[2])
    m.rotation.set(r[0], r[1], r[2])
    m.castShadow = opt.cast !== false
    m.receiveShadow = opt.receive !== false
    parent.add(m)
    return m
  }

  function group(parent, x, y, z, ry = 0) {
    const g = new THREE.Group()
    g.position.set(x, y, z)
    g.rotation.y = ry
    parent.add(g)
    return g
  }

  // load an image texture and crop it to cover a target aspect (like CSS background-size: cover)
  function photoMat(url, aspect, extra = {}) {
    const tex = loader.load(url, (t) => {
      const img = t.image
      if (!img || !img.width) return
      const ia = img.width / img.height
      if (ia > aspect) {
        t.repeat.set(aspect / ia, 1)
        t.offset.set((1 - aspect / ia) / 2, 0)
      } else {
        t.repeat.set(1, ia / aspect)
        t.offset.set(0, (1 - ia / aspect) / 2)
      }
      t.needsUpdate = true
    })
    tex.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, ...extra })
  }

  function register(root, opt) {
    root.userData.interact = true
    root.userData.kind = opt.kind
    root.userData.label = opt.label
    root.userData.payload = opt.payload || null
    root.userData.viewOffset = new THREE.Vector3(opt.viewOffset[0], opt.viewOffset[1], opt.viewOffset[2])
    root.userData.sparkleKey = opt.sparkleKey || null
    root.userData.hoverScale = opt.hoverScale !== false
    interactables.push(root)
  }

  // sparkle position is resolved after the whole scene is assembled (needs world matrices)
  function queueSparkle(key, root, off) {
    pendingSparkles.push({ key, root, off })
  }

  /* ---------- materials ---------- */
  const floorMat = std(0xffffff, { map: floorTexture(), roughness: 0.8 })
  const wallMat = std(0xffffff, { map: wallTexture('#b3a08a'), roughness: 0.95 })
  const deskWood = std(0xffffff, { map: woodTexture({ base: '#5d3a22', streak: '#432a16', light: '#7b5330' }), roughness: 0.7 })
  const shelfWood = std(0xffffff, { map: woodTexture({ base: '#6a452a', streak: '#4c2f1a', light: '#8a5c38' }), roughness: 0.75 })
  const darkWood = std(0x3f2d1d, { roughness: 0.7 })
  const brassMat = std(0xb08d4f, { metalness: 0.6, roughness: 0.4 })
  const pagesMat = std(0xe9dcc2, { map: pagesTexture(), roughness: 0.9 })

  /* ---------- room shell ---------- */
  add(scene, P(10.4, 8.4), floorMat, { r: [-Math.PI / 2, 0, 0], cast: false })
  add(scene, B(10.4, 4.3, 0.1), wallMat, { p: [0, 2.15, -4.05], cast: false })
  add(scene, B(0.1, 4.3, 8.4), wallMat, { p: [-5.05, 2.15, 0], cast: false })
  add(scene, B(0.1, 4.3, 8.4), wallMat, { p: [5.05, 2.15, 0], cast: false })
  add(scene, B(10.4, 0.1, 8.4), std(0x241b14, { roughness: 1 }), { p: [0, 4.3, 0], cast: false, receive: false })
  // baseboards
  const baseMat = std(0x4a3624, { roughness: 0.8 })
  add(scene, B(10.4, 0.14, 0.045), baseMat, { p: [0, 0.07, -3.975], cast: false })
  add(scene, B(0.045, 0.14, 8.4), baseMat, { p: [-4.975, 0.07, 0], cast: false })
  add(scene, B(0.045, 0.14, 8.4), baseMat, { p: [4.975, 0.07, 0], cast: false })

  // rug
  add(scene, new THREE.CircleGeometry(1.9, 48), std(0xffffff, { map: rugTexture(), roughness: 0.95 }), {
    p: [0.3, 0.012, -0.5], r: [-Math.PI / 2, 0, 0], cast: false
  })

  /* ---------- window (left wall) with moonlight ---------- */
  {
    const win = group(scene, -4.94, 2.25, -0.9, Math.PI / 2)
    const frameMat = std(0x4a3624, { roughness: 0.7 })
    add(win, B(1.7, 0.08, 0.1), frameMat, { p: [0, 0.91, 0] })
    add(win, B(1.7, 0.08, 0.1), frameMat, { p: [0, -0.91, 0] })
    add(win, B(0.08, 1.9, 0.1), frameMat, { p: [-0.81, 0, 0] })
    add(win, B(0.08, 1.9, 0.1), frameMat, { p: [0.81, 0, 0] })
    add(win, P(1.54, 1.74), new THREE.MeshBasicMaterial({ map: paneTexture() }), { p: [0, 0, -0.01], cast: false, receive: false })
    add(win, B(0.035, 1.74, 0.035), frameMat, { p: [0, 0, 0.02] })
    add(win, B(1.54, 0.035, 0.035), frameMat, { p: [0, 0, 0.02] })
    add(win, B(1.95, 0.06, 0.24), frameMat, { p: [0, -0.98, 0.07] })
    // curtain rod + curtains (clickable: draw open / closed)
    add(win, C(0.02, 0.02, 2.5), brassMat, { p: [0, 1.08, 0.14], r: [0, 0, Math.PI / 2] })
    const clothMat = std(0x6d4a3c, { roughness: 1 })
    const curtainL = add(win, B(0.42, 2.2, 0.09), clothMat, { p: [-1.0, -0.06, 0.14] })
    const curtainR = add(win, B(0.42, 2.2, 0.09), clothMat, { p: [1.0, -0.06, 0.14] })
    curtainRefs = { left: curtainL, right: curtainR }
    for (const cm of [curtainL, curtainR]) {
      register(cm, { kind: 'curtain', label: '窗帘 · 拉上', viewOffset: [0, 0, 0], sparkleKey: 'curtain', hoverScale: false })
    }
    queueSparkle('curtain', curtainL, [0.3, -1.0, 0])
  }
  const moon = new THREE.DirectionalLight(0xb9cce8, MOON_BASE)
  moon.position.set(-6.5, 3.6, -0.9)
  moon.target.position.set(1.4, 0.2, -0.6)
  moon.castShadow = true
  moon.shadow.mapSize.set(1024, 1024)
  moon.shadow.camera.left = -4.5
  moon.shadow.camera.right = 4.5
  moon.shadow.camera.top = 4.5
  moon.shadow.camera.bottom = -4.5
  moon.shadow.camera.near = 0.5
  moon.shadow.camera.far = 16
  moon.shadow.bias = -0.0015
  scene.add(moon)
  scene.add(moon.target)

  /* ---------- bookshelf with research books ---------- */
  {
    const shelf = group(scene, -2.75, 0, -3.58)
    add(shelf, B(0.07, 3.5, 0.4), shelfWood, { p: [-1.185, 1.75, 0] })
    add(shelf, B(0.07, 3.5, 0.4), shelfWood, { p: [1.185, 1.75, 0] })
    add(shelf, B(2.44, 0.07, 0.42), shelfWood, { p: [0, 3.465, 0] })
    add(shelf, B(2.3, 3.4, 0.03), std(0x4a3320, { roughness: 0.9 }), { p: [0, 1.75, -0.185], cast: false })
    const boards = [0.09, 0.9, 1.75, 2.6]
    for (const y of boards) add(shelf, B(2.3, 0.055, 0.36), shelfWood, { p: [0, y, 0] })

    const bookMat = () => std(pick(BOOK_COLORS), { roughness: 0.8 })
    const fillBooks = (boardY, xFrom, xTo, skip) => {
      let x = xFrom
      while (x < xTo - 0.05) {
        if (skip) {
          const hit = skip.find((s) => x > s[0] - 0.06 && x < s[1])
          if (hit) { x = hit[1] + 0.04; continue }
        }
        const roll = Math.random()
        if (roll < 0.1) { x += 0.05 + Math.random() * 0.07; continue }
        if (roll < 0.24) {
          // small horizontal stack
          const n = 2 + Math.floor(Math.random() * 2)
          const len = 0.24 + Math.random() * 0.06
          let y = boardY + 0.028
          for (let i = 0; i < n; i++) {
            const h = 0.035 + Math.random() * 0.022
            add(shelf, B(len, h, 0.2 + Math.random() * 0.05), bookMat(), {
              p: [x + len / 2 - 0.03, y + h / 2, 0.02 + rand(-0.02, 0.02)], r: [0, rand(-0.08, 0.08), 0]
            })
            y += h
          }
          x += len + 0.03
          continue
        }
        const w = 0.045 + Math.random() * 0.06
        const h = 0.5 + Math.random() * 0.2
        add(shelf, B(w, h, 0.24), bookMat(), { p: [x + w / 2, boardY + 0.028 + h / 2, 0.02] })
        x += w + 0.012
      }
    }

    // display books (research papers), cover facing out, on staggered shelves.
    // Up to 9 slots — new research items added to works.js automatically take the next free slot.
    const slots = [
      { x: -0.62, board: 0.9, ry: 0.14 },
      { x: 0.05, board: 1.75, ry: -0.05 },
      { x: 0.62, board: 2.6, ry: -0.16 },
      { x: 0.62, board: 0.9, ry: -0.12 },
      { x: -0.62, board: 1.75, ry: 0.1 },
      { x: -0.62, board: 2.6, ry: 0.12 },
      { x: 0.05, board: 0.9, ry: 0.05 },
      { x: 0.62, board: 1.75, ry: -0.1 },
      { x: 0.05, board: 2.6, ry: 0.06 }
    ]
    // decorative filler books skip the occupied display slots (built dynamically below)
    const skips = { 0.9: [], 1.75: [], 2.6: [] }
    config.books.forEach((bk, i) => {
      if (i >= slots.length) return
      const slot = slots[i]
      skips[slot.board].push([slot.x - 0.29, slot.x + 0.29])
      const bookRoot = group(shelf, slot.x, slot.board + 0.028 + 0.25, 0.06, slot.ry)
      const spineMat = std(['#8c3f37', '#3f5c4c', '#54657e'][i % 3], { roughness: 0.6 })
      const coverM = photoMat(bk.cover, 0.36 / 0.5)
      const mats = [pagesMat, spineMat, pagesMat, spineMat, coverM, spineMat]
      add(bookRoot, B(0.36, 0.5, 0.05), mats, { r: [-0.06, 0, 0] })
      register(bookRoot, {
        kind: 'research', label: bk.label, payload: bk.payload,
        viewOffset: [0, 0.08, 1.0], sparkleKey: 'book' + i
      })
      queueSparkle('book' + i, bookRoot, [0, 0.12, 0.08])
    })

    for (const y of boards) fillBooks(y, -1.08, 1.08, skips[y] || null)

    // small props: vase + plant on top of shelf
    const vase = group(shelf, -0.7, 3.5, 0)
    add(vase, C(0.06, 0.045, 0.16), std(0x8c9aa8, { roughness: 0.4 }), { p: [0, 0.08, 0] })
    add(vase, S(0.07, 10, 8), std(0x3f7a4f, { roughness: 0.9 }), { p: [0, 0.22, 0] })
    add(vase, S(0.05, 10, 8), std(0x356a45, { roughness: 0.9 }), { p: [0.07, 0.18, 0.03] })
    const globe = group(shelf, 0.75, 3.5, 0)
    add(globe, C(0.05, 0.07, 0.04), darkWood, { p: [0, 0.02, 0] })
    add(globe, S(0.11, 16, 12), std(0x4a708c, { roughness: 0.5 }), { p: [0, 0.16, 0], r: [0, 0, 0.35] })
  }

  /* ---------- desk & everything on it ---------- */
  const desk = group(scene, 1.75, 0, -3.3)
  add(desk, B(2.8, 0.09, 1.15), deskWood, { p: [0, 0.775, 0] })
  add(desk, B(2.64, 0.45, 0.04), deskWood, { p: [0, 0.5, -0.5] })
  for (const sx of [-1.3, 1.3]) for (const sz of [-0.49, 0.49]) {
    add(desk, B(0.08, 0.73, 0.08), darkWood, { p: [sx, 0.365, sz] })
  }

  // desk lamp (green banker style arm)
  {
    const lamp = group(desk, -1.05, 0.82, -0.34)
    const metal = std(0x2e4638, { metalness: 0.45, roughness: 0.45 })
    add(lamp, C(0.1, 0.12, 0.035), metal, { p: [0, 0.018, 0] })
    add(lamp, C(0.014, 0.014, 0.42), metal, { p: [0.06, 0.22, 0.02], r: [0, 0, -0.3] })
    add(lamp, S(0.024), metal, { p: [0.13, 0.42, 0.04] })
    add(lamp, C(0.012, 0.012, 0.38), metal, { p: [0.25, 0.5, 0.08], r: [0, 0, -1.05] })
    add(lamp, C(0.05, 0.11, 0.16, 20, true), std(0x2e4638, { metalness: 0.45, roughness: 0.45, side: THREE.DoubleSide }), { p: [0.42, 0.52, 0.12], r: [0.35, 0, -2.1] })
    const bulb = add(lamp, S(0.035, 10, 8), std(0xffd6a0, { emissive: 0xffd6a0, emissiveIntensity: 2.2, roughness: 0.4 }), { p: [0.45, 0.48, 0.13], cast: false })
    bulbMat = bulb.material
    bulbMat.userData.hl = true // exclude the bulb from hover-highlighting
    lampRoot = lamp
    register(lamp, { kind: 'lamp', label: '台灯 · 关灯', viewOffset: [0, 0, 0], sparkleKey: 'lamp' })
    queueSparkle('lamp', lamp, [0, 0.12, 0])
  }
  const lampSpot = new THREE.SpotLight(0xffbe82, 20, 6, 1.0, 0.6, 1.8)
  lampSpot.position.set(1.12, 1.36, -3.52)
  lampSpot.target.position.set(2.1, 0.82, -3.0)
  lampSpot.castShadow = true
  lampSpot.shadow.mapSize.set(1024, 1024)
  lampSpot.shadow.bias = -0.0025
  scene.add(lampSpot)
  scene.add(lampSpot.target)
  animated.lampLight = lampSpot
  animated.lampBase = lampSpot.intensity

  // laptop → projects
  {
    const laptop = group(desk, 0.55, 0.82, -0.02, -0.32)
    const alu = std(0xb9bdc4, { metalness: 0.6, roughness: 0.4 })
    add(laptop, B(0.6, 0.024, 0.4), alu, { p: [0, 0.012, 0] })
    add(laptop, P(0.52, 0.3), std(0x22262c, { roughness: 0.6 }), { p: [0, 0.0255, -0.02], r: [-Math.PI / 2, 0, 0], cast: false })
    const screenM = new THREE.MeshBasicMaterial({ map: screenTexture() })
    const alu2 = std(0xb9bdc4, { metalness: 0.6, roughness: 0.4 })
    add(laptop, B(0.6, 0.4, 0.018), [alu2, alu2, alu2, alu2, screenM, alu2], { p: [0, 0.2, -0.245], r: [-0.24, 0, 0] })
    register(laptop, {
      kind: 'projects', label: '电脑 · 我的项目', viewOffset: [0, 0.5, 1.1], sparkleKey: 'laptop'
    })
    queueSparkle('laptop', laptop, [0, 0.12, 0.1])
  }

  // notebook → blogs
  {
    const nb = group(desk, -0.42, 0.82, 0.28, 0.16)
    const leather = std(0x4d3a29, { roughness: 0.8 })
    const coverM = std(0xffffff, { map: notebookTexture(), roughness: 0.75 })
    add(nb, B(0.3, 0.045, 0.4), [leather, leather, coverM, leather, leather, leather], { p: [0, 0.023, 0] })
    add(nb, B(0.31, 0.049, 0.03), std(0x2a1f16, { roughness: 0.6 }), { p: [0, 0.024, 0.12] })
    register(nb, {
      kind: 'blogs', label: '手记 · 博客', viewOffset: [0, 0.85, 0.45], sparkleKey: 'notebook'
    })
    queueSparkle('notebook', nb, [0, 0.1, 0])
  }
  // pen next to notebook
  add(desk, C(0.008, 0.008, 0.28), std(0xb03636, { roughness: 0.4, metalness: 0.2 }), { p: [-0.12, 0.832, 0.42], r: [0, 0.4, Math.PI / 2] })

  // letter → about me
  {
    const letter = group(desk, 0.05, 0.82, 0.35, -0.14)
    add(letter, B(0.34, 0.014, 0.23), std(0xd8c096, { roughness: 0.9 }), { p: [0, 0.007, 0] })
    const flap = new THREE.Shape()
    flap.moveTo(-0.17, 0.115)
    flap.lineTo(0.17, 0.115)
    flap.lineTo(0, -0.03)
    flap.closePath()
    add(letter, new THREE.ShapeGeometry(flap), std(0xcfb283, { roughness: 0.9, side: THREE.DoubleSide }), { p: [0, 0.0155, 0], r: [-Math.PI / 2, 0, Math.PI] })
    add(letter, C(0.028, 0.028, 0.01), std(0xa83232, { roughness: 0.5 }), { p: [0, 0.02, 0.02] })
    register(letter, {
      kind: 'about', label: '一封信 · 关于我', viewOffset: [0, 0.8, 0.45], sparkleKey: 'letter'
    })
    queueSparkle('letter', letter, [0, 0.1, 0])
  }

  // mug
  {
    const mug = group(desk, 1.12, 0.82, -0.32)
    add(mug, C(0.052, 0.045, 0.11), std(0xba4a41, { roughness: 0.5 }), { p: [0, 0.055, 0] })
    add(mug, C(0.045, 0.045, 0.006), std(0x2a180e, { roughness: 0.9 }), { p: [0, 0.108, 0], cast: false })
    add(mug, new THREE.TorusGeometry(0.034, 0.01, 8, 16), std(0xba4a41, { roughness: 0.5 }), { p: [0.062, 0.055, 0] })
  }

  // paper stack + succulent
  for (let i = 0; i < 3; i++) {
    add(desk, B(0.26, 0.006, 0.34), std(0xece2ca, { roughness: 0.95 }), {
      p: [-0.85, 0.824 + i * 0.007, 0.16], r: [0, rand(-0.1, 0.1), 0], cast: false
    })
  }
  {
    const suc = group(desk, -1.28, 0.82, 0.32)
    add(suc, C(0.045, 0.055, 0.07), std(0xa05038, { roughness: 0.8 }), { p: [0, 0.035, 0] })
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const leaf = add(suc, S(0.028, 8, 6), std(0x4f8a5a, { roughness: 0.9 }), { p: [Math.cos(a) * 0.025, 0.085, Math.sin(a) * 0.025] })
      leaf.scale.set(1, 1.7, 1)
    }
  }

  // desk chair
  {
    const chair = group(scene, 1.75, 0, -2.28, Math.PI)
    for (const sx of [-0.19, 0.19]) for (const sz of [-0.19, 0.19]) {
      add(chair, C(0.018, 0.024, 0.46), darkWood, { p: [sx, 0.23, sz] })
    }
    add(chair, B(0.46, 0.045, 0.46), deskWood, { p: [0, 0.48, 0] })
    for (const sx of [-0.19, 0.19]) add(chair, C(0.016, 0.02, 0.5), darkWood, { p: [sx, 0.73, -0.2] })
    add(chair, B(0.4, 0.08, 0.025), deskWood, { p: [0, 0.8, -0.2] })
    add(chair, B(0.4, 0.08, 0.025), deskWood, { p: [0, 0.94, -0.2] })
  }

  /* ---------- corkboard with polaroids (above desk) ---------- */
  {
    const board = group(scene, 1.75, 2.35, -3.98)
    add(board, B(2.05, 1.2, 0.035), std(0xffffff, { map: corkTexture(), roughness: 1 }), { p: [0, 0, 0], cast: false })
    const frameMat = std(0x4a3624, { roughness: 0.7 })
    add(board, B(2.13, 0.05, 0.05), frameMat, { p: [0, 0.615, 0] })
    add(board, B(2.13, 0.05, 0.05), frameMat, { p: [0, -0.615, 0] })
    add(board, B(0.05, 1.18, 0.05), frameMat, { p: [-1.055, 0, 0] })
    add(board, B(0.05, 1.18, 0.05), frameMat, { p: [1.055, 0, 0] })

    const spots = [[-0.68, 0.27], [0, 0.3], [0.68, 0.26], [-0.66, -0.28], [0.02, -0.3], [0.66, -0.27]]
    config.polaroids.forEach((ph, i) => {
      if (i >= spots.length) return
      const pol = group(board, spots[i][0], spots[i][1], 0.045)
      pol.rotation.z = rand(-0.09, 0.09)
      add(pol, B(0.3, 0.37, 0.012), std(0xf4efe4, { roughness: 0.5 }), { cast: false })
      add(pol, P(0.26, 0.26), photoMat(ph.url, 1), { p: [0, 0.033, 0.008], cast: false })
      add(pol, S(0.013, 8, 6), std(0xc23a3a, { roughness: 0.4 }), { p: [0, 0.175, 0.012], cast: false })
      register(pol, {
        kind: 'photo', label: ph.label, payload: ph.payload,
        viewOffset: [0, 0, 0.95], sparkleKey: 'corkboard'
      })
    })
    queueSparkle('corkboard', board, [0, 0.16, 0.2])
  }

  /* ---------- framed photos (right wall) ---------- */
  {
    const zs = [-2.5, -1.15, 0.2]
    const ys = [2.3, 2.15, 2.35]
    config.frames.forEach((ph, i) => {
      if (i >= zs.length) return
      const fr = group(scene, 4.94, ys[i], zs[i], -Math.PI / 2)
      const frameMat = std(0x3a2a1a, { roughness: 0.6 })
      add(fr, B(0.74, 0.05, 0.05), frameMat, { p: [0, 0.445, 0] })
      add(fr, B(0.74, 0.05, 0.05), frameMat, { p: [0, -0.445, 0] })
      add(fr, B(0.05, 0.84, 0.05), frameMat, { p: [-0.345, 0, 0] })
      add(fr, B(0.05, 0.84, 0.05), frameMat, { p: [0.345, 0, 0] })
      add(fr, B(0.66, 0.86, 0.02), std(0xe9e2d2, { roughness: 0.9 }), { p: [0, 0, -0.006], cast: false })
      add(fr, P(0.56, 0.76), photoMat(ph.url, 0.56 / 0.76), { p: [0, 0, 0.012], cast: false })
      register(fr, {
        kind: 'photo', label: ph.label, payload: ph.payload,
        viewOffset: [-1.15, -0.05, 0], sparkleKey: 'frames', hoverScale: false
      })
      if (i === 1) queueSparkle('frames', fr, [-0.35, 0.1, 0])
    })
  }

  /* ---------- armchair corner ---------- */
  {
    const chair = group(scene, -2.35, 0, 0.85, 2.45)
    const fabric = std(0x46604f, { roughness: 0.95 })
    add(chair, B(0.9, 0.32, 0.85), fabric, { p: [0, 0.26, 0] })
    add(chair, B(0.82, 0.16, 0.72), std(0x51705d, { roughness: 0.95 }), { p: [0, 0.5, 0.03] })
    add(chair, B(0.9, 0.8, 0.24), fabric, { p: [0, 0.78, -0.36], r: [-0.1, 0, 0] })
    add(chair, B(0.17, 0.42, 0.85), fabric, { p: [-0.53, 0.55, 0] })
    add(chair, B(0.17, 0.42, 0.85), fabric, { p: [0.53, 0.55, 0] })
    add(chair, B(0.34, 0.3, 0.12), std(0xc9803c, { roughness: 0.95 }), { p: [0.1, 0.66, -0.22], r: [0.1, 0, 0.2] })
    for (const sx of [-0.38, 0.38]) for (const sz of [-0.32, 0.32]) {
      add(chair, C(0.024, 0.03, 0.11), darkWood, { p: [sx, 0.05, sz] })
    }
  }
  // side table with tiny book stack
  {
    const t = group(scene, -1.35, 0, 1.3)
    add(t, C(0.26, 0.26, 0.04), deskWood, { p: [0, 0.52, 0] })
    add(t, C(0.022, 0.028, 0.5), darkWood, { p: [0, 0.27, 0] })
    add(t, C(0.13, 0.16, 0.025), darkWood, { p: [0, 0.012, 0] })
    add(t, B(0.22, 0.035, 0.16), std(0x8c3f37, { roughness: 0.8 }), { p: [0, 0.56, 0], r: [0, 0.3, 0] })
    add(t, B(0.2, 0.03, 0.14), std(0x54657e, { roughness: 0.8 }), { p: [0.01, 0.59, 0.01], r: [0, -0.2, 0] })
  }

  /* ---------- floor lamp ---------- */
  {
    const fl = group(scene, -3.5, 0, 0.7)
    add(fl, C(0.16, 0.18, 0.025), darkWood, { p: [0, 0.012, 0] })
    add(fl, C(0.018, 0.018, 1.6), std(0x3a3a3a, { metalness: 0.5, roughness: 0.5 }), { p: [0, 0.8, 0] })
    add(fl, C(0.17, 0.24, 0.32, 24, true), std(0xe8d3ab, { roughness: 0.9, side: THREE.DoubleSide, emissive: 0xffdca8, emissiveIntensity: 0.35 }), { p: [0, 1.68, 0], cast: false })
    add(fl, S(0.045, 10, 8), std(0xffe2b0, { emissive: 0xffe2b0, emissiveIntensity: 2 }), { p: [0, 1.62, 0], cast: false })
    const pl = new THREE.PointLight(0xffcf9d, 5, 5.5, 2)
    pl.position.set(-3.5, 1.62, 0.7)
    scene.add(pl)
  }

  /* ---------- big plant (corner) ---------- */
  {
    const plant = group(scene, 4.35, 0, -3.3)
    add(plant, C(0.2, 0.25, 0.34), std(0x9c4f36, { roughness: 0.85 }), { p: [0, 0.17, 0] })
    add(plant, C(0.185, 0.185, 0.02), std(0x2a1c10, { roughness: 1 }), { p: [0, 0.34, 0], cast: false })
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + rand(-0.2, 0.2)
      const lh = rand(0.45, 0.85)
      const tilt = rand(0.25, 0.55)
      const stem = add(plant, C(0.008, 0.012, lh), std(0x2f5a3a, { roughness: 0.9 }), {
        p: [Math.cos(a) * 0.07, 0.34 + lh / 2 - 0.05, Math.sin(a) * 0.07]
      })
      stem.rotation.set(Math.sin(a) * tilt * 0.5, 0, -Math.cos(a) * tilt * 0.5)
      const lx = Math.cos(a) * (0.07 + Math.sin(tilt) * lh * 0.55)
      const lz = Math.sin(a) * (0.07 + Math.sin(tilt) * lh * 0.55)
      const leaf = add(plant, S(0.14, 10, 8), std(pick(['#3f7a4f', '#356a45', '#4a8a58']), { roughness: 0.9 }), {
        p: [lx, 0.3 + Math.cos(tilt) * lh, lz], r: [0, -a, rand(-0.4, 0.4)]
      })
      leaf.scale.set(1, 0.22, 1.6)
    }
  }

  /* ---------- pendant light ---------- */
  {
    add(scene, C(0.006, 0.006, 0.85), std(0x222222, { roughness: 0.8 }), { p: [0.3, 3.82, -1.1], cast: false })
    add(scene, C(0.09, 0.32, 0.26, 24, true), std(0x33513f, { metalness: 0.3, roughness: 0.5, side: THREE.DoubleSide }), { p: [0.3, 3.32, -1.1], cast: false })
    add(scene, S(0.05, 10, 8), std(0xffe2b0, { emissive: 0xffe2b0, emissiveIntensity: 2.2 }), { p: [0.3, 3.24, -1.1], cast: false })
    const pl = new THREE.PointLight(0xffd9ab, 9, 12, 2)
    pl.position.set(0.3, 3.15, -1.1)
    scene.add(pl)
  }

  /* ---------- wall clock (live time) ---------- */
  {
    const clock = group(scene, -0.55, 2.9, -3.96)
    add(clock, new THREE.TorusGeometry(0.17, 0.018, 10, 32), brassMat, { p: [0, 0, 0.01], cast: false })
    add(clock, new THREE.CircleGeometry(0.165, 32), std(0xffffff, { map: clockTexture(), roughness: 0.6 }), { p: [0, 0, 0.005], cast: false })
    const hourGeo = B(0.02, 0.09, 0.008)
    hourGeo.translate(0, 0.036, 0)
    const minGeo = B(0.013, 0.14, 0.008)
    minGeo.translate(0, 0.058, 0)
    const handMat = std(0x2a2018, { roughness: 0.5 })
    const hour = add(clock, hourGeo, handMat, { p: [0, 0, 0.02], cast: false })
    const minute = add(clock, minGeo, handMat, { p: [0, 0, 0.026], cast: false })
    add(clock, S(0.012, 8, 6), handMat, { p: [0, 0, 0.03], cast: false })
    animated.clock = { hour, minute }
    register(clock, { kind: 'clock', label: '挂钟 · 现在几点了？', viewOffset: [0, 0, 0.95], sparkleKey: 'clock', hoverScale: false })
    queueSparkle('clock', clock, [0, 0.1, 0.12])
  }

  /* ---------- fake contact shadows ---------- */
  {
    const blobs = [
      [1.75, -3.3, 3.2, 1.5], [-2.75, -3.56, 2.7, 0.9], [1.75, -2.3, 1.0, 1.0],
      [-2.35, 0.85, 1.6, 1.6], [-1.35, 1.3, 0.75, 0.75], [-3.5, 0.7, 0.6, 0.6], [4.35, -3.3, 0.8, 0.8]
    ]
    for (const [x, z, sx, sz] of blobs) {
      const m = add(scene, P(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }), {
        p: [x, 0.006, z], r: [-Math.PI / 2, 0, 0], cast: false, receive: false
      })
      m.scale.set(sx, sz, 1)
      m.renderOrder = 1
    }
  }

  /* ---------- floating dust motes ---------- */
  {
    const N = 90
    const pos = new Float32Array(N * 3)
    const base = []
    for (let i = 0; i < N; i++) {
      const x = rand(-4.2, 4.2)
      const y = rand(0.4, 3.2)
      const z = rand(-3.8, 0.5)
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
      base.push({ x, y, z, speed: rand(0.02, 0.06), phase: rand(0, 6.28) })
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
      map: sparkTex, color: 0xffd9a8, size: 0.035, transparent: true, opacity: 0.35,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)
    animated.dust = { pts, base }
  }

  /* ---------- ambient light ---------- */
  scene.add(new THREE.HemisphereLight(0xffe3c2, 0x201811, 0.55))
  scene.add(new THREE.AmbientLight(0x40342a, 0.5))

  /* ---------- resolve sparkles (needs world matrices) ---------- */
  scene.updateMatrixWorld(true)
  const box3 = new THREE.Box3()
  const center = new THREE.Vector3()
  for (const s of pendingSparkles) {
    box3.setFromObject(s.root)
    box3.getCenter(center)
    const mat = new THREE.SpriteMaterial({ map: sparkTex, color: 0xffd98a, transparent: true, opacity: 0.8, depthWrite: false })
    const sprite = new THREE.Sprite(mat)
    sprite.scale.set(0.17, 0.17, 1)
    sprite.position.set(center.x + s.off[0], box3.max.y + s.off[1], center.z + s.off[2])
    sprite.renderOrder = 5
    scene.add(sprite)
    const state = { sprite, baseY: sprite.position.y, phase: rand(0, 6.28), dim: false }
    animated.sparkles.push(state)
    sparkleMap.set(s.key, state)
  }

  /* ---------- api ---------- */
  function update(t, dt) {
    for (const s of animated.sparkles) {
      s.sprite.position.y = s.baseY + Math.sin(t * 1.8 + s.phase) * 0.035
      const target = s.dim ? 0.14 : 0.55 + 0.3 * Math.sin(t * 3 + s.phase)
      s.sprite.material.opacity += (target - s.sprite.material.opacity) * Math.min(1, dt * 6)
    }
    if (animated.dust) {
      const attr = animated.dust.pts.geometry.attributes.position
      const arr = attr.array
      const base = animated.dust.base
      for (let i = 0; i < base.length; i++) {
        const b = base[i]
        arr[i * 3] = b.x + Math.sin(t * 0.4 + b.phase) * 0.12
        let y = b.y + ((t * b.speed + b.phase) % 1.2)
        if (y > 3.4) y -= 3.0
        arr[i * 3 + 1] = y
      }
      attr.needsUpdate = true
    }
    if (animated.clock) {
      const now = new Date()
      const m = now.getMinutes() + now.getSeconds() / 60
      const h = (now.getHours() % 12) + m / 60
      animated.clock.hour.rotation.z = -(h / 12) * Math.PI * 2
      animated.clock.minute.rotation.z = -(m / 60) * Math.PI * 2
    }
    // desk lamp: smooth on/off + warm flicker
    if (animated.lampLight) {
      const targetOn = state.lampOn ? 1 : 0
      state.lampCur += (targetOn - state.lampCur) * Math.min(1, dt * 5)
      const flick = 1 + Math.sin(t * 11) * 0.02 + Math.sin(t * 5.7) * 0.02
      animated.lampLight.intensity = animated.lampBase * flick * state.lampCur
      if (bulbMat) bulbMat.emissiveIntensity = 0.05 + 2.15 * state.lampCur
    }
    // curtains: slide closed / open, moonlight fades with them
    if (curtainRefs) {
      const target = state.curtainsClosed ? 1 : 0
      state.curtainP += (target - state.curtainP) * Math.min(1, dt * 2.5)
      const p = state.curtainP
      curtainRefs.left.position.x = -1.0 + 0.62 * p
      curtainRefs.right.position.x = 1.0 - 0.62 * p
      const sx = 1 + 1.1 * p
      curtainRefs.left.scale.x = sx
      curtainRefs.right.scale.x = sx
      moon.intensity = MOON_BASE * (1 - 0.95 * p)
    }
  }

  function visit(key) {
    if (!key) return
    const s = sparkleMap.get(key)
    if (s) s.dim = true
  }

  function toggleLamp() {
    state.lampOn = !state.lampOn
    if (lampRoot) lampRoot.userData.label = state.lampOn ? '台灯 · 关灯' : '台灯 · 开灯'
    return state.lampOn
  }

  function toggleCurtains() {
    state.curtainsClosed = !state.curtainsClosed
    const label = state.curtainsClosed ? '窗帘 · 拉开' : '窗帘 · 拉上'
    curtainRefs.left.userData.label = label
    curtainRefs.right.userData.label = label
    return state.curtainsClosed
  }

  return { interactables, update, visit, toggleLamp, toggleCurtains }
}
