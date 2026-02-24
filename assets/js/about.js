/**
 * 关于页脚本 - 渲染联系方式和项目卡片
 */
import { aboutConfig } from '../config/about.config.js';
import { renderIcon, logError } from './utils.js';

/**
 * 渲染联系方式列表
 */
function renderContact() {
    const container = document.getElementById('contactSection');
    if (!container) return;

    try {
        const html = `<div class="contact-list">${aboutConfig.contactList.map(contact => {
            const hasQrcode = contact.qrcode ? 'has-qrcode' : '';
            const qrcodeHtml = contact.qrcode ? `
                <div class="qrcode-popup">
                    <img src="${contact.qrcode}" alt="${contact.title}二维码">
                    <p>扫码添加</p>
                </div>
            ` : '';
            return `
                <a href="${contact.url}" class="contact-item ${hasQrcode}">
                    ${renderIcon(contact.icon, 'contact-icon')}
                    <span>${contact.title}</span>
                    ${qrcodeHtml}
                </a>
            `;
        }).join('')}</div>`;

        const loadingEl = container.querySelector('.loading');
        if (loadingEl) loadingEl.remove();
        container.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        logError('加载联系方式失败', error);
        container.innerHTML = '<div class="error">联系方式加载失败</div>';
    }
}

/**
 * 渲染项目卡片
 */
function renderProjects() {
    const container = document.getElementById('projectSection');
    if (!container) return;

    try {
        const html = `<div class="project-cards">${aboutConfig.projects.map(project => `
            <div class="project-card">
                ${renderIcon(project.icon, 'project-icon')}
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <a href="${project.url}" target="_blank" class="project-link">前往查看</a>
            </div>
        `).join('')}</div>`;

        const loadingEl = container.querySelector('.loading');
        if (loadingEl) loadingEl.remove();
        container.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        logError('加载项目信息失败', error);
        container.innerHTML = '<div class="error">项目信息加载失败</div>';
    }
}

/**
 * 更新个人介绍和所在地
 */
function renderIntro() {
    // 更新个人介绍
    const introSection = document.getElementById('introSection');
    if (introSection) {
        const titleEl = introSection.querySelector('.section-title');
        const contentEl = introSection.querySelector('.section-content');

        if (titleEl) titleEl.textContent = aboutConfig.introduction.title;
        if (contentEl) {
            contentEl.innerHTML = aboutConfig.introduction.paragraphs
                ? aboutConfig.introduction.paragraphs.map(p => `<p>${p}</p>`).join('')
                : aboutConfig.introduction.content || '';
        }
    }

    // 更新所在地
    const locationSection = document.getElementById('locationSection');
    if (locationSection) {
        const titleEl = locationSection.querySelector('.section-title');
        const contentEl = locationSection.querySelector('.section-content');

        if (titleEl) titleEl.textContent = `当前所在地：${aboutConfig.location.city}`;
        if (contentEl) {
            contentEl.innerHTML = aboutConfig.location.paragraphs
                ? aboutConfig.location.paragraphs.map(p => `<p>${p}</p>`).join('')
                : aboutConfig.location.description || '';
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderIntro();
    renderContact();
    renderProjects();
});
