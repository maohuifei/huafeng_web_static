/**
 * 文章列表页脚本 - 使用预生成索引 + 缓存
 */
import { logError } from './utils.js';

// 常量配置
const PAGE_SIZE = 9;
const CACHE_KEY = 'articles_index';
const CACHE_DURATION = 5 * 60 * 1000; // 缓存 5 分钟

// 状态变量
let currentPage = 1;
let allArticles = [];           // 全部文章（按更新时间排序，新的在前）
let topArticles = [];           // 置顶文章（按更新时间排序，新的在前）
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
            renderAllArticlesByPage(currentPage);
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
            renderAllArticlesByPage(currentPage);
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
            renderAllArticlesByPage(currentPage);
        }
    };
    container.appendChild(nextBtn);
}

/**
 * 渲染单篇文章卡片
 */
function createArticleCard(article, index) {
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
        // 直接链接到原始HTML文件，不使用重定向文件
        window.location.href = `articles_html/${article.htmlFile}`;
    };
    return card;
}

/**
 * 渲染置顶文章列表
 */
function renderTopArticles() {
    const container = document.getElementById('articleList');
    if (!container || topArticles.length === 0) return;

    // 清空容器内容
    container.innerHTML = '';

    // 添加置顶区域标题
    const topSectionTitle = document.createElement('h2');
    topSectionTitle.className = 'section-title';
    topSectionTitle.textContent = '📌 置顶文章';
    container.appendChild(topSectionTitle);

    // 添加置顶文章容器
    const topContainer = document.createElement('div');
    topContainer.className = 'top-articles';
    topArticles.forEach((article, index) => {
        topContainer.appendChild(createArticleCard(article, index));
    });
    container.appendChild(topContainer);
}

/**
 * 渲染指定页码的全部文章列表
 */
function renderAllArticlesByPage(page) {
    const container = document.getElementById('articleList');
    if (!container) return;

    // 移除旧的全部文章容器和标题
    const existingAllContainer = document.getElementById('allArticlesContainer');
    if (existingAllContainer) {
        existingAllContainer.remove();
    }
    const existingAllTitle = document.querySelector('.all-section-title');
    if (existingAllTitle) {
        existingAllTitle.remove();
    }

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const articles = allArticles.slice(start, end);

    // 添加全部文章区域标题（如果有置顶文章）
    if (topArticles.length > 0) {
        const allSectionTitle = document.createElement('h2');
        allSectionTitle.className = 'section-title all-section-title';
        allSectionTitle.textContent = '📄 全部文章';
        container.appendChild(allSectionTitle);
    }

    const allContainer = document.createElement('div');
    allContainer.className = 'all-articles';
    allContainer.id = 'allArticlesContainer';
    
    articles.forEach((article, index) => {
        allContainer.appendChild(createArticleCard(article, index));
    });
    
    container.appendChild(allContainer);

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
        
        // 置顶文章：按 updateTime 降序（新的在前）
        // 处理top字段（可能是布尔值或字符串"true"/"false"）
        topArticles = indexData.articles
            .filter(a => {
                const topValue = a.top;
                return topValue === true || topValue === "true" || topValue === "True";
            })
            .sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
        
        // 全部文章：按 updateTime 降序（新的在前），不管是否置顶
        allArticles = indexData.articles
            .sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
        
        totalPages = Math.ceil(allArticles.length / PAGE_SIZE);

        console.log(`[Articles] 加载完成，共 ${allArticles.length} 篇文章，其中 ${topArticles.length} 篇置顶`);

        if (allArticles.length === 0) {
            container.innerHTML = '<div class="error">暂无文章</div>';
            return;
        }

        // 先渲染置顶文章
        renderTopArticles();
        // 再渲染全部文章
        renderAllArticlesByPage(currentPage);
    } catch (error) {
        logError('加载文章列表失败', error);
        container.innerHTML = '<div class="error">文章加载失败，请刷新重试</div>';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', renderArticleList);
