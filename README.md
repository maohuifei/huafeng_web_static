# 我的个人网页

一个遵循 **"更简单、更纯粹"** 原则的静态个人网站。

## 使用说明

### 一键构建（代替手动执行 node build.js）
- **Mac**：双击 `build.command`
- **终端**：`node build.js`

### 本地测试
```bash
# 使用Python
python -m http.server 8080

# 使用Node.js http-server
npx http-server -p 8080
```

### 构建输出
- `articles_html/*.html` - 生成的静态文章
- `articles_index.json` - 更新后的文章索引
- 变化的文件列表

## 项目结构

```
├── 核心页面文件
├── assets/           # 静态资源
├── articles/         # Markdown源文件
├── articles_html/    # 构建输出的HTML文件
├── articles_index.json # 文章索引
├── build.js          # 构建脚本
└── build.command     # 一键构建脚本（双击运行）
```

## 添加文章
1. 在 `articles/` 目录下创建 `.md` 文件
2. 双击 `build.command` 构建
3. 上传变化的文件到托管平台

---

> **设计理念**：更简单，更纯粹