import { logError } from './utils.js';

// 读取 config/declaration.md 并渲染
async function renderDeclaration() {
    const declarationEl = document.getElementById('declarationContent');
    if (!declarationEl) return;

    try {
        const response = await fetch('./assets/config/declaration.md');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const mdContent = await response.text();

        const htmlContent = marked.parse(mdContent);
        declarationEl.classList.remove('loading');
        declarationEl.innerHTML = htmlContent;
    } catch (error) {
        logError('加载声明失败：', error);
        declarationEl.classList.remove('loading');
        declarationEl.innerHTML = `<div class="error">声明内容加载失败，请刷新重试！<br><small>${error.message}</small></div>`;
    }
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    renderDeclaration();
    initNavbarScroll();
    initActiveNav();
});
