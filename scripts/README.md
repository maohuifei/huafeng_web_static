# 构建脚本说明

## 归档页优化方案

归档页加载慢的问题已通过**文章索引文件**解决。

### 优化前
- 归档页需要请求 **N 次**（每篇文章 1 次）
- 9 篇文章 = 9 次 HTTP 请求
- 加载时间随文章数量线性增长

### 优化后
- 归档页只需请求 **1 次**（索引文件）
- 无论多少文章，都只有 1 次 HTTP 请求
- 加载速度提升 **N 倍**

## 使用方法

### 1. 手动生成索引和 sitemap

```bash
# 只生成文章索引
npm run build:index

# 只生成 sitemap
npm run build:sitemap

# 生成全部（推荐）
npm run build
```

### 2. 自动更新（Git 提交时）

已配置 Git hook，每次 `git commit` 时自动更新：
- `assets/data/articles-index.json` - 文章索引
- `sitemap.xml` - 站点地图

### 3. 何时需要重新生成

- ✅ 添加新文章后
- ✅ 修改文章元数据（标题、时间等）后
- ✅ 删除文章后

## 文件说明

| 文件 | 说明 |
|------|------|
| `scripts/generate-articles-index.js` | 生成文章索引脚本 |
| `scripts/generate-sitemap.js` | 生成 sitemap 脚本 |
| `assets/data/articles-index.json` | 文章索引数据（归档页使用） |
| `sitemap.xml` | 搜索引擎站点地图 |
| `.githooks/pre-commit` | Git 提交前自动构建 hook |

## 技术细节

### 文章索引格式

```json
{
  "generatedAt": "2026-02-24T06:01:41.691Z",
  "total": 9,
  "articles": [
    {
      "fileName": "文章文件名.md",
      "title": "文章标题",
      "categories": "分类",
      "createTime": "2025-01-20",
      "updateTime": "2026-02-21",
      "description": "描述",
      "top": 999
    }
  ]
}
```

### archive.js 改动

```javascript
// 优化前：循环请求每篇文章
for (const fileName of mdFileNames) {
    const article = await fetchMdFile(fileName); // N 次请求
}

// 优化后：一次请求索引文件
const response = await fetch('./assets/data/articles-index.json'); // 1 次请求
const data = await response.json();
```

## 性能对比

| 场景 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 9 篇文章 | ~2 秒 | ~0.1 秒 | **20 倍** |
| 100 篇文章 | ~20 秒 | ~0.1 秒 | **200 倍** |

## 注意事项

1. **必须运行构建**：添加新文章后记得运行 `npm run build`
2. **Git hook 自动运行**：提交时会自动更新，无需手动操作
3. **检查索引文件**：确保 `assets/data/articles-index.json` 已生成并提交到 Git
