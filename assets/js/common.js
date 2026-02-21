// 网站公共配置 - 头部导航和底部信息
import { renderIcon, isCurrentPage } from './utils.js';

export const siteConfig = {
    // 网站标题
    title: "我的个人网页",
    
    // 导航菜单
    navMenu: [
        {
            name: "首页",
            url: "index.html",
            icon: "icon-shouye"
        },
        {
            name: "文章",
            url: "articles.html",
            icon: "icon-wenzhang"
        },
        {
            name: "归档",
            url: "archive.html",
            icon: "icon-guidangchaxun_click"
        },
        {
            name: "关于",
            url: "about.html",
            icon: "icon-guanyuwomen"
        },
        {
            name: "声明",
            url: "declaration.html",
            icon: "icon-gonggao"
        }
    ],
    
    // 底部版权信息
    footer: {
        // 动态生成年份
        copyright: `© ${new Date().getFullYear()} 画风的个人在线笔记 - 保留所有权利`,
        showLinks: true  // 是否显示底部链接
    }
};

// 渲染头部导航
export function renderHeader() {
    const headerHTML = `
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

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    initNavbarScroll();
}

// 渲染底部
export function renderFooter() {
    const footerHTML = `
        <footer>
            <p>${siteConfig.footer.copyright}</p>
        </footer>
    `;

    document.body.insertAdjacentHTML('beforeend', footerHTML);
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
