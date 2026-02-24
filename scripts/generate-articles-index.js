#!/usr/bin/env node

/**
 * 生成文章索引 JSON
 * 扫描 articles 目录下的所有 Markdown 文件，提取 frontmatter 元数据
 * 输出到 assets/data/articles-index.json
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const OUTPUT_FILE = path.join(__dirname, '..', 'assets', 'data', 'articles-index.json');

// 解析 frontmatter 元数据
function parseFrontmatter(content) {
    const metaRegex = /---\r?\n([\s\S]*?)---\r?\n/;
    const match = content.match(metaRegex);
    
    if (!match) {
        return null;
    }

    const metaStr = match[1].trim();
    const meta = {};
    
    metaStr.split('\n').forEach(line => {
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

    return {
        title: meta.title || '未知标题',
        categories: meta.categories || '未分类',
        createTime: meta.createTime || '未知时间',
        updateTime: meta.updateTime || meta.createTime || '未知时间',
        description: meta.description || '',
        top: meta.top || 0
    };
}

// 主函数
function generateIndex() {
    console.log('📖 开始扫描文章目录...');
    
    // 确保输出目录存在
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 创建目录：${outputDir}`);
    }

    // 读取文章目录
    const files = fs.readdirSync(ARTICLES_DIR)
        .filter(file => file.endsWith('.md'))
        .sort(); // 按文件名排序

    console.log(`📄 找到 ${files.length} 篇文章`);

    const articlesIndex = [];

    files.forEach(fileName => {
        const filePath = path.join(ARTICLES_DIR, fileName);
        const content = fs.readFileSync(filePath, 'utf-8');
        const meta = parseFrontmatter(content);

        if (meta) {
            articlesIndex.push({
                fileName,
                ...meta
            });
            console.log(`  ✅ ${fileName} - ${meta.title}`);
        } else {
            console.log(`  ⚠️  ${fileName} - 未找到 frontmatter`);
        }
    });

    // 按置顶和更新时间排序
    articlesIndex.sort((a, b) => {
        if (b.top !== a.top) {
            return b.top - a.top;
        }
        return new Date(b.updateTime) - new Date(a.updateTime);
    });

    // 写入 JSON 文件
    const output = {
        generatedAt: new Date().toISOString(),
        total: articlesIndex.length,
        articles: articlesIndex
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n🎉 索引生成完成：${OUTPUT_FILE}`);
    console.log(`📊 共 ${articlesIndex.length} 篇文章`);
}

// 执行
generateIndex();
