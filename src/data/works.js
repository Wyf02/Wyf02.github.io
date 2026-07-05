export const worksItems = [
  {
    id: 'r1_pvis2025_art',
    type: 'research',
    titletag: 'conference',
    title: 'More Than Beautiful: Exploring Design Features, Practical Perspectives, and Implications of Artistic Data Visualization',
    author: 'Xingyu Lan, Yifan Wang, Lingyu Peng, Xiaofan Ma',
    description: 'Proceedings of the IEEE Pacific Visualization Conference (PacificVis 2025). 🏆 Best Paper Award',
    year: 2025,
    role: ['Researcher', 'Developer', 'Designer'],
    tags: ['Vis', 'Art'],
    language: ['Python', 'html/css/js'],
    tech: ['Vue.js', 'Echarts.js'],
    status: 'Published',
    link: ['https://arxiv.org/pdf/2502.04940', 'https://artisticvis.github.io/'],
    cover: 'pvis2025_art.png'
  },
  {
    id: 'r2_vis2025_octopus',
    type: 'research',
    titletag: 'journal',
    title: 'Unveiling the Visual Rhetoric of Persuasive Cartography: A Case Study of the Design of Octopus Maps',
    author: 'Daocheng Lin, Yifan Wang, Yutong Yang, Xingyu Lan',
    description: 'IEEE Transactions on Visualization and Computer Graphics (VIS 2025)',
    year: 2025,
    role: ['Researcher', 'Developer', 'Designer'],
    tags: ['Vis', 'Map', 'Machine Learning'],
    language: ['Python', 'html/css/js'],
    tech: ['Vue.js', 'Echarts.js'],
    status: 'Published',
    link: ['https://arxiv.org/abs/2507.11903', 'https://octopusmap.github.io/'],
    cover: 'vis2025_octopus.jpeg'
  },
  {
    id: 'r3_vis2025_geo',
    type: 'research',
    titletag: 'journal',
    title: '"Mapping What I Feel": Understanding Affective Geovisualization Design Through the Lens of People-Place Relationships',
    author: 'Xingyu Lan, Yutong Yang, Yifan Wang',
    description: 'IEEE Transactions on Visualization and Computer Graphics (VIS 2025)',
    year: 2025,
    role: ['Researcher', 'Developer', 'Designer'],
    tags: ['Vis', 'Map'],
    language: ['Python', 'html/css/js'],
    tech: ['Vue.js', 'Echarts.js', 'D3.js'],
    status: 'Published',
    link: ['https://arxiv.org/abs/2507.11841', 'https://affectivegeovis.github.io/'],
    cover: 'vis2025_geo.png'
  },
  {
    id: 'r4_vis2026_teen',
    type: 'research',
    titletag: 'journal',
    title: '"Mapping What I Feel": Understanding Affective Geovisualization Design Through the Lens of People-Place Relationships',
    author: 'Xingyu Lan, Xian Xu, Yifan Wang',
    description: 'IEEE Transactions on Visualization and Computer Graphic',
    year: 2026,
    role: ['Researcher', 'Developer', 'Designer'],
    tags: ['Vis', 'Map'],
    language: ['Python', 'html/css/js'],
    tech: ['Vue.js', 'D3.js'],
    status: 'Published',
    link: ['https://ieeexplore.ieee.org/document/11552031', 'https://vis4teens.github.io/'],
    cover: 'vis2026_teen.png'
  },
  {
    id: 'p1_2025_me',
    type: 'project',
    titletag: 'Personal project',
    title: 'Personal Site',
    description: 'Portfolio and blog.',
    year: 2025,
    role: ['Developer', 'Designer'],
    tags: ['Web Developmet'],
    language: ['html/css/js'],
    tech: ['Vue.js'],
    status: 'Ongoing',
    link: { Website: 'https://wyf02.github.io/' },
    cover: 'proj2025_me.png'
  },
  {
    id: 'p2_2023_geek',
    type: 'project',
    titletag: 'Product',
    title: '知云云服务供应链威胁感知系统',
    description: '【前端开发负责人、产品负责人】通过BERT模型获取漏洞信息的句向量，结合KNN分类、多项式朴素贝叶斯模型等方式修正/补全漏洞评分、漏洞类型及危害；基于深度学习的关联性评估模型，获取漏洞补丁。采用控制流分析、数据流分析技术分析漏洞可达性，并进行盯向模糊测试，验证漏洞可触发性。另开发可视分析系统、数字大屏等前端页面。',
    year: 2023,
    role: ['Developer', 'Designer'],
    tags: ['Web Developmet', 'Machine Learning'],
    language: ['html/css/js'],
    tech: ['Vue.js', 'BERT'],
    status: 'Archived',
    link: {
      Website: 'https://wyf02.github.io/GEEK2023/',
      Github: 'https://github.com/wyf02/GEEK2023'
    },
    cover: 'proj2023_geek.png'
  }
]

export function getWorkById(id) {
  return worksItems.find((item) => item.id === id)
}
