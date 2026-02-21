# 我的个人网页 (MyWeb)

一个遵循 **"更简单、更纯粹"** 原则的静态个人网站，仅使用原生的 HTML、CSS 和 JavaScript 构建。

## 📖 项目简介

这是一个个人学习、生活感悟及技术实践的记录空间。网站直接解析本地 Markdown 文件来展示文章内容，无需后端服务器支持。

> 这里包含了我的思想理念，记录了我的成长轨迹，也见证了我与众多先行者思想的碰撞与共鸣。

## ✨ 特性

- **纯静态**：无需数据库和后端，部署简单
- **原生技术栈**：仅使用 HTML5、CSS3 和原生 JavaScript
- **Markdown 支持**：直接解析本地 Markdown 文件展示文章
- **响应式设计**：适配各种设备屏幕
- **SEO 友好**：包含完整的 meta 标签和 sitemap
- **模块化**：使用 ES6 模块组织代码，结构清晰

## 📁 项目结构

```
MyWeb/
├── index.html          # 首页
├── about.html          # 关于页面
├── articles.html       # 文章列表页
├── article_detail.html # 文章详情页
├── archive.html        # 归档页面
├── 404.html            # 404 页面
├── sitemap.xml         # 站点地图
├── robots.txt          # 机器人协议
├── README.md           # 项目说明
├── articles/           # Markdown 文章目录
│   ├── Git 使用笔记.md
│   ├── JavaScript.md
│   ├── Web 开发规范.md
│   └── ...
└── assets/             # 静态资源
    ├── css/            # 样式文件
    ├── js/             # JavaScript 脚本
    ├── images/         # 图片资源
    └── config/         # 配置文件
```

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| HTML5 | 页面结构 |
| CSS3 | 样式与动画 |
| JavaScript (ES6+) | 交互逻辑 |
| Markdown | 文章内容 |

## 🚀 本地开发

1. 克隆项目到本地
2. 使用任意 HTTP 服务器启动项目，例如：

```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js http-server
npx http-server -p 8080
```

3. 访问 `http://localhost:8080`

## 📝 添加文章

在 `articles/` 目录下新建 Markdown 文件即可，系统会自动解析并展示。

## 🌐 部署

由于是纯静态网站，可部署到任何静态托管服务：

- GitHub Pages
- Vercel
- Netlify
- 传统 Web 服务器 (Nginx/Apache)

## 📄 页面说明

| 页面 | 描述 |
|------|------|
| 首页 | 展示网站理念和欢迎信息 |
| 关于 | 站长介绍和联系方式 |
| 文章列表 | 所有文章的列表展示 |
| 文章详情 | 单篇文章的阅读页面 |
| 归档 | 按时间归档的文章列表 |

## 📞 联系方式

详见 [关于页面](about.html)

## 📜 许可证

本项目为个人网站源码，仅供学习交流使用。
严禁商用，违者必究
---

> **设计理念**：更简单，更纯粹
