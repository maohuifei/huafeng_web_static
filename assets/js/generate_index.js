/**
 * 文章索引生成脚本（Node.js 环境运行）
 * 使用方法：node assets/js/generate_index.js
 * 
 * 生成 articles_index.json 文件，包含所有文章元数据
 * 页面加载时只需 fetch 一个 JSON 文件，无需解析 MD
 */

const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '../../articles');
const outputFile = path.join(__dirname, '../../articles_index.json');

// 解析 Markdown 元信息
function parseMdMeta(mdContent) {
    const metaRegex = /---\r?\n([\s\S]*?)---\r?\n/g;
    const matches = [...mdContent.matchAll(metaRegex)];
    const meta = {};

    matches.forEach(match => {
        match[1].trim().split('\n').forEach(line => {
            const cleanLine = line.trim();
            if (!cleanLine) return;
            const colonIndex = cleanLine.indexOf(':');
            if (colonIndex === -1) return;

            const key = cleanLine.substring(0, colonIndex).trim();
            const value = cleanLine.substring(colonIndex + 1).trim();
            if (key && value) {
                meta[key] = key === 'top' ? Number(value) || 0 : value;
            }
        });
    });

    return {
        title: meta.title || '未知标题',
        categories: meta.categories || '未分类',
        createTime: meta.createTime || '未知时间',
        updateTime: meta.updateTime || meta.createTime || '未知时间',
        description: meta.description || '暂无摘要',
        top: meta.top || 0
    };
}

// 获取所有 MD 文件
const mdFiles = fs.readdirSync(articlesDir)
    .filter(f => f.endsWith('.md'))
    .sort();

const articles = [];

mdFiles.forEach(fileName => {
    try {
        const filePath = path.join(articlesDir, fileName);
        const content = fs.readFileSync(filePath, 'utf-8');
        const meta = parseMdMeta(content);

        articles.push({
            fileName,
            ...meta
        });
        console.log(`✓ ${fileName}`);
    } catch (error) {
        console.error(`✗ ${fileName}: ${error.message}`);
    }
});

// 按置顶优先级排序
articles.sort((a, b) => b.top - a.top);

// 生成 JSON 文件
const output = {
    generatedAt: new Date().toISOString(),
    total: articles.length,
    articles
};

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
console.log(`\n✓ 已生成 ${outputFile}`);
console.log(`  共 ${articles.length} 篇文章`);
