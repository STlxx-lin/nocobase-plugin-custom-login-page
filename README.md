# @nocobase/plugin-custom-login-page

<p align="left">
  <b>简体中文</b> | <a href="https://github.com/STlxx-lin/nocobase-plugin-custom-login-page">English</a>
</p>

[![Version](https://img.shields.io/badge/version-v0.2.0--beta.1-blue.svg)](https://github.com/STlxx-lin/nocobase-plugin-custom-login-page/releases)
[![NocoBase Version](https://img.shields.io/badge/NocoBase-2.x-brightgreen.svg)](https://www.nocobase.com)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)

> **NocoBase 企业级可视化自定义登录页与模块扩展插件 (Custom Login Page Plugin for NocoBase)**  
> 专为 NocoBase 打造的高性能、企业级登录页面设计器与模块扩展中心。深度契合 NocoBase 2.x Modern Client-v2 规范与 FlowEngine 原生网格卡片引擎，提供所见即所得的可视化排版、14 大类现代化登录专属区块、一键切换预设风格、双通道客户端支持及完备的高并发安全防御。

---

## 🌟 核心特性总览

- 🧱 **100% FlowEngine 原生区块网格驱动**：彻底告别传统硬编码登录模版，全面支持鼠标拖拽排版、动态增删、列宽伸缩、自适应换行与断点响应。
- 🎨 **双层工作台设计器（Workbench Studio Bar）**：
  - **即刻生效主开关**：顶部常驻 `[自定义登录页：已生效 / 已停用]` 胶囊开关，切换即秒级同步服务端内存缓存，支持安全回退系统原生登录。
  - **双模式平滑切换**：`[🛠️ 设计模式]` ↔ `[👁️ 访客预览]`，在设计器内 1:1 预览访客真实视界，所有手柄智能隐藏。
  - **外观全局定制**：全屏画布宽度（固定居中 / 宽屏居中 / 100% 通栏铺满）与背景风格（晶透毛玻璃 / 优雅大白卡 / 曜石极夜 / 通透无界）。
- 📦 **14 类企业级内置专属区块**：
  1. **系统登录认证表单 (`SignInFormBlockModel`)**：集成企业品牌 Logo、标题/副标题行内格式化、宽度自适应、等高居中、5 款微质感卡片主题。
  2. **品牌宣传标语 (`CustomHeroBlockModel`)**：支持胶囊徽标、主标题、副标题、CTA 快速跳转按钮。
  3. **企业特性矩阵 (`CustomFeaturesBlockModel`)**：多列网格卡片，支持自定义图标、强调色与特性说明。
  4. **核心数据看板 (`CustomStatsBlockModel`)**：关键运营指标展示，数值、标签与前后缀智能排版。
  5. **动态全景轮播 (`CustomCarouselBlockModel`)**：多海报轮播画廊，自动播放与跳转外链配置。
  6. **自由代码 / HTML (`CustomHtmlBlockModel`)**：支持内联富文本与嵌入式代码，内置安全 XSS 净化器。
  7. **宣传插画 / 品牌大图 (`CustomImageBlockModel`)**：高清插画、圆角阴影微调与外链跳转。
  8. **平台重要通知公告 (`CustomNoticeBlockModel`)**：支持走马灯轮播、通知类型与访客关闭权限。
  9. **合作伙伴 Logo 墙 (`CustomPartnersBlockModel`)**：支持单行多列网格矩阵、置灰展示与友情链接。
  10. **专属客服与多渠道支持 (`CustomContactBlockModel`)**：集成客服渠道胶囊、纯前端离线矢量二维码卡片。
  11. **多语言环境切换胶囊 (`CustomLanguageBlockModel`)**：多形态多语言快速切换，提升国际化体验。
  12. **重要事件倒计时看板 (`CustomCountdownBlockModel`)**：倒计时时钟面板与截止行动按钮。
  13. **登录页基础布局容器 (`CustomLoginContainer`)**：流式全屏响应式包裹。
- 🛡️ **生产级高并发与安全防御体系**：
  - **读写分离与零 DB 读开销**：公网读接口纯内存高速缓存，杜绝未登录用户高频访问打垮数据库。
  - **白名单参数校验 (`sanitizeConfigValues`)**：严格过滤非法字段与注入参数。
  - **原生可信限流**：使用可信代理层 IP 限流，阻断伪造 Header 的恶意刷量。
  - **React Error Boundary 毫秒级容错**：任意模块或网络波动时平滑降级至官方原生登录表单，保证入口永不白屏。
- 🌐 **多通道图标集成**：
  - 深度兼容 `@nocobase/plugin-custom-icons` 自定义图标库，支持海量 SVG 图标与阿里巴巴 Iconfont，未安装时平滑降级至官方原生图标选择器。

---

## 🚀 安装与部署

### 方式 1：通过 NocoBase 插件管理器上传（推荐）

1. 在 Releases 下载插件压缩包（`.zip` 或 `.tgz`）；
2. 登录 NocoBase 管理后台，进入 **插件管理** -> **上传插件**；
3. 上传并激活 `@nocobase/plugin-custom-login-page` 即可。

### 方式 2：作为源码插件引入项目

```bash
# 进入项目插件目录
cd packages/plugins/@nocobase

# 克隆插件源码
git clone https://github.com/STlxx-lin/nocobase-plugin-custom-login-page.git plugin-custom-login-page

# 执行编译构建
yarn build @nocobase/plugin-custom-login-page

# 启用插件并执行数据库迁移
yarn nocobase pm enable @nocobase/plugin-custom-login-page
yarn nocobase upgrade
```

---

## 🛠️ 构建与开发

```bash
# 仅构建客户端产物
yarn build @nocobase/plugin-custom-login-page --client

# 仅构建服务端产物
yarn build @nocobase/plugin-custom-login-page --server

# 全量构建发布
yarn build @nocobase/plugin-custom-login-page
```

---

## 📄 开源协议

本项目采用 [AGPL-3.0](LICENSE) 开源许可证。
