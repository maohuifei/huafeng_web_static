#!/usr/bin/env node

/**
 * 最简单的文章构建脚本
 * 只处理基本Markdown转换，不生成目录
 */

const fs = require('fs');
const path = require('path');

// 配置
const ARTICLES_DIR = path.join(__dirname, 'articles');
const OUTPUT_DIR = path.join(__dirname, 'articles_html');
const INDEX_FILE = path.join(__dirname, 'articles_index.json');

// 跟踪变化的文件
let changedFiles = [];

/**
 * 简单的Markdown转HTML
 * 只处理代码块和图片，其他保持原样
 */
function simpleMarkdownToHtml(content) {
    let html = content;
    
    // 1. 处理代码块
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
    html = html.replace(codeBlockRegex, (match, lang, code) => {
        const language = lang || 'text';
        // 转义HTML特殊字符
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        return `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
    });
    
    // 2. 处理图片
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    html = html.replace(imageRegex, (match, alt, src) => {
        const fixedSrc = src.startsWith('./') ? `../articles/${src.substring(2)}` : src;
        return `<img src="${fixedSrc}" alt="${alt || ''}" loading="lazy">`;
    });
    
    // 3. 处理行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return html;
}

/**
 * 解析Markdown文件的元信息
 */
function parseMarkdownMeta(content) {
    const meta = {
        title: '未知标题',
        categories: '未分类',
        createTime: '未知时间',
        updateTime: '未知时间',
        description: '',
        top: false
    };
    
    // 匹配YAML front matter
    const yamlPattern = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(yamlPattern);
    
    if (match) {
        const yamlContent = match[1];
        yamlContent.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.includes(':')) return;
            
            const colonIndex = trimmedLine.indexOf(':');
            const key = trimmedLine.substring(0, colonIndex).trim();
            const value = trimmedLine.substring(colonIndex + 1).trim();
            
            if (key && value) {
                if (key === 'top') {
                    meta[key] = value.toLowerCase() === 'true' || value === 'True';
                } else if (meta.hasOwnProperty(key)) {
                    meta[key] = value;
                }
            }
        });
        
        // 移除front matter
        content = content.replace(yamlPattern, '');
    }
    
    // 如果没有元信息，尝试从文件名和内容推断
    if (meta.title === '未知标题') {
        // 尝试从第一行标题获取
        const lines = content.trim().split('\n');
        for (const line of lines.slice(0, 5)) {
            if (line.startsWith('# ')) {
                meta.title = line.substring(2).trim();
                break;
            }
        }
        
        // 如果还是没有标题，使用文件名
        if (meta.title === '未知标题') {
            meta.title = '未命名文章';
        }
    }
    
    // 生成描述
    if (!meta.description) {
        // 取前200个字符作为描述
        const plainText = content.replace(/[#*`\[\]]/g, '').substring(0, 200);
        meta.description = plainText.trim().substring(0, 150) + '...';
    }
    
    return { meta, content };
}

/**
 * 构建单个文章的HTML文件
 */
function buildArticleHtml(mdFilePath, outputDir) {
    const fileName = path.basename(mdFilePath);
    
    try {
        // 读取Markdown文件
        const content = fs.readFileSync(mdFilePath, 'utf-8');
        
        // 解析元信息
        const { meta, content: cleanContent } = parseMarkdownMeta(content);
        
        // 转换Markdown为HTML（只处理代码块和图片）
        const htmlContent = simpleMarkdownToHtml(cleanContent);
        
        // 创建HTML模板
        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta.title} - 我的个人网页</title>
    <meta name="description" content="${meta.description}">
    <meta name="keywords" content="技术文章,编程教程,学习笔记">
    <meta name="author" content="画风">
    <link rel="icon" href="../assets/images/favicon.ico">
    <link rel="stylesheet" href="../assets/css/iconfont.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/article_detail.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
</head>
<body>
    <div id="app">
        <header class="header">
            <div class="container">
                <a href="../index.html" class="logo">我的个人网页</a>
                <nav id="nav"></nav>
            </div>
        </header>

        <main class="main">
            <div class="container">
                <div class="article-content">
                    <div class="article-detail" id="articleDetail">
                        <div class="article-meta-detail">
                            <span class="article-category-detail">${meta.categories}</span>
                            <h1 class="article-title-detail">${meta.title}</h1>
                            <div class="article-time-detail">
                                <span>创建时间：${meta.createTime}</span>
                                <span>更新时间：${meta.updateTime}</span>
                            </div>
                        </div>
                        <div class="article-body">${htmlContent}</div>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            <div class="container">
                <p>© 2023-2026 我的个人网页. 保留所有权利.</p>
            </div>
        </footer>
    </div>

    <script src="../assets/js/common.js" type="module"></script>
</body>
</html>`;
        
        // 写入输出文件
        const outputFilename = fileName.replace('.md', '.html');
        const outputPath = path.join(outputDir, outputFilename);
        
        fs.writeFileSync(outputPath, html, 'utf-8');
        console.log(`✓ ${outputFilename}`);
        
        // 记录变化的文件
        changedFiles.push(`articles_html/${outputFilename}`);
        
        return {
            fileName: fileName,
            htmlFile: outputFilename,
            title: meta.title,
            categories: meta.categories,
            createTime: meta.createTime,
            updateTime: meta.updateTime,
            description: meta.description,
            top: meta.top
        };
        
    } catch (error) {
        console.error(`❌ ${fileName}:`, error.message);
        return null;
    }
}

/**
 * 更新文章索引文件
 */
function updateArticlesIndex(articlesData) {
    const validArticles = articlesData.filter(article => article !== null);
    
    // 检查索引是否需要更新
    let needsUpdate = true;
    if (fs.existsSync(INDEX_FILE)) {
        try {
            const oldIndex = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
            const oldArticles = oldIndex.articles || [];
            
            // 简单比较：如果文章数量相同且内容相同，不需要更新
            if (oldArticles.length === validArticles.length) {
                const oldJson = JSON.stringify(oldArticles);
                const newJson = JSON.stringify(validArticles);
                if (oldJson === newJson) {
                    needsUpdate = false;
                }
            }
        } catch (e) {
            // 如果读取失败，继续更新
        }
    }
    
    if (needsUpdate) {
        const indexData = {
            generatedAt: new Date().toISOString(),
            total: validArticles.length,
            articles: validArticles
        };
        
        fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2), 'utf-8');
        console.log(`✓ ${INDEX_FILE} (已更新)`);
        changedFiles.push(INDEX_FILE);
    } else {
        console.log(`- ${INDEX_FILE} (无需更新)`);
    }
}

/**
 * 主函数
 */
function main() {
    console.log('🔨 开始构建文章...\n');
    
    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    try {
        // 获取所有Markdown文件
        const mdFiles = [];
        function findMarkdownFiles(dir) {
            try {
                const items = fs.readdirSync(dir, { withFileTypes: true });
                
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    
                    if (item.isDirectory()) {
                        findMarkdownFiles(fullPath);
                    } else if (item.isFile() && item.name.endsWith('.md')) {
                        mdFiles.push(fullPath);
                    }
                }
            } catch (error) {
                console.error(`❌ 无法读取目录 ${dir}:`, error.message);
            }
        }
        
        if (fs.existsSync(ARTICLES_DIR)) {
            findMarkdownFiles(ARTICLES_DIR);
        } else {
            console.error(`❌ 文章目录不存在: ${ARTICLES_DIR}`);
            process.exit(1);
        }
        
        if (mdFiles.length === 0) {
            console.error('❌ 未找到Markdown文件');
            process.exit(1);
        }
        
        console.log(`找到 ${mdFiles.length} 个Markdown文件\n`);
        
        // 构建所有文章
        const articlesData = [];
        for (const mdFile of mdFiles) {
            const articleInfo = buildArticleHtml(mdFile, OUTPUT_DIR);
            if (articleInfo) {
                articlesData.push(articleInfo);
            }
        }
        
        // 按更新时间排序（新的在前）
        articlesData.sort((a, b) => {
            const dateA = new Date(a.updateTime || '1970-01-01');
            const dateB = new Date(b.updateTime || '1970-01-01');
            return dateB - dateA;
        });
        
        // 更新索引
        console.log('\n📄 更新索引:');
        updateArticlesIndex(articlesData);
        
        // 输出总结
        console.log('\n' + '='.repeat(50));
        console.log('✅ 构建完成！');
        console.log(`   共生成 ${articlesData.length} 篇文章`);
        console.log(`   输出目录: ${OUTPUT_DIR}/`);
        
        // 输出变化的文件列表
        if (changedFiles.length > 0) {
            console.log('\n📋 变化的文件:');
            changedFiles.forEach(file => console.log(`   ${file}`));
        } else {
            console.log('\n📋 没有文件变化');
        }
        
    } catch (error) {
        console.error('\n❌ 构建失败:', error.message);
        process.exit(1);
    }
}

// 执行主函数
if (require.main === module) {
    main();
}