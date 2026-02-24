import { articlesConfig } from '../config/articles.config.js';
import { logError } from './utils.js';

const mdFileNames = articlesConfig.articleList;
// 分页核心变量
let currentPage = 1; // 当前页码
const pageSize = 5;  // 每页展示 5 条
let totalArticles = []; // 所有文章数据
let totalPages = 0; // 总页数

function parseMdMeta(mdContent) {
    // 匹配所有 --- 分隔的 frontmatter 块
    const metaRegex = /---\r?\n([\s\S]*?)---\r?\n/g;
    const matches = [...mdContent.matchAll(metaRegex)];
    
    // 收集所有 frontmatter 块的元数据
    const meta = {};
    matches.forEach(match => {
        const metaStr = match[1].trim();
        if (!metaStr) return; // 跳过空的 frontmatter
        
        metaStr.split('\n').forEach(line => {
            const cleanLine = line.trim();
            if (!cleanLine) return;
            const colonIndex = cleanLine.indexOf(':');
            if (colonIndex === -1) return;

            const key = cleanLine.substring(0, colonIndex).trim();
            const value = cleanLine.substring(colonIndex + 1).trim();

            if (key && value) {
                meta[key] = key === "top" ? Number(value) || 0 : value;
            }
        });
    });

    return {
        title: meta.title || "未知标题",
        categories: meta.categories || "未分类",
        createTime: meta.createTime || "未知时间",
        updateTime: meta.updateTime || meta.createTime || "未知时间",
        description: meta.description || "暂无摘要",
        top: meta.top || 0
    };
}

async function fetchMdFile(fileName) {
    try {
        const response = await fetch(`./articles/${fileName}`);
        if (!response.ok) throw new Error(`文件${fileName}读取失败`);

        let mdContent = await response.text();

        // 如果是 HTML（热铁盒会渲染 Markdown），提取原始内容
        if (mdContent.includes('<body>')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(mdContent, 'text/html');
            // 尝试从 .markdown-body 提取，如果不存在则直接用 body
            const markdownBody = doc.querySelector('.markdown-body');
            if (markdownBody) {
                mdContent = markdownBody.innerText;
            } else {
                // 没有 .markdown-body，直接从 body 提取文本
                const body = doc.querySelector('body');
                if (body) {
                    mdContent = body.innerText || body.textContent;
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
            fileName: fileName
        };
    } catch (error) {
        logError('读取文章失败:', error);
        return null;
    }
}

// 渲染指定页码的文章列表
function renderArticlesByPage(page) {
    const articleListEl = document.getElementById("articleList");
    // 计算截取范围
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedArticles = totalArticles.slice(start, end);

    // 清空列表
    articleListEl.innerHTML = "";

    // 渲染当前页文章
    paginatedArticles.forEach((article, index) => {
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
        card.addEventListener('click', () => {
            window.location.href = `article_detail.html?fileName=${article.fileName}`;
        });
        articleListEl.appendChild(card);
    });

    // 渲染分页控件
    renderPagination();
}

// 渲染分页控件
function renderPagination() {
    const paginationEl = document.getElementById("pagination");
    if (!paginationEl) return;

    paginationEl.innerHTML = "";

    // 上一页按钮
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = "上一页";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderArticlesByPage(currentPage);
        }
    });
    paginationEl.appendChild(prevBtn);

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderArticlesByPage(currentPage);
        });
        paginationEl.appendChild(pageBtn);
    }

    // 下一页按钮
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = "下一页";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderArticlesByPage(currentPage);
        }
    });
    paginationEl.appendChild(nextBtn);
}

// 导航栏滚动效果
function initNavbarScroll() {
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// 当前页面导航高亮
function initActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

async function renderArticleList() {
    const articleListEl = document.getElementById("articleList");
    articleListEl.innerHTML = '<div class="loading">加载文章列表中...</div>';

    // 并行加载所有文章，提高加载速度
    const fetchPromises = mdFileNames.map(fileName => fetchMdFile(fileName));
    const results = await Promise.all(fetchPromises);

    // 过滤掉加载失败的文章
    const articles = results.filter(article => article !== null);

    if (articles.length === 0) {
        articleListEl.innerHTML = '<div class="error">暂无文章或文章加载失败！</div>';
        return;
    }

    // 按置顶优先级排序
    totalArticles = articles.sort((a, b) => b.top - a.top);
    // 计算总页数
    totalPages = Math.ceil(totalArticles.length / pageSize);
    // 渲染第一页
    renderArticlesByPage(currentPage);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    renderArticleList();
    initNavbarScroll();
    initActiveNav();
});
