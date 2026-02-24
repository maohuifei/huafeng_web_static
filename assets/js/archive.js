/**
 * 归档页脚本 - 统计概览、分类目录、时间线
 */
import { articlesConfig } from '../config/articles.config.js';
import { logError } from './utils.js';

// 存储所有文章数据
let allArticles = [];

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

        // 处理 HTML 格式
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
            top: meta.top,
            fileName
        };
    } catch (error) {
        logError('读取文章失败', error);
        return null;
    }
}

/**
 * 渲染统计概览
 */
function renderStatsOverview() {
    const container = document.getElementById('statsOverview');
    if (!container) return;

    // 按分类分组
    const categoriesCount = {};
    allArticles.forEach(article => {
        categoriesCount[article.categories] = (categoriesCount[article.categories] || 0) + 1;
    });

    // 按年份分组
    const yearsCount = {};
    allArticles.forEach(article => {
        const year = article.createTime.substring(0, 4);
        if (year && year.length === 4) {
            yearsCount[year] = (yearsCount[year] || 0) + 1;
        }
    });

    // 排序获取最新文章
    const sortedByTime = [...allArticles].sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    const latestArticle = sortedByTime[0];

    container.innerHTML = `
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
            <div class="stat-value">${latestArticle ? latestArticle.createTime.substring(0, 10) : '-'}</div>
            <div class="stat-label">最近更新</div>
        </div>
    `;
}

/**
 * 渲染分类目录
 */
function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    // 按分类分组
    const categoriesMap = {};
    allArticles.forEach(article => {
        if (!categoriesMap[article.categories]) {
            categoriesMap[article.categories] = [];
        }
        categoriesMap[article.categories].push(article);
    });

    // 生成 HTML
    const html = Object.keys(categoriesMap).map(category => {
        const articles = categoriesMap[category].sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        return `
            <div class="category-card">
                <div class="category-header">
                    <div class="category-name"><span>📂</span><span>${category}</span></div>
                    <div class="category-count">${articles.length}</div>
                </div>
                <ul class="category-articles">
                    ${articles.map(article => `
                        <li class="category-article-item">
                            <a href="article_detail.html?fileName=${article.fileName}" class="category-article-link">${article.title}</a>
                            <div class="category-article-date">${article.createTime.substring(0, 10)}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * 渲染时间线
 */
function renderTimeline() {
    const container = document.getElementById('timeline');
    if (!container) return;

    // 按年份 - 月份分组
    const timelineMap = {};
    allArticles.forEach(article => {
        const date = new Date(article.createTime);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        if (!timelineMap[year]) timelineMap[year] = {};
        if (!timelineMap[year][month]) timelineMap[year][month] = [];
        timelineMap[year][month].push(article);
    });

    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

    // 生成 HTML
    const html = Object.keys(timelineMap).sort((a, b) => b - a).map(year => {
        const months = timelineMap[year];
        const monthKeys = Object.keys(months).sort((a, b) => b - a);
        const yearTotal = monthKeys.reduce((sum, m) => sum + months[m].length, 0);

        return `
            <div class="timeline-year">
                <div class="timeline-year-header">
                    <div class="timeline-year-title">${year}年</div>
                    <div class="timeline-year-count">共 ${yearTotal} 篇</div>
                </div>
                <div class="timeline-months">
                    ${monthKeys.map(month => {
                        const articles = months[month].sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
                        return `
                            <div class="timeline-month">
                                <div class="timeline-month-title">${monthNames[month - 1]}</div>
                                <ul class="timeline-articles">
                                    ${articles.map(article => `
                                        <li class="timeline-article-item">
                                            <a href="article_detail.html?fileName=${article.fileName}" class="timeline-article-link">${article.title}</a>
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
    }).join('');

    container.innerHTML = html;
}

/**
 * 初始化
 */
async function init() {
    // 加载所有文章
    const results = await Promise.all(
        articlesConfig.articleList.map(fileName => fetchMdFile(fileName))
    );
    allArticles = results.filter(a => a);

    if (allArticles.length === 0) {
        document.getElementById('statsOverview').innerHTML = '<div class="empty-state"><span class="icon">📭</span><p>暂无文章</p></div>';
        document.getElementById('categoriesContainer').innerHTML = '';
        document.getElementById('timeline').innerHTML = '';
        return;
    }

    renderStatsOverview();
    renderCategories();
    renderTimeline();
}

// 初始化
document.addEventListener('DOMContentLoaded', init);
