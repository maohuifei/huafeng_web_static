import { aboutConfig } from '../config/about.config.js';
import { renderIcon, logError } from './utils.js';

// 渲染联系方式
function renderContact() {
    const contactEl = document.getElementById('contactSection');
    if (!contactEl) return;

    try {
        let contactHtml = '<div class="contact-list">';
        aboutConfig.contactList.forEach(contact => {
            const hasQrcode = contact.qrcode ? 'has-qrcode' : '';
            const qrcodeHtml = contact.qrcode ? `
                <div class="qrcode-popup">
                    <img src="${contact.qrcode}" alt="${contact.title}二维码">
                    <p>扫码添加</p>
                </div>
            ` : '';

            contactHtml += `
                <a href="${contact.url}" class="contact-item ${hasQrcode}">
                    ${renderIcon(contact.icon, 'contact-icon')}
                    <span>${contact.title}</span>
                    ${qrcodeHtml}
                </a>
            `;
        });
        contactHtml += '</div>';

        // 只替换 loading 元素，保留标题
        const loadingEl = contactEl.querySelector('.loading');
        if (loadingEl) {
            loadingEl.remove();
        }
        contactEl.insertAdjacentHTML('beforeend', contactHtml);
    } catch (error) {
        logError('加载联系方式失败：', error);
        contactEl.innerHTML = `<div class="error">联系方式加载失败</div>`;
    }
}

// 渲染项目卡片
function renderProjects() {
    const projectEl = document.getElementById('projectSection');
    if (!projectEl) return;

    try {
        let projectHtml = '<div class="project-cards">';
        aboutConfig.projects.forEach(project => {
            projectHtml += `
                <div class="project-card">
                    ${renderIcon(project.icon, 'project-icon')}
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <a href="${project.url}" target="_blank" class="project-link">前往查看</a>
                </div>
            `;
        });
        projectHtml += '</div>';

        // 只替换 loading 元素，保留标题
        const loadingEl = projectEl.querySelector('.loading');
        if (loadingEl) {
            loadingEl.remove();
        }
        projectEl.insertAdjacentHTML('beforeend', projectHtml);
    } catch (error) {
        logError('加载项目信息失败：', error);
        projectEl.innerHTML = `<div class="error">项目信息加载失败</div>`;
    }
}

// 更新个人介绍和所在地
function renderIntro() {
    // 更新个人介绍
    const introSection = document.getElementById('introSection');
    if (introSection) {
        const titleEl = introSection.querySelector('.section-title');
        const contentEl = introSection.querySelector('.section-content');

        if (titleEl) {
            titleEl.textContent = aboutConfig.introduction.title;
        }

        if (aboutConfig.introduction.paragraphs) {
            // 多段落模式
            contentEl.innerHTML = aboutConfig.introduction.paragraphs
                .map(p => `<p>${p}</p>`).join('');
        } else if (aboutConfig.introduction.content && contentEl) {
            // 单段落模式（兼容旧格式）
            contentEl.textContent = aboutConfig.introduction.content;
        }
    }

    // 更新所在地
    const locationSection = document.getElementById('locationSection');
    if (locationSection) {
        const titleEl = locationSection.querySelector('.section-title');
        const contentEl = locationSection.querySelector('.section-content');

        if (titleEl) {
            titleEl.textContent = `当前所在地：${aboutConfig.location.city}`;
        }

        if (aboutConfig.location.paragraphs && contentEl) {
            // 多段落模式
            contentEl.innerHTML = aboutConfig.location.paragraphs
                .map(p => `<p>${p}</p>`).join('');
        } else if (aboutConfig.location.description && contentEl) {
            // 单段落模式（兼容旧格式）
            contentEl.textContent = aboutConfig.location.description;
        }
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
    renderIntro();
    renderContact();
    renderProjects();
    initNavbarScroll();
    initActiveNav();
});
