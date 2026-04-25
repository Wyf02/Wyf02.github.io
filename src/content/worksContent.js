import r1_pvis2025_art from './works/r1_pvis2025_art.md'
import r2_vis2025_octopus from './works/r2_vis2025_octopus.md'
import r3_vis2025_geo from './works/r3_vis2025_geo.md'
import p1_2025_me from './works/p1_2025_me.md'
import p2_2023_geek from './works/p2_2023_geek.md'

const worksContent = { r1_pvis2025_art, r2_vis2025_octopus, r3_vis2025_geo, p1_2025_me, p2_2023_geek }

export function getWorkContent(id) {
  return worksContent[id] || null
}
