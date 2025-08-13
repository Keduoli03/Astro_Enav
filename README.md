# Astro_Enav

🚀 基于 Astro 和 WebStack-hugo 开发的现代化导航网站

一个简洁、美观、功能丰富的网址导航站点，支持暗色模式、响应式设计和本地搜索功能。

## ✨ 特性

- 🎨 **现代化设计** - 基于 Bootstrap 4 的响应式布局
- 🌙 **暗色模式** - 支持亮色/暗色主题切换，带有平滑过渡动画
- 🔍 **本地搜索** - 快速搜索收录的网站
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

1. 编辑 `src/data/category.js` 添加一级和二级菜单
2. 分类 `id` 需要对应 `src/data/sites/` 目录下的文件名

```javascript
export const categories = [
  {
    name: "开发工具",
    id: "dev-tools",
    icon: "icon-code",
    subcategories: [
      { name: "代码编辑器", id: "editors" },
      { name: "版本控制", id: "version-control" }
    ]
  }
];
```

### 添加网站收录

在 `src/data/sites/` 目录下创建对应的 `.js` 文件：

```javascript
// src/data/sites/editors.js
export const sites = [
  {
    title: "Visual Studio Code",
    description: "强大的代码编辑器",
    url: "https://code.visualstudio.com",
    logo: "/images/logos/vscode.png"
  }
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