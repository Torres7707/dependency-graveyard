# Dependency Graveyard 设计文档

> 粘贴一个 `package.json`，你的依赖变成一片墓园：谁还活着（alive），谁是僵尸（zombie），谁成了幽灵（ghost），谁已入土（buried）。

- 技术栈：React 19 + TypeScript + Vite，纯前端，无后端、无账号、无 API Key
- 视觉方向：暗黑哥特童话（dark gothic fairy tale），手绘绘本感，阴森但可爱
- 文档日期：2026-11-13（文中库版本均为当日 npm 最新版，API 行为均已用 curl 实测）

---

## 1. 产品定义

### 1.1 核心流程

1. **墓园大门（Landing）**：一本摊开的羊皮纸"亡者名册"，用户把 `package.json` 粘贴进去，或拖入文件，或点"示例墓园"。
2. **招魂仪式（Loading）**：每解析完一个依赖，就点亮一根蜡烛；进度条是一排蜡烛，而不是转圈。
3. **墓园（Graveyard）**：依赖按状态分进四个墓区，每个依赖一块墓碑，墓碑上是会动的状态图标。
4. **墓志铭（Detail）**：点击墓碑，墓碑放大成详情卡片，展示最后发布时间、周下载量、弃用原因、仓库链接，以及一句自动生成的墓志铭。
5. **分享**：导出墓园海报 PNG，或复制分享链接（数据压缩进 URL hash，不经过服务器）。

### 1.2 状态判定规则

数据来源见第 4 节。按以下优先级，命中即停：

| 优先级 | 状态 | 规则 | 中文名 | 墓区 |
|---|---|---|---|---|
| 1 | `ghost` 幽灵 | 默认版本（latest）被 npm 标记为 deprecated | 游魂 | 迷雾回廊 |
| 2 | `alive` 存活 | 最近一次发布 ≤ 12 个月 | 守夜人 | 烛光花园 |
| 3 | `zombie` 僵尸 | 最近发布 > 12 个月，但周下载 ≥ 50,000 | 行尸 | 腐土荒原 |
| 4 | `buried` 入土 | 最近发布 > 12 个月，且周下载 < 50,000 | 长眠者 | 静默墓地 |
| — | `lost` 失踪 | 查询失败、包不存在、`file:` / `git:` / `workspace:` 等无法查询的声明 | 无名冢 | 墓园外围 |

- 阈值（12 个月、5 万周下载）放在一个 `config.ts` 里，UI 上提供"判定规则"说明浮层。
- `lost` 是独立状态，**绝不能把查询失败显示成 buried**。
- 页面底部常驻声明："这里展示的是维护活跃度，不是安全审计。不活跃不代表不安全。"

### 1.3 解析规则

- 读取 `dependencies`、`devDependencies`，并提供开关包含 `peerDependencies`、`optionalDependencies`；每块墓碑标出来源（dev 依赖墓碑更小）。
- `"foo": "npm:bar@^2"` 这种别名，查询 `bar`，墓碑显示 `foo → bar`。
- `file:`、`link:`、`workspace:`、`git+`、`github:`、URL 声明直接归为 `lost`，原因写"无法从 npm 招魂"。
- 用 `zod` 校验输入是对象；JSON 解析失败时，在名册上显示红墨水批注，指出出错行列。
- 上限 300 个依赖，超出时提示并截断。

---

## 2. 视觉设计

### 2.1 风格关键词

绘本插画 + 剪纸剪影 + 烛光。参考方向是 19 世纪铜版画、剪影皮影戏、东欧童话绘本的配色。要阴森，但要让人想截图分享，所以角色都是圆润、大眼睛、有点呆萌的。

**原创约束**：只借鉴"风格类型"，不复刻任何具体电影、游戏或动画的角色、场景和美术。所有角色（幽灵、僵尸手、乌鸦、南瓜灯）都自己画。

### 2.2 色板（CSS 变量 / Tailwind theme token）

| Token | 值 | 用途 |
|---|---|---|
| `--ink-night` | `#0d0b14` | 页面背景、最深夜空 |
| `--plum-dusk` | `#2a1b3d` | 夜空渐变上段、卡片底 |
| `--violet-mist` | `#4b3a6b` | 远景剪影、次级边框 |
| `--bone` | `#e8e0cc` | 正文、墓碑石面亮部 |
| `--stone` | `#8a8597` | 墓碑主体 |
| `--candle` | `#f2b950` | alive 主色、蜡烛光、主按钮 |
| `--moss` | `#7d9a3c` | zombie 主色 |
| `--ectoplasm` | `#9fd8e8` | ghost 主色、幽光 |
| `--grave-soil` | `#5a4636` | buried 主色、泥土 |
| `--rose-blood` | `#a8323e` | 错误、警示（少量使用） |

- 正文 `--bone` 对 `--ink-night` 对比度 > 14:1，次要文字不低于 4.5:1。
- 状态不能只靠颜色区分：每个状态有独立剪影 + 文字标签。

### 2.3 字体（全部 OFL 开源，用 `@fontsource` 自托管）

| 用途 | 字体 | 包 |
|---|---|---|
| 大标题、墓区名 | Grenze Gotisch（哥特黑体字） | `@fontsource/grenze-gotisch` |
| 墓碑刻字、墓志铭 | IM Fell English（老式铅字，有印刷瑕疵感） | `@fontsource/im-fell-english` |
| 正文、按钮、数据 | Crimson Pro（易读衬线） | `@fontsource/crimson-pro` |
| 包名、版本号 | 系统等宽字体 `ui-monospace` | — |

中文界面文字回退到系统宋体（`"Songti SC", "Noto Serif SC", serif`），衬线和整体风格一致。哥特字体只用于英文大标题，不要用在正文上，可读性差。

### 2.4 场景分层（从后往前）

```
z0  夜空        径向渐变 ink-night → plum-dusk，地平线一抹暗橙
z1  月亮        SVG，带陨坑；随滚动缓慢上移（视差）
z2  云层 ×2     SVG 剪影，CSS transform 横向漂移，速度不同
z3  远景剪影    教堂尖塔、枯树、铁栅栏，两层不同透明度
z4  萤火 / 灰烬 tsParticles，30~50 个粒子，鼠标靠近时散开
z5  低空雾 ×2   两张宽幅半透明 SVG，反向缓慢平移
z6  地面        泥土 + 草叶剪影，墓区分隔小路
z7  墓碑网格    可交互层
z8  前景雾      很淡的一层，从墓碑底部飘过，制造纵深
z9  UI          顶栏、筛选、图例、对话框
```

装饰层一律 `pointer-events: none`，`aria-hidden="true"`。

### 2.5 墓区布局

四个墓区横向（桌面）或纵向（手机）排布，每区有自己的氛围：

- **烛光花园（alive）**：暖色地光，小花和发芽的蘑菇，墓碑完整干净。
- **腐土荒原（zombie）**：泥土隆起，地面偶尔有土块弹起，墓碑有裂纹和青苔。
- **迷雾回廊（ghost）**：此区雾最浓，带冷蓝色光晕，墓碑半透明。
- **静默墓地（buried）**：最暗，乌鸦站在倒伏的墓碑上，蛛网和枯藤。

每个墓区标题旁显示数量，比如 `静默墓地 · 7`。顶部有一个"墓园健康度"仪表：一根蜡烛的燃烧长度 = alive 占比。

### 2.6 墓碑组件

- 墓碑外形：每个状态 3 种 SVG 变体（圆顶、十字、方尖碑），根据包名的稳定哈希选择，所以同一个包每次都长一样。
- 倾斜角 −4°~4°、前后层深度，也来自同一个哈希，**渲染期间不用 `Math.random()`**。
- 碑面刻字：包名（过长时缩小字号，再长则省略并在 tooltip 显示全名）+ 声明的版本范围。
- 碑顶或碑旁是状态图标（见第 3 节）。
- 整个墓碑是一个 `<button>`，`aria-label` 写完整信息，例如 "moment，僵尸：最后发布于 2022 年 12 月，周下载 2,100 万"。

### 2.7 其余界面

- **顶栏**：Logo（月亮里的墓碑剪影）+ "重新招魂"按钮 + 声音开关 + 动效开关。
- **筛选器**：四个状态做成四枚"护身符"徽章，点击切换显示；另有搜索框和 dev/prod 切换。
- **表格视图**：一个"翻开名册"按钮切换到纯表格，可排序，给想看数据的人和屏幕阅读器用户。
- **详情对话框**：羊皮纸卡片，火漆印颜色对应状态。内容：状态、最后发布时间、最新版本、周下载、弃用原因、仓库链接、GitHub stars（有的话）、墓志铭。
- **空状态 / 错误**：名册上的红墨水批注，配一只摇头的乌鸦。

### 2.8 墓志铭生成

模板库，每个状态 8~10 条，由包名哈希选择，数据插值：

- alive：`"{name}，仍在烛光下守夜。最后一次低语：{days} 天前。"`
- zombie：`"{name} 早已停止呼吸（{lastPublish}），但每周仍有 {downloads} 人把它从土里拽出来。"`
- ghost：`"{name} 的魂魄仍在游荡。遗言：'{deprecatedReason}'"`
- buried：`"此处长眠着 {name}，生于 {created}，最后一次出现于 {lastPublish}。愿它安息。"`

---

## 3. 状态图标与动效（重点）

### 3.1 实现方式选择

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| **手绘 SVG + Motion（motion/react）** | 颜色直接用 CSS token；动效可随 hover / 进入视口 / 减弱动效切换；体积小；可以按包名哈希做变体 | 需要自己画 SVG 并拆分图层 | **主方案** |
| Lottie（`@lottiefiles/dotlottie-react`） | 设计师在 AE 里做，效果细腻 | 改色、交互状态切换麻烦；免费素材风格难统一；几十个实例同时播放有性能压力 | 只用于 Landing 页一个大型开场动画（可选） |
| Rive（`@rive-app/react-canvas`） | 状态机交互强 | 学习成本高，黑客松时间不够；Canvas 不利于无障碍 | 不用 |

### 3.2 SVG 绘制规范

- 每个图标画在 `viewBox="0 0 64 64"`，需要动的部分拆成独立 `<g>`，加 `id` 方便在 React 里拆成组件。
- 用 Figma 或 Inkscape 手绘，导出后用 SVGO 清理，再用 SVGR（`vite-plugin-svgr`）转成组件，或直接手写 JSX。
- 线条统一 2px 描边、圆角端点，填充用 token 色，暗部用 `--ink-night` 20% 透明叠色，保持绘本感。
- 质感用 SVG 滤镜 `feTurbulence + feDisplacementMap` 给边缘加轻微手绘抖动，**不用位图贴图**。

### 3.3 四个状态的动效设计

所有动画只改 `transform`、`opacity`，以及少量 SVG `pathLength` / `d`。

**alive · 守夜蜡烛（南瓜灯里的蜡烛）**
- 火苗：`scaleY` 0.92↔1.08 + `skewX` −4°↔4°，1.2s 不规则关键帧循环，`transformOrigin: bottom`。
- 光晕：一个径向渐变圆，`opacity` 0.5↔0.8、`scale` 0.95↔1.05 呼吸。
- 南瓜灯的眼睛透出的光与火苗同步闪烁。
- hover：火苗变高，掉出两三颗火星（小圆点向上飘散后消失）。

**zombie · 破土之手**
- 入场：手从土里升起，`y: 24 → 0`，带 spring 回弹，土块向两侧弹开。
- 循环：手指轮流弯曲（每根手指一个 `<g>`，`rotate` 错开 0.15s），手腕左右摇晃 `rotate` −6°↔6°，2.4s。
- 墓碑上的绿色眼睛每 3~6 秒眨一次（延迟由哈希决定，避免所有僵尸同时眨眼）。
- hover：手猛地抓一下（`scale` 1 → 1.15 → 1），掉下一小块土。

**ghost · 游魂**
- 漂浮：`y` 0 ↔ −6px，3s 正弦缓动，加 `rotate` ±2°。
- 尾巴：裙摆路径 `d` 在两个关键形状之间插值（两条 path 必须有相同的点数和命令），营造飘动。
- 透明度：`opacity` 0.65 ↔ 0.9 呼吸，外层蓝色 `drop-shadow` 光晕同步。
- 眼睛：桌面端跟随鼠标（`useMotionValue` + `useTransform`，最大偏移 2px）。
- hover：幽灵受惊，缩成一团再弹开，短暂变透明。

**buried · 长眠墓 + 乌鸦**
- 入场：枯藤从碑脚爬上墓碑，`pathLength: 0 → 1`，1.2s。
- 循环：墓碑静止（入土就是不动），乌鸦每 4~8 秒歪一下头、偶尔抖抖翅膀。
- 墓前的小土堆偶尔飘起一缕灰尘。
- hover：乌鸦"嘎"一声（开启声音时）扑翅飞起再落回。

**lost · 无名冢**
- 一个问号形状的鬼火，缓慢左右飘移，静音、低调。

### 3.4 全局动效

- **入场"破土而出"**：墓碑按墓区依次从地面下 `y: 40, opacity: 0` 升起，`staggerChildren: 0.04`，带 spring。
- **加载仪式**：每个依赖结果返回，就点亮一根蜡烛（火苗从 `scale: 0` 窜起）；全部完成后一阵风吹过，雾散开，墓园出现。
- **墓碑 → 详情**：用 Motion 的 `layoutId` 做共享元素过渡，墓碑放大变形成羊皮纸卡片。
- **筛选切换**：`AnimatePresence` + `layout`，被筛掉的墓碑沉入地下，剩下的平滑重排。
- **滚动视差**：`useScroll` 驱动月亮、云层、远景剪影以不同速度移动。

### 3.5 性能与无障碍

- 同一时间最多 8 个墓碑播放循环动画（离视口中心最近的），滚动时全部暂停；每个图标只有一个整体循环，细节动作只在悬停时播放。见 `docs/PERFORMANCE.md`。
- 依赖超过 80 个时自动进入"轻量模式"：关闭循环动画，只保留入场和 hover。
- `useReducedMotion()` 为真，或用户在顶栏关闭动效时：所有循环动画停止，粒子和雾层隐藏，过渡改为淡入淡出。在 `<MotionConfig reducedMotion="user">` 下统一处理。
- 粒子数手机端减半；`ghost` 的 path `d` 插值只对视口内实例开启。
- 目标：中端笔记本 60 fps，80 块墓碑以内无掉帧。

---

## 4. 数据源（均已实测，支持浏览器跨域 CORS `*`）

### 4.1 deps.dev（主数据源，Google 维护，免费免 Key）

```
GET https://api.deps.dev/v3/systems/npm/packages/{name}
```
返回所有版本，每个版本含 `publishedAt`、`isDefault`、`isDeprecated`、`deprecatedReason`。一次请求就能拿到：最近发布时间（所有版本 `publishedAt` 的最大值）、默认版本是否弃用、弃用原因。实测 `left-pad` 返回 `isDeprecated: true, deprecatedReason: "use String.prototype.padStart()"`。

包名需要 `encodeURIComponent`，scoped 包 `@types/node` 编码为 `%40types%2Fnode`。

可选补充（详情对话框打开时才请求）：
```
GET https://api.deps.dev/v3/systems/npm/packages/{name}/versions/{version}  → relatedProjects 拿到 GitHub 仓库
GET https://api.deps.dev/v3/projects/github.com%2F{owner}%2F{repo}          → starsCount、openIssuesCount、license
```

### 4.2 npm 下载量 API

```
GET https://api.npmjs.org/downloads/point/last-week/{a},{b},{c}
```
- 非 scoped 包可以批量查询（一次最多 128 个），返回 `{ [name]: { downloads } }`。
- **scoped 包不支持批量**（实测返回 `scoped packages are not currently supported in bulk lookups`），需要逐个请求 `/downloads/point/last-week/@scope/name`。

### 4.3 npm registry（备用）

如果 deps.dev 不可用，退回 `https://registry.npmjs.org/{name}/latest`（约 2KB，含 `deprecated` 字段）。**不要请求完整 packument** `registry.npmjs.org/{name}`：react 的完整文档实测约 7MB。

### 4.4 请求策略

- 用 TanStack Query 管理每个包的请求、缓存和重试（重试 1 次）。缓存可用 `persistQueryClient` 存到 `localStorage`，有效期 6 小时，再次分析同一个文件时秒出结果。
- 用 `p-limit` 把并发限制在 6。
- 每个依赖独立处理：一个失败只让它变成 `lost`，不影响其他。
- 隐私：只把包名发给 deps.dev 和 npm，不上传整个 `package.json`，不发送任何其他字段。页面上说明这一点。

---

## 5. 外部库清单

| 类别 | 库 | 版本 | 用途 |
|---|---|---|---|
| 框架 | `react` / `react-dom` | 19.3.1 | UI |
| 构建 | `vite` + `@vitejs/plugin-react` | 8.3.8 | 开发与打包 |
| 语言 | `typescript` | 最新 | 类型 |
| 样式 | `tailwindcss` | 4.3.5 | 原子类 + `@theme` 定义色板 token |
| 动效 | `motion`（`import { motion } from "motion/react"`） | 14.13.0 | 全部 UI 动效 |
| 粒子 | `@tsparticles/react` + `@tsparticles/slim` | 4.5.4 | 萤火、灰烬 |
| 数据请求 | `@tanstack/react-query` | 5.107.1 | 请求、缓存、重试 |
| 并发 | `p-limit` | 7.3.3 | 限流 |
| 状态 | `zustand` | 5.1.0 | 筛选、视图模式、动效 / 声音开关 |
| 校验 | `zod` | 4.6.7 | 校验 package.json 结构 |
| 版本 | `semver` | 7.8.6 | 解析版本范围、判断声明版本是否落后 |
| 无障碍组件 | `@radix-ui/react-dialog`、`@radix-ui/react-tooltip` | 1.3.1 / 1.4.1 | 对话框焦点管理、提示 |
| 图标 | `lucide-react` | 1.72.0 | 普通 UI 小图标（搜索、关闭、声音） |
| 音效 | `howler` | 2.2.4 | 环境音、hover 音效，默认关闭 |
| 导出图片 | `html-to-image` | 1.11.13 | 墓园海报 PNG |
| 分享链接 | `lz-string` | 1.5.0 | 把依赖列表压缩进 URL hash |
| 字体 | `@fontsource/grenze-gotisch`、`im-fell-english`、`crimson-pro` | 5.3.0 | 自托管字体 |
| SVG | `vite-plugin-svgr`（dev） | 最新 | SVG 转组件 |
| 测试 | `vitest`、`@testing-library/react`、`msw` | 5.1.0 / 16.3.3 / 3.0.5 | 单元测试、组件测试、mock API |

刻意不用的：UI 组件库（MUI、Ant Design 等风格难改成哥特风）、GSAP（Motion 已足够，避免两套动画系统）、Three.js（3D 墓园好看，但黑客松时间和性能风险太大）。

---

## 6. 素材来源

| 素材 | 来源 | 许可 | 说明 |
|---|---|---|---|
| 状态图标、墓碑、角色 | **自己画**（Figma / Inkscape） | 自有 | 核心资产，必须原创，保证风格统一、可拆层做动画 |
| 场景剪影（教堂、枯树、栅栏） | 自己画；参考 [game-icons.net](https://game-icons.net) 的剪影 | CC BY 3.0 | 使用 game-icons 需在页脚署名作者 |
| 补充小图标 | [Kenney.nl](https://kenney.nl) | CC0 | 可直接用，无需署名 |
| 纹理（羊皮纸、石头、噪点） | SVG `feTurbulence` 滤镜程序生成 | — | 零体积、可调色，不用下载位图 |
| 字体 | Google Fonts（通过 `@fontsource` 安装） | OFL | 可商用 |
| 环境音（风声、乌鸦、蜡烛噼啪） | [Freesound](https://freesound.org)（筛选 CC0）、[Kenney 音效包](https://kenney.nl/assets?q=audio) | CC0 | 压缩为 `.webm` + `.mp3`，每个 < 50KB |
| Landing 开场动画（可选） | [LottieFiles](https://lottiefiles.com) 免费素材，或自己用 AE 做 | 逐个核对许可 | 只用一处，风格不统一就放弃 |

所有第三方素材在 `public/CREDITS.md` 和页脚"致谢"里登记来源与许可。AI 生成图片只用来做氛围草图和找方向，不直接进最终产品（风格难统一，且许可存在不确定性）。

---

## 7. 工程结构

```
src/
  app/            App.tsx、路由式的三屏状态（gate / ritual / graveyard）
  domain/
    parse.ts      package.json → DependencySpec[]
    classify.ts   PackageFacts → Status（纯函数，按第 1.2 节规则）
    epitaph.ts    墓志铭模板
    hash.ts       包名 → 稳定哈希（FNV-1a），用于变体、倾斜、动画延迟
    config.ts     阈值
  data/
    depsdev.ts    deps.dev 客户端
    downloads.ts  npm 下载量（批量 + scoped 单查）
    useGraveyard.ts  组合 TanStack Query + p-limit
  scene/          Sky、Moon、Clouds、Silhouettes、Fog、Fireflies、Ground
  graves/         Tombstone、GraveZone、StatusIcon/{Candle,ZombieHand,Ghost,Crow,WillOWisp}.tsx
  ui/             Ledger（输入）、CandleProgress、FilterCharms、DetailDialog、TableView、ShareMenu
  store/          zustand：filters、viewMode、motionEnabled、soundEnabled
  styles/         tailwind 入口、@theme token、字体
public/sounds/    音效
```

核心类型：

```ts
type Status = "alive" | "zombie" | "ghost" | "buried" | "lost";

interface DependencySpec {
  name: string;          // package.json 中的键
  target: string;        // 实际查询的包名（处理 npm: 别名）
  range: string;
  kind: "prod" | "dev" | "peer" | "optional";
}

interface PackageFacts {
  lastPublishedAt?: string;
  latestVersion?: string;
  deprecated?: string;   // 弃用原因
  weeklyDownloads?: number;
  repo?: string;
  error?: "not_found" | "network" | "unsupported_spec";
}
```

`classify.ts` 和 `parse.ts` 是纯函数，用 vitest 覆盖全部规则分支和边界（正好 12 个月、下载量等于阈值、scoped 包、别名、各种不可查询的声明）。API 层用 msw mock 测试失败路径。

---

## 8. 示例墓园（Demo 用）

内置一份"2016 年的老项目"示例，保证演示时四种状态都有，例如：`react`（alive）、`vite`（alive）、`request`（ghost，实测已弃用）、`left-pad`（ghost）、`moment`（zombie 候选）、若干长期未更新的小包（buried 候选）、一个 `file:../local-lib`（lost）。

**比赛前一天用真实 API 跑一遍确认每个包的状态**，按实际结果调整示例列表，不要在代码里写死状态。

---

## 9. 黑客松排期（按 48 小时）

| 时段 | 任务 | 产出 |
|---|---|---|
| 0–4h | 脚手架、token、字体；`parse` / `classify` + 测试 | 命令行可跑出正确分类 |
| 4–10h | 数据层（deps.dev + 下载量 + 限流 + 缓存）；名册输入页 | 粘贴后得到结果列表 |
| 10–20h | 画四个状态图标 SVG 并接 Motion 动效；墓碑组件 | 单个墓碑效果定稿 |
| 20–28h | 场景分层、墓区布局、入场动画、加载蜡烛 | 完整墓园页 |
| 28–34h | 详情对话框、layoutId 过渡、墓志铭、筛选、表格视图 | 完整交互 |
| 34–40h | 分享海报、分享链接、音效、减弱动效、轻量模式 | 功能完成 |
| 40–46h | 手机适配、性能检查、无障碍检查、修 bug | 可演示 |
| 46–48h | 部署（Vercel / Netlify / GitHub Pages 均可，纯静态）、录屏 | 提交 |

**如果时间不够，按此顺序砍**：音效 → 分享链接 → 海报导出 → 表格视图 → 粒子。四个状态图标的动效和墓园场景是演示的核心，最后才砍。

---

## 10. 风险与对策

| 风险 | 对策 |
|---|---|
| deps.dev 偶发慢或不可用 | 退回 npm registry `/{name}/latest`；该包仍然缺数据就标为 `lost` |
| 现场网络差 | 示例墓园的 API 响应预先录制为 JSON，提供"离线演示"开关 |
| 依赖很多导致动画卡顿 | 循环名额（8 个，滚动时暂停）；超过 80 个依赖启用轻量模式；见 `docs/PERFORMANCE.md` |
| 用户误以为 buried = 不安全 | 页面常驻声明 + 详情里写明判定依据 |
| 自绘 SVG 耗时超预期 | 先做四个图标的静态版本跑通流程，再逐个加动效 |
