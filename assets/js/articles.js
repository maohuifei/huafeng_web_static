/**
 * 文章列表页脚本 - 支持分页
 */
import { articlesConfig } from '../config/articles.config.js';
import { logError } from './utils.js';

// 常量配置
const PAGE_SIZE = 5; // 每页文章数

// 状态变量
let currentPage = 1;
let totalArticles = [];
let totalPages = 0;

/**
 * 解析 Markdown 元信息
 */
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

/**
 * 获取文章数据
 */
async function fetchMdFile(fileName) {
    try {
        const response = await fetch(`./articles/${fileName}`);
        if (!response.ok) throw new Error(`文件 ${fileName} 读取失败`);

        let mdContent = await response.text();

        // 处理 HTML 格式（热铁盒渲染）
        if (mdContent.includes('<body>')) {
            const doc = new DOMParser().parseFromString(mdContent, 'text/html');
            const markdownBody = doc.querySelector('.markdown-body');
            if (markdownBody) {
                const firstH2 = markdownBody.querySelector('h2');
                if (firstH2 && firstH2.textContent.includes('title:')) {
                    mdContent = firstH2.textContent + '\n\n' + markdownBody.innerHTML.replace(firstH2.outerHTML, '');
                } else {
                    mdContent = markdownBody.innerText;
                }
            }
        }

        const meta = parseMdMeta(mdContent);
        return {
            title: meta.title,
            categories: meta.categories,
            createTime: meta.createTime,
            updateTime: meta.updateTime,
            excerpt: meta.description,
            top: meta.top,
            fileName
        };
    } catch (error) {
        logError('读取文章失败', error);
        return null;
    }
}

/**
 * 渲染分页控件
 */
function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;

    container.innerHTML = '';

    // 上一页按钮
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '上一页';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderArticlesByPage(currentPage);
        }
    };
    container.appendChild(prevBtn);

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            renderArticlesByPage(currentPage);
        };
        container.appendChild(pageBtn);
    }

    // 下一页按钮
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '下一页';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderArticlesByPage(currentPage);
        }
    };
    container.appendChild(nextBtn);
}

/**
 * 渲染指定页码的文章列表
 */
function renderArticlesByPage(page) {
    const container = document.getElementById('articleList');
    if (!container) return;

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const articles = totalArticles.slice(start, end);

    container.innerHTML = '';
    articles.forEach((article, index) => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <span class="article-category">${article.categories}</span>
            <h2>${article.title}</h2>
            <div class="article-meta">
                <span>${article.createTime}</span>
                <span>${article.updateTime}</span>
            </div>
            <div class="article-excerpt">${article.excerpt}</div>
        `;
        card.onclick = () => {
            window.location.href = `article_detail.html?fileName=${article.fileName}`;
        };
        container.appendChild(card);
    });

    renderPagination();
}

/**
 * 加载并渲染文章列表
 */
async function renderArticleList() {
    const container = document.getElementById('articleList');
    if (!container) return;

    container.innerHTML = '<div class="loading">加载文章列表中...</div>';

    try {
        const results = await Promise.all(
            articlesConfig.articleList.map(fileName => fetchMdFile(fileName))
        );
        totalArticles = results.filter(a => a).sort((a, b) => b.top - a.top);
        totalPages = Math.ceil(totalArticles.length / PAGE_SIZE);

        if (totalArticles.length === 0) {
            container.innerHTML = '<div class="error">暂无文章或文章加载失败！</div>';
            return;
        }

        renderArticlesByPage(currentPage);
    } catch (error) {
        logError('加载文章列表失败', error);
        container.innerHTML = '<div class="error">文章加载失败</div>';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', renderArticleList);
