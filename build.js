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
 * 增强的Markdown转HTML
 * 支持完整的Markdown语法
 */
function enhancedMarkdownToHtml(content) {
    // 按行分割内容
    const lines = content.split('\n');
    const result = [];
    let inCodeBlock = false;
    let currentLanguage = '';
    let currentParagraph = [];
    let inList = false;
    let listType = ''; // 'ul' 或 'ol'
    let inBlockquote = false;
    
    function flushParagraph() {
        if (currentParagraph.length > 0) {
            const paragraphText = currentParagraph.join('<br>');
            // 处理段落内的内联markdown
            let processedText = processInlineMarkdown(paragraphText);
            result.push(`<p>${processedText}</p>`);
            currentParagraph = [];
        }
    }
    
    function flushList() {
        if (inList && listType) {
            result.push(`</${listType}>`);
            inList = false;
            listType = '';
        }
    }
    
    function flushBlockquote() {
        if (inBlockquote) {
            result.push('</blockquote>');
            inBlockquote = false;
        }
    }
    
    // 处理内联markdown语法
    function processInlineMarkdown(text) {
        let processed = text;
        
        // 处理删除线（必须在粗体之前，因为~~可能被误匹配）
        processed = processed.replace(/~~(.*?)~~/g, '<del>$1</del>');
        
        // 处理粗体
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processed = processed.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // 处理斜体
        processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
        processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');
        
        // 处理行内代码
        processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 处理图片（必须在链接之前）
        processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
            const fixedSrc = src.startsWith('./') ? `../articles/${src.substring(2)}` : src;
            return `<img src="${fixedSrc}" alt="${alt || ''}" loading="lazy">`;
        });
        
        // 处理链接
        processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            // 检查URL是否有效
            const href = url.startsWith('http') ? url : 
                        url.startsWith('#') ? url : 
                        `https://${url}`;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        });
        
        return processed;
    }
    
    // 处理表格
    function processTable(lines, startIdx) {
        const tableLines = [];
        let i = startIdx;
        
        // 收集表格行
        while (i < lines.length && lines[i].includes('|')) {
            tableLines.push(lines[i]);
            i++;
        }
        
        if (tableLines.length < 2) return { html: '', newIndex: startIdx };
        
        let html = '<div class="table-container"><table>\n';
        
        for (let j = 0; j < tableLines.length; j++) {
            const line = tableLines[j].trim();
            if (line === '') continue;
            
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
            
            if (j === 0) {
                // 表头
                html += '<thead><tr>\n';
                cells.forEach(cell => {
                    html += `  <th>${processInlineMarkdown(cell)}</th>\n`;
                });
                html += '</tr></thead>\n<tbody>\n';
            } else if (j === 1 && line.replace(/[^:-]/g, '').includes(':')) {
                // 第二行是分隔线，跳过
                continue;
            } else {
                // 数据行
                html += '<tr>\n';
                cells.forEach(cell => {
                    html += `  <td>${processInlineMarkdown(cell)}</td>\n`;
                });
                html += '</tr>\n';
            }
        }
        
        html += '</tbody></table></div>\n';
        
        return { html, newIndex: i - 1 };
    }
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // 处理代码块
        if (trimmedLine.startsWith('```')) {
            if (!inCodeBlock) {
                // 开始代码块
                flushParagraph();
                flushList();
                flushBlockquote();
                inCodeBlock = true;
                // 支持三个或四个反引号
                const backtickCount = trimmedLine.match(/^`+/)[0].length;
                currentLanguage = trimmedLine.substring(backtickCount).trim() || 'text';
                result.push(`<pre><code class="language-${currentLanguage}">`);
            } else {
                // 结束代码块
                inCodeBlock = false;
                result.push('</code></pre>');
            }
            continue;
        }
        
        if (inCodeBlock) {
            // 在代码块内，直接添加内容（转义HTML）
            const escapedLine = line
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            result.push(escapedLine + '\n');
            continue;
        }
        
        // 处理空行
        if (trimmedLine === '') {
            flushParagraph();
            flushList();
            flushBlockquote();
            continue;
        }
        
        // 检查是否是表格
        if (trimmedLine.includes('|') && trimmedLine.replace(/[^|]/g, '').length >= 2) {
            const { html, newIndex } = processTable(lines, i);
            if (html) {
                flushParagraph();
                flushList();
                flushBlockquote();
                result.push(html);
                i = newIndex;
                continue;
            }
        }
        
        // 处理标题
        if (trimmedLine.startsWith('###### ')) {
            flushParagraph();
            flushList();
            flushBlockquote();
            const title = trimmedLine.substring(7).trim();
            result.push(`<h6>${processInlineMarkdown(title)}</h6>`);
            continue;
        } else if (trimmedLine.startsWith('##### ')) {
            flushParagraph();
            flushList();
            flushBlockquote();
            const title = trimmedLine.substring(6).trim();
            result.push(`<h5>${processInlineMarkdown(title)}</h5>`);
            continue;
        } else if (trimmedLine.startsWith('#### ')) {
            flushParagraph();
            flushList();
            flushBlockquote();
            const title = trimmedLine.substring(5).trim();
            result.push(`<h4>${processInlineMarkdown(title)}</h4>`);
            continue;
        } else if (trimmedLine.startsWith('### ')) {
            flushParagraph();
            flushList();
            flushBlockquote();
            const title = trimmedLine.substring(4).trim();
            result.push(`<h3>${processInlineMarkdown(title)}</h3>`);
            continue;
        } else if (trimmedLine.startsWith('## ')) {
            flushParagraph();
            flushList();
            flushBlockquote();
            const title = trimmedLine.substring(3).trim();
            result.push(`<h2>${processInlineMarkdown(title)}</h2>`);
            continue;
        } else if (trimmedLine.startsWith('# ')) {
            flushParagraph();
            flushList();
            flushBlockquote();
            const title = trimmedLine.substring(2).trim();
            result.push(`<h1>${processInlineMarkdown(title)}</h1>`);
            continue;
        }
        
        // 处理引用
        if (trimmedLine.startsWith('>')) {
            if (!inBlockquote) {
                flushParagraph();
                flushList();
                result.push('<blockquote>');
                inBlockquote = true;
            }
            const quoteText = trimmedLine.replace(/^>\s*/, '').trim();
            if (quoteText) {
                result.push(`<p>${processInlineMarkdown(quoteText)}</p>`);
            }
            continue;
        } else if (inBlockquote) {
            flushBlockquote();
        }
        
        // 处理水平线
        if (/^---$/.test(trimmedLine) || /^\*\*\*$/.test(trimmedLine) || /^___$/.test(trimmedLine)) {
            flushParagraph();
            flushList();
            flushBlockquote();
            result.push('<hr>');
            continue;
        }
        
        // 处理无序列表
        if (/^[-*+]\s/.test(trimmedLine)) {
            if (!inList || listType !== 'ul') {
                flushParagraph();
                if (inList) flushList();
                result.push('<ul>');
                inList = true;
                listType = 'ul';
            }
            const listItem = trimmedLine.substring(2).trim();
            result.push(`<li>${processInlineMarkdown(listItem)}</li>`);
            continue;
        }
        
        // 处理有序列表
        if (/^\d+\.\s/.test(trimmedLine)) {
            if (!inList || listType !== 'ol') {
                flushParagraph();
                if (inList) flushList();
                result.push('<ol>');
                inList = true;
                listType = 'ol';
            }
            const listItem = trimmedLine.replace(/^\d+\.\s+/, '').trim();
            result.push(`<li>${processInlineMarkdown(listItem)}</li>`);
            continue;
        }
        
        // 如果是列表的延续（缩进内容）
        if (inList && /^\s{2,}/.test(line)) {
            const continuedText = line.trim();
            if (continuedText) {
                // 添加到上一个列表项
                const lastIndex = result.length - 1;
                if (lastIndex >= 0) {
                    const lastItem = result[lastIndex];
                    if (lastItem.startsWith('<li>')) {
                        result[lastIndex] = lastItem.replace(/<\/li>$/, `<br>${processInlineMarkdown(continuedText)}</li>`);
                    }
                }
            }
            continue;
        }
        
        // 普通文本，添加到当前段落
        currentParagraph.push(line);
    }
    
    // 处理最后的内容
    flushParagraph();
    flushList();
    flushBlockquote();
    
    return result.join('\n');
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
        
        // 转换Markdown为HTML（增强版）
        const htmlContent = enhancedMarkdownToHtml(cleanContent);
        
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
        <!-- 导航栏将通过JavaScript渲染 -->
    </div>

    <!-- 文章详情页布局 -->
    <div class="detail-container">
        <!-- 左侧目录（如果有的话） -->
        <div class="sidebar" id="sidebar">
            <div class="sidebar-title">文章目录</div>
            <div class="toc" id="toc">
                <p class="toc-empty">目录生成中...</p>
            </div>
        </div>
        
        <!-- 右侧文章内容 -->
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

    <!-- 返回列表按钮 -->
    <a href="../articles.html" class="btn-back-fixed">
        <span class="icon">←</span> 返回文章列表
    </a>

    <!-- 返回顶部按钮 -->
    <button class="btn-back-top-fixed" id="backToTop">
        ↑
    </button>

    <!-- 页脚将通过JavaScript渲染 -->
    
    <!-- 导入JavaScript模块 -->
    <script src="../assets/js/common.js" type="module"></script>
    <script src="../assets/js/article_detail.js" type="module"></script>
    <script type="module">
        import { renderHeader, renderFooter } from '../assets/js/common.js';
        // 渲染导航栏和页脚
        renderHeader();
        renderFooter();
    </script>
</body>
</html>`;
        
        // 写入输出文件
        const outputFilename = fileName.replace('.md', '.html');
        const outputPath = path.join(outputDir, outputFilename);
        
        fs.writeFileSync(outputPath, html, 'utf-8');
        console.log(`✓ ${outputFilename}`);
        
        // 记录变化的文件
        changedFiles.push(`articles_html/${outputFilename}`);
        
        // 生成URL友好名称（使用简单的英文名称）
        // 基于文件名生成简单的英文URL
        let urlFriendlyName;
        
        // 常见中文标题的英文映射
        const titleMap = {
            'AI产品部署过程记录': 'ai-product-deployment',
            'Markdown 使用笔记': 'markdown-notes',
            '个人网站部署过程记录': 'website-deployment',
            '办公文档格式规范总结': 'document-format',
            '应用开发规范总结': 'app-development',
            'Git 使用笔记': 'git-notes',
            'JavaScript 使用笔记': 'javascript-notes',
            '操作系统使用笔记': 'os-notes',
            '泛微二开标准代码模板': 'weaver-development',
            '测试文章': 'test-article'
        };
        
        if (titleMap[meta.title]) {
            urlFriendlyName = titleMap[meta.title] + '.html';
        } else {
            // 默认使用文件名（移除扩展名和特殊字符）
            urlFriendlyName = fileName
                .replace('.md', '')
                .replace(/[^\w\u4e00-\u9fa5]/g, '-')
                .replace(/\s+/g, '-')
                .toLowerCase() + '.html';
        }
        
        return {
            fileName: fileName,
            htmlFile: outputFilename,
            title: meta.title,
            categories: meta.categories,
            createTime: meta.createTime,
            updateTime: meta.updateTime,
            description: meta.description,
            top: meta.top,
            urlFriendlyName: urlFriendlyName
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