/**
 * 公共模块 - 渲染头部导航和底部
 */
import { renderIcon, isCurrentPage } from './utils.js';

/**
 * 站点配置
 */
export const siteConfig = {
    title: '我的个人网页',
    navMenu: [
        { name: '首页', url: 'index.html', icon: 'icon-shouye' },
        { name: '文章', url: 'articles.html', icon: 'icon-wenzhang' },
        { name: '归档', url: 'archive.html', icon: 'icon-guidangchaxun_click' },
        { name: '关于', url: 'about.html', icon: 'icon-guanyuwomen' },
        { name: '声明', url: 'declaration.html', icon: 'icon-gonggao' }
    ],
    footer: {
        copyright: `© ${new Date().getFullYear()} 画风的个人在线笔记 - 保留所有权利`,
        showLinks: true
    }
};

/**
 * 判断是否为当前页面（支持静态HTML文章页）
 */
function isCurrentNavPage(navUrl) {
    const currentPath = window.location.pathname;
    
    // 如果当前是静态文章页（在articles_html目录下）
    if (currentPath.includes('articles_html/')) {
        // 静态文章页的"当前页面"应该是"文章"导航项
        // navUrl 可能是 "articles.html" 或 "../articles.html"
        return navUrl === 'articles.html' || navUrl === '../articles.html' || navUrl === 'articles.html';
    }
    
    // 普通页面比较
    const currentPage = currentPath.split('/').pop() || 'index.html';
    return currentPage === navUrl;
}

/**
 * 获取正确的导航链接路径
 */
function getNavUrl(url) {
    const currentPath = window.location.pathname;
    
    // 如果当前在articles_html目录下，需要返回上级目录
    if (currentPath.includes('articles_html/')) {
        return `../${url}`;
    }
    
    return url;
}

/**
 * 渲染头部导航
 */
export function renderHeader() {
    const html = `
        <header>
            <nav>
                <ul>
                    ${siteConfig.navMenu.map(item => `
                        <li>
                            <a href="${getNavUrl(item.url)}" ${isCurrentNavPage(item.url) ? 'class="active"' : ''}>
                                ${renderIcon(item.icon, 'nav-icon')}
                                <span>${item.name}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </nav>
        </header>
    `;
    document.body.insertAdjacentHTML('afterbegin', html);
    initNavbarScroll();
}

/**
 * 渲染底部
 */
export function renderFooter() {
    const html = `<footer><p>${siteConfig.footer.copyright}</p></footer>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * 导航栏滚动效果
 */
function initNavbarScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.pageYOffset > 50);
    });
}
