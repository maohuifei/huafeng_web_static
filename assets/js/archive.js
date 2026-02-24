import { logError } from './utils.js';

// 存储所有文章数据
let allArticles = [];

// 从索引文件加载文章数据（优化：只需 1 次请求）
async function loadArticlesIndex() {
    try {
        const response = await fetch('./assets/data/articles-index.json');
        if (!response.ok) {
            throw new Error('文章索引加载失败');
        }
        const data = await response.json();
        console.log(`[归档页] 加载了 ${data.total} 篇文章`);
        return data.articles;
    } catch (error) {
        logError('加载文章索引失败:', error);
        // 降级：如果索引文件不存在，返回空数组
        return [];
    }
}

// 渲染统计概览
function renderStatsOverview() {
    const statsEl = document.getElementById('statsOverview');

    // 按分类分组
    const categoriesCount = {};
    allArticles.forEach(article => {
        const category = article.categories;
        categoriesCount[category] = (categoriesCount[category] || 0) + 1;
    });

    // 按年份分组
    const yearsCount = {};
    allArticles.forEach(article => {
        const year = article.createTime.substring(0, 4);
        if (year && year.length === 4) {
            yearsCount[year] = (yearsCount[year] || 0) + 1;
        }
    });

    // 最早和最晚的文章
    const sortedByTime = [...allArticles].sort((a, b) =>
        new Date(b.createTime) - new Date(a.createTime)
    );
    const latestArticle = sortedByTime[0];
    const earliestArticle = sortedByTime[sortedByTime.length - 1];

    statsEl.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-value">${allArticles.length}</div>
            <div class="stat-label">文章总数</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📁</div>
            <div class="stat-value">${Object.keys(categoriesCount).length}</div>
            <div class="stat-label">分类数量</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-value">${Object.keys(yearsCount).length}</div>
            <div class="stat-label">年份跨度</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">${latestArticle ? latestArticle.updateTime.substring(0, 10) : '-'}</div>
            <div class="stat-label">最近更新</div>
        </div>
    `;
}

// 渲染分类目录
function renderCategories() {
    const container = document.getElementById('categoriesContainer');

    // 按分类分组
    const categoriesMap = {};
    allArticles.forEach(article => {
        const category = article.categories;
        if (!categoriesMap[category]) {
            categoriesMap[category] = [];
        }
        categoriesMap[category].push(article);
    });

    // 生成 HTML
    let html = '';
    Object.keys(categoriesMap).forEach(category => {
        const articles = categoriesMap[category].sort((a, b) =>
            new Date(b.createTime) - new Date(a.createTime)
        );

        html += `
            <div class="category-card">
                <div class="category-header">
                    <div class="category-name">
                        <span>📂</span>
                        <span>${category}</span>
                    </div>
                    <div class="category-count">${articles.length}</div>
                </div>
                <ul class="category-articles">
                    ${articles.map(article => `
                        <li class="category-article-item">
                            <a href="article_detail.html?fileName=${article.fileName}" class="category-article-link">
                                ${article.title}
                            </a>
                            <div class="category-article-date">${article.createTime.substring(0, 10)}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    });

    container.innerHTML = html;
}

// 渲染时间线
function renderTimeline() {
    const container = document.getElementById('timeline');

    // 按年份 - 月份分组
    const timelineMap = {};
    allArticles.forEach(article => {
        const date = new Date(article.createTime);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        if (!timelineMap[year]) {
            timelineMap[year] = {};
        }
        if (!timelineMap[year][month]) {
            timelineMap[year][month] = [];
        }
        timelineMap[year][month].push(article);
    });

    // 按年份倒序排列
    const years = Object.keys(timelineMap).sort((a, b) => b - a);

    let html = '';
    years.forEach(year => {
        const months = timelineMap[year];
        const monthKeys = Object.keys(months).sort((a, b) => b - a);
        const yearTotal = monthKeys.reduce((sum, m) => sum + months[m].length, 0);

        html += `
            <div class="timeline-year">
                <div class="timeline-year-header">
                    <div class="timeline-year-title">${year}年</div>
                    <div class="timeline-year-count">共 ${yearTotal} 篇</div>
                </div>
                <div class="timeline-months">
                    ${monthKeys.map(month => {
                        const articles = months[month].sort((a, b) =>
                            new Date(b.createTime) - new Date(a.createTime)
                        );
                        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                            '七月', '八月', '九月', '十月', '十一月', '十二月'];

                        return `
                            <div class="timeline-month">
                                <div class="timeline-month-title">${monthNames[month - 1]}</div>
                                <ul class="timeline-articles">
                                    ${articles.map(article => `
                                        <li class="timeline-article-item">
                                            <a href="article_detail.html?fileName=${article.fileName}" class="timeline-article-link">
                                                ${article.title}
                                            </a>
                                            <div class="timeline-article-meta">
                                                <span>${article.createTime.substring(0, 10)}</span>
                                                <span>📁 ${article.categories}</span>
                                            </div>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// 初始化
async function init() {
    // 从索引文件加载所有文章（只需 1 次请求）
    allArticles = await loadArticlesIndex();

    if (allArticles.length === 0) {
        document.getElementById('statsOverview').innerHTML = `
            <div class="empty-state">
                <span class="icon">📭</span>
                <p>暂无文章</p>
            </div>
        `;
        document.getElementById('categoriesContainer').innerHTML = '';
        document.getElementById('timeline').innerHTML = '';
        return;
    }

    // 渲染各个部分
    renderStatsOverview();
    renderCategories();
    renderTimeline();
}

// 页面加载
document.addEventListener('DOMContentLoaded', init);
