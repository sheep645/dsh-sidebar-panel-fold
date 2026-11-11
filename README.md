# dsh-sidebar-panel-fold

给 DeepSeek Harness 的左侧栏加一行折叠开关：点一下，把「插件」到「更多」这一整列面板入口收起来；再点一下恢复。

## 效果

侧边栏在「新会话」下方多出一行 **插件列表**（图标是一个会转的箭头）：

- **展开**：箭头朝下，下面的面板入口照旧：插件、插件市场、自动化任务、插件商城、上下文洞察、任务看板、命理、WorkBuddy 池、更多。
- **收起**：箭头转 90°，上述入口全部隐藏，只留这一行；「新会话」按钮和下方的工作区树不受影响。

折叠状态保存在 `localStorage`（键 `dsh.sidebar.panel-fold.collapsed`），刷新、重开窗口后保持。

## 安装

插件市场里搜 `dsh-sidebar-panel-fold`，或在命令行：

```bash
dsh plugin add dsh-sidebar-panel-fold
```

装完需要重启一次 `dsh web`，或刷新页面。

## 实现要点

- 通过 `sidebar.panellist` 槽以 `order: -100` 注册一行，因此排在面板列表最前面。
- 这一行没有对应的主面板，所以它的点击在 document 捕获阶段被消费掉（`preventDefault` + `stopPropagation`），不会触发侧边栏的 `selectPanel` 空面板报错。
- 折叠靠一条 CSS：`html[data-dsh-sidebar-panel-fold] nav:has([data-dsh-sidebar-panel-fold-toggle]) > *:not(:has([data-dsh-sidebar-panel-fold-toggle])) { display: none !important; }` —— 只隐藏面板列表里不带本插件标记的那些行。
- 只改自己的槽 + 一条作用域很窄的规则，不碰宿主代码。

## 兼容性

- 本机实测：DeepSeek Harness `0.2.2-rc.1`（desktop profile 的 Web 界面）。
- 依赖两项宿主能力：侧边栏的 `sidebar.panellist` 列表槽、CSS `:has()` 选择器。前者自侧边栏插件引入即有，后者要求 Chromium ≥ 105（Electron 新版均满足）。

## 开发

无需构建，仓库里的文件就是运行文件：

- `index.js` —— 宿主半边（空实现，只为让 bundle 可加载）
- `client.js` —— 客户端半边：注册折叠行、注入样式、处理点击
- `cordis.patch.yml` —— 把插件插入 profile 的 Loader 图
- `locale/{en,zh}.json` —— 插件市场里显示的标题与描述
- `icon.svg` —— 插件市场图标

## License

MIT
