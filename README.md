# @nocobase/plugin-custom-login-page

<p align="center">
  <a href="https://www.nocobase.com/">
    <img src="https://www.nocobase.com/images/logo.png" width="180" alt="NocoBase" />
  </a>
</p>

<h3 align="center">NocoBase 企业级可视化自定义登录页与模块扩展插件</h3>

<p align="center">
  <strong>专为企业数字化门户打造：FlowEngine 原生网格驱动 · 14 类开箱即用专属区块 · 双模式所见即所得设计器 · 高并发内存缓存 · 金融级安全防御</strong>
</p>

<p align="center">
  <a href="./README.md"><b>简体中文</b></a> | <a href="./README.en-US.md"><b>English</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NocoBase-2.x%20Supported-blue?style=flat-square" alt="NocoBase 2.x" />
  <img src="https://img.shields.io/badge/Version-0.2.0--beta.1-green?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/License-AGPL--3.0-orange?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/FlowEngine-Native%20Grid-purple?style=flat-square" alt="FlowEngine" />
  <img src="https://img.shields.io/badge/i18n-zh--CN%20%7C%20en--US-brightgreen?style=flat-square" alt="i18n" />
</p>

---

## 📖 业务背景与设计理念

登录页面是企业业务系统与数字化门户的**第一入口与品牌门面**。然而在传统的业务系统与低代码平台中，登录页普遍存在以下痛点：

1. **模版僵化，无法展现企业品牌形象**：官方原生登录页通常仅有固定 320px 单列表单，难以展示企业品牌 Slogan、核心业务指标、合作伙伴 Logo 墙与企业宣传海报；
2. **缺乏公共服务与信息传达通道**：在用户登录系统前，企业经常需要向访客展示维护公告、技术支持联系方式、多渠道客服二维码或倒计时活动，原生界面无法灵活承载；
3. **二次开发成本高、升级易冲突**：传统做法通过硬编码修改底层前端模版或反向代理篡改 HTML，极易在平台版本升级时发生破损或冲突。

**`@nocobase/plugin-custom-login-page`** 彻底解决了上述问题。本插件深度融入 NocoBase 2.x **Modern Client-v2** 架构与 **FlowEngine** 原生网格卡片引擎，提供完全可视化、拖拽式排版、开箱即用的 14 类登录专属区块，兼具秒级内存缓存与全方位安全防护。

---

## 🌟 核心特性总览

### 1. 🧱 100% FlowEngine 原生网格卡片引擎驱动
- **自由流式网格排版**：彻底告别死板的固定模版，支持任意拖拽调整位置、增删模块、调整栅格跨度（Span 1~24 列）；
- **响应式断点自适应**：支持不同屏幕宽度下的自适应折行与弹性对齐，无论在大屏工作站、标准笔记本还是移动端均可优雅呈现。

### 2. 🎨 沉浸式双层设计工作台（Workbench Studio Bar）
- **即刻生效主开关**：顶部常驻 `[自定义登录页：已生效 / 已停用]` 状态胶囊开关，一键启用或停用；切换后秒级同步服务端内存缓存，无需重启服务即可安全回退系统原生登录；
- **双模式平滑切换**：
  - `[🛠️ 设计模式]`：自由添加区块、拖拽排序、调整尺寸，右侧抽屉实时配置区块参数与文案；
  - `[👁️ 访客预览]`：在工作台内 1:1 预览访客端真实视觉效果，所有拖拽手柄、虚线边框与设计工具条智能隐藏；
- **画布全局外观定制**：
  - **3 种画布宽度**：固定居中（800px / 960px）、宽屏居中（1200px）、100% 通栏铺满；
  - **4 种质感主题**：晶透毛玻璃（Glassmorphism）、优雅大白卡（Card）、曜石极夜（Dark Obsidian）、通透极简无界（Transparent）。

### 3. 📦 14 类企业级内置专属区块组件

| 区块模型 | 功能描述 | 典型应用场景 |
| :--- | :--- | :--- |
| **`SignInFormBlockModel`** | **系统登录认证表单**：支持企业 Logo、标题与副标题、5 款微质感卡片主题、高度自适应，针对现代端 `/v/signin` 进行了全屏脱离穿透加固 | 核心系统身份认证 |
| **`CustomHeroBlockModel`** | **品牌宣传标语**：支持胶囊徽标、主标题、富文本副标题、CTA 快速行动跳转按钮 | 强化企业品牌形象与口号 |
| **`CustomFeaturesBlockModel`** | **企业特性矩阵**：多列卡片网格，支持自定义图标、主题强调色与特性说明 | 业务亮点与产品能力展示 |
| **`CustomStatsBlockModel`** | **核心数据看板**：关键运营指标展示，数值重点高亮、前后缀智能排版 | 展现企业实力与系统规模 |
| **`CustomCarouselBlockModel`** | **动态全景轮播**：多张品牌海报轮播画廊，支持自动播放间隔与外链跳转 | 动态活动海报与宣传展示 |
| **`CustomHtmlBlockModel`** | **自由代码 / HTML**：支持内联富文本与嵌入式代码，内置安全 XSS 净化器 | 个性化排版与第三方脚本嵌入 |
| **`CustomImageBlockModel`** | **宣传插画 / 品牌大图**：高清插画、圆角微调、阴影质感与外链点击跳转 | 业务插画与宣传海报 |
| **`CustomNoticeBlockModel`** | **平台重要通知公告**：支持走马灯轮播、通知类型标签（提示/警告/成功）与访客关闭权限 | 系统升级通知与重要公告 |
| **`CustomPartnersBlockModel`** | **合作伙伴 Logo 墙**：多列企业 Logo 矩阵，支持置灰滤镜、悬浮高亮与友情链接 | 客户案例与生态伙伴展示 |
| **`CustomContactBlockModel`** | **专属客服与多渠道支持**：集成多联系渠道胶囊、纯前端离线矢量二维码卡片 | 运维支持、微信群与客服二维码 |
| **`CustomLanguageBlockModel`** | **多语言环境切换胶囊**：多形态多语言快速切换，无缝融合系统国际化生态 | 多语言企业与跨国业务门户 |
| **`CustomCountdownBlockModel`** | **重要事件倒计时看板**：倒计时时钟面板、关键节点提醒与行动号召按钮 | 系统重磅上线或重大活动节点 |
| **`CustomLoginContainer`** | **登录页基础布局容器**：全屏自适应流式包裹，支持背景图与遮罩微调 | 页面全局容器与背景控制 |
| **`PublicWorkflowTrigger`** | **工作流与弹窗交互联动**：公开免登触发 NocoBase 工作流，配备图形防刷验证 | 访客登记、需求提交与公开服务 |

### 4. 🛡️ 生产级高并发与安全防御体系
- **高频访客零 DB 读开销**：服务端双层缓存设计，未登录用户的并发探测直接命中内存缓存，杜绝登录页被打瘫；
- **白名单参数校验 (`sanitizeConfigValues`)**：严格过滤非法字段与恶意注入，确保入库与渲染安全；
- **可信代理层 IP 限流**：使用可信代理层真实 IP 限流，阻断伪造 Header 的恶意刷量脚本；
- **React Error Boundary 容灾兜底**：任何子区块发生异常时，毫秒级平滑降级至官方原生登录表单，保证入口**永不白屏**；
- **多通道图标生态联动**：深度兼容 `@nocobase/plugin-custom-icons` 自定义图标库，支持海量 SVG 图标与阿里巴巴 Iconfont，未安装时平滑降级至官方图标。

---

## 🚀 安装与部署

### 方式 1：通过 NocoBase 插件管理器上传安装（推荐）

1. 在 GitHub [Releases](https://github.com/STlxx-lin/nocobase-plugin-custom-login-page/releases) 页面下载最新版压缩包（`.zip` 或 `.tgz`）；
2. 登录 NocoBase 超级管理员后台，在右上角进入 **插件管理** -> 点击 **上传插件**；
3. 选择下载的安装包上传，上传成功后点击 **启用插件** 即可。

### 方式 2：通过源码引入项目

```bash
# 1. 进入 NocoBase 项目插件目录
cd packages/plugins/@nocobase

# 2. 克隆插件源码
git clone https://github.com/STlxx-lin/nocobase-plugin-custom-login-page.git plugin-custom-login-page

# 3. 执行插件编译
yarn build @nocobase/plugin-custom-login-page

# 4. 启用插件并执行数据库迁移
yarn nocobase pm enable @nocobase/plugin-custom-login-page
yarn nocobase upgrade
```

---

## 💻 配置与使用指南

1. **进入设计器**：
   - 登录系统管理员账号，进入系统设置面板，点击左侧菜单 **“自定义登录页面”**；
2. **启用自定义登录页**：
   - 在顶部工作台栏中，将 **“自定义登录页”** 切换为 **“已生效”**；
3. **添加与编排区块**：
   - 点击 **“+ 添加区块”** 按钮，从 14 类区块中挑选所需模块；
   - 拖拽卡片调整顺序，拖拽边缘调整卡片所占列宽（例如：左侧 Hero 宣传标语占 14 列，右侧登录表单占 10 列）；
4. **自定义内容与外观**：
   - 点击各卡片右上角的 **设置** 按钮，在右侧抽屉中配置文本、Logo 图片、背景风格及按钮事件；
5. **实时预览与发布**：
   - 切换至 **“访客预览”** 模式检验排版效果；
   - 所有更改实时自动保存并同步至服务端缓存，访客访问登录页面（`/signin` 或 `/v/signin`）即可立即看到全新效果！

---

## 🛠️ 本地开发与构建

```bash
# 仅构建客户端产物
yarn build @nocobase/plugin-custom-login-page --client

# 仅构建服务端产物
yarn build @nocobase/plugin-custom-login-page --server

# 全量构建（包含 Client、Client-v2、Server 及 TypeScript 类型声明）
yarn build @nocobase/plugin-custom-login-page
```

---

## 🔄 自动化云打包流程（CI/CD）

本仓库已深度配置 GitHub Actions 自动云打包工作流（[`.github/workflows/release.yml`](.github/workflows/release.yml)），具备如下企业级流水线特性：

- ⚡ **智能依赖缓存**：自动缓存 Yarn 离线依赖，构建提速 70%；
- 🔁 **网络抗抖动自愈**：依赖拉取具备自动重试机制（最多 4 次），防止网络丢包偶发中断；
- 🔍 **产物完整性校验**：严格校验 `server.js`、`client.js`、`client-v2.js` 及各端完整产物，缺失即刻熔断；
- 📦 **纯净产物打包**：精确打包运行时代码，自动生成 `.tgz` 与 `.zip` 双格式安装包；
- 🔐 **SHA256 安全哈希**：自动计算产物安全校验码（`sha256sums.txt`），便于生产审计；
- 🏷️ **智能 Release 发布**：推送标签（Tag）或推送到 `main` 分支时自动创建 Release，包含版本号识别与变更说明。

---

## 📄 开源协议

本项目采用 [AGPL-3.0](LICENSE) 开源许可证。