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
 * 渲染头部导航
 */
export function renderHeader() {
    const html = `
        <header>
            <nav>
                <ul>
                    ${siteConfig.navMenu.map(item => `
                        <li>
                            <a href="${item.url}" ${isCurrentPage(item.url) ? 'class="active"' : ''}>
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
