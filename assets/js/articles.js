/**
 * 文章列表页脚本 - 使用预生成索引 + 缓存
 */
import { logError } from './utils.js';

// 常量配置
const PAGE_SIZE = 5;
const CACHE_KEY = 'articles_index';
const CACHE_DURATION = 5 * 60 * 1000; // 缓存 5 分钟

// 状态变量
let currentPage = 1;
let totalArticles = [];
let totalPages = 0;

/**
 * 从缓存或网络获取文章索引
 */
async function fetchArticlesIndex() {
    // 尝试从缓存读取
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                console.log('[Articles] 使用缓存数据');
                return data;
            }
        }
    } catch (e) {
        console.warn('[Articles] 缓存读取失败', e);
    }

    // 从网络加载
    console.log('[Articles] 加载索引文件...');
    const response = await fetch('./articles_index.json');
    if (!response.ok) throw new Error('索引文件加载失败');

    const data = await response.json();

    // 更新缓存
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('[Articles] 缓存写入失败', e);
    }

    return data;
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
                <span title="创建时间">创建时间：${article.createTime}</span>
                <span title="更新时间">更新时间：${article.updateTime}</span>
            </div>
            <div class="article-excerpt">${article.excerpt || article.description}</div>
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

    try {
        const indexData = await fetchArticlesIndex();
        // 排序：top 为 true 的在前，然后按 updateTime 降序（新的在前）
        totalArticles = indexData.articles.sort((a, b) => {
            if (a.top === true && b.top !== true) return -1;
            if (a.top !== true && b.top === true) return 1;
            return new Date(b.updateTime) - new Date(a.updateTime);
        });
        totalPages = Math.ceil(totalArticles.length / PAGE_SIZE);

        console.log(`[Articles] 加载完成，共 ${totalArticles.length} 篇`);

        if (totalArticles.length === 0) {
            container.innerHTML = '<div class="error">暂无文章</div>';
            return;
        }

        renderArticlesByPage(currentPage);
    } catch (error) {
        logError('加载文章列表失败', error);
        container.innerHTML = '<div class="error">文章加载失败，请刷新重试</div>';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', renderArticleList);
