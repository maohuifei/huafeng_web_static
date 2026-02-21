import { indexConfig } from '../config/index.config.js';
import { renderIcon, logError } from './utils.js';

// 渲染技术栈
function renderTechStack() {
    const techStackEl = document.getElementById('techStack');
    if (!techStackEl) return;

    try {
        let techHtml = '';
        indexConfig.techStack.forEach(tech => {
            techHtml += `
                <a href="${tech.url}" target="_blank" class="tech-item">
                    ${renderIcon(tech.icon, 'tech-icon')}
                    <span class="tech-title-small">${tech.title}</span>
                </a>
            `;
        });

        techStackEl.innerHTML = techHtml;
    } catch (error) {
        logError('加载技术栈失败：', error);
        techStackEl.innerHTML = `<div class="error">技术栈信息加载失败</div>`;
    }
}

// 导航栏滚动效果
function initNavbarScroll() {
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// 当前页面导航高亮
function initActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage ||
            (currentPage === '' && href === 'index.html') ||
            (currentPage === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    renderTechStack();
    initNavbarScroll();
    initActiveNav();
});
