# wyf2025

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).




✅ 加一篇新论文（works.js 里加一条 type: 'research'）
- 书架自动多一本封面朝外的书（最多 9 本，按预设位置错落排开，装饰书会自动让位）
- 封面自动用 cover 字段对应的 assets/img/thumb/ 缩略图
- 点开的纸页（标题/作者/链接/tags）全部从数据渲染
- 唯一可选的手动项：RoomView.vue 顶部的 BOOK_LABELS 里加一条悬浮提示文案，不加就显示默认的「论文 · 年份」

✅ 加一个新项目（type: 'project'）
- 电脑纸页列表自动出现，零改动

✅ 加新照片（misc.js）
- 点开照片墙后的左右翻页画廊自动包含同分类的所有新照片
- 墙上实体挂哪几张是策展性的（POLAROID_IDS / FRAME_IDS 两个数组，改一下 id 就换）——这个我故意保留手动，因为墙面位置有限，挂哪张应该由你挑

和整站原有机制一致的部分：详情页 /works/:id 还需要你在 content/works/ 加 md 文件并在 worksContent.js 注册 import——这是网站本来的流程，书房纸页上的「阅读详情 →」链接会自动指过去。

总结成加论文的最小步骤：
1. data/works.js 加条目 + assets/img/thumb/ 放封面图
2. （可选）content/works/xxx.md + worksContent.js 注册，详情页才有内容
3. 书房、Works 页、首页卡片全都自动更新
