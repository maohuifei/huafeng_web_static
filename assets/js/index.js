/**
 * 首页脚本 - 渲染技术栈
 */
import { indexConfig } from '../config/index.config.js';
import { renderIcon, logError } from './utils.js';

/**
 * 渲染技术栈列表
 */
function renderTechStack() {
    const container = document.getElementById('techStack');
    if (!container) return;

    try {
        container.innerHTML = indexConfig.techStack.map(tech => `
            <a href="${tech.url}" target="_blank" class="tech-item">
                ${renderIcon(tech.icon, 'tech-icon')}
                <span class="tech-title-small">${tech.title}</span>
            </a>
        `).join('');
    } catch (error) {
        logError('加载技术栈失败', error);
        container.innerHTML = '<div class="error">技术栈信息加载失败</div>';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', renderTechStack);
