# Astro_Enav

🚀 基于 Astro 和 WebStack-hugo 开发的现代化导航网站

一个简洁、美观、功能丰富的网址导航站点，支持暗色模式、响应式设计功能。

## ✨ 特性

- 🎨 **现代化设计** - 基于 Bootstrap 4 的响应式布局
- 🌙 **暗色模式** - 支持亮色/暗色主题切换，带有平滑过渡动画
- 🔍 **搜索体验升级**
  - 顶部搜索支持分组与子项切换，并记忆上次选择
  - 搜索模态框（页面内弹窗）内置打开/关闭逻辑，无需引入外部 JS 框架
- 📱 **响应式设计** - 完美适配桌面端、平板和移动设备
- ⚡ **高性能** - 基于 Astro 静态站点生成器，加载速度极快
- 🎯 **易于管理** - 简单的配置文件管理网站分类和收录
- 🔧 **高度可定制** - 支持自定义主题、背景和配置

## 🎯 演示站点

- [Vercel 部署](https://astro-enav.vercel.app/)
- [个人站点](https://nav.blueke.top/)

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- pnpm (推荐) 或 npm

### 安装部署

```bash
# 克隆项目
git clone https://github.com/Keduoli03/Astro_Enav.git
cd Astro_Enav

# 安装依赖
pnpm install

# 开发模式运行
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Keduoli03/Astro_Enav)

## 🔧 配置变化概览

- `src/settings.ts`
  - 背景图片与站点图片路径统一改为 `public/images` 下的资源，如：`/images/bg-light.jpg`
- `src/components/Utils/SearchModal.astro`
  - 内置模态框打开/关闭逻辑与分组切换脚本，兼容无 Bootstrap JS 的环境
- `src/components/Sidebar.astro` 与 `src/components/Footer.astro`
  - 移动端交互脚本内联，修复关闭策略与展开逻辑

## 📝 配置指南

### 网站基本配置

编辑 `src/settings.ts` 文件来修改网站基本信息：

```typescript
export const SITE_TITLE = '你的导航站名称';
export const SITE_DESCRIPTION = '网站描述';
export const SITE_FAVICON = '/images/favicon.png';
// ... 其他配置
```

### 添加网站分类

1. 编辑 `src/data/category.js` 在 `CATEGORY_CONFIG` 中新增分类与二级菜单
2. 二级菜单的 `id` 需要对应 `src/data/sites/` 下的数据文件或 `all.js` 中的 `subId`

```javascript
// src/data/category.js（片段）
export const CATEGORY_CONFIG = {
  dev: {
    name: '开发工具',
    icon: 'ri:code-line',
    subItems: [
      { id: 'editors', name: '代码编辑器', icon: 'ri:code-box-line' },
      { id: 'version-control', name: '版本控制', icon: 'ri:git-branch-line' }
    ]
  }
};
```

### 添加网站收录

集中维护到 `src/data/sites/all.js`，通过 `subId` 指向二级分类

```javascript
// src/data/sites/all.js
export default [
  { subId: 'editors', title: 'Visual Studio Code', url: 'https://code.visualstudio.com', description: '强大的代码编辑器' },
  { subId: 'version-control', title: 'GitHub', url: 'https://github.com', description: '代码托管平台' }
];
```


## 📋 待办事项

- [x] 夜间模式修复
- [x] 网站提交功能
- [x] 使用 favicon.im 服务获取网站图标
- [x] 优化无用文件
- [x] SEO 优化
- [ ] 本地搜索功能增强
- [ ] 友情链接功能
- [ ] 网站壁纸更换功能
- [ ] 多语言支持
- [ ] 网站统计功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 
3. 提交更改
4. 推送到分支 
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Astro](https://astro.build/) - 现代化的静态站点生成器
- [WebStack-hugo](https://github.com/WebStackPage/WebStackPage.github.io) - 原始设计灵感
- [Bootstrap](https://getbootstrap.com/) - CSS 框架
- [Favicon.im](https://favicon.im/) - 网站图标服务

## 📞 联系

如果你有任何问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/Keduoli03/Astro_Enav/issues)
- 发起 [Discussion](https://github.com/Keduoli03/Astro_Enav/discussions)
- 联系邮箱: [2801429414@qq.com](mailto:2801429414@qq.com)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！