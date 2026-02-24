/**
 * 声明页脚本 - 渲染免责声明内容
 */
import { logError } from './utils.js';

/**
 * 读取并渲染声明内容
 */
async function renderDeclaration() {
    const container = document.getElementById('declarationContent');
    if (!container) return;

    try {
        const response = await fetch('./assets/config/declaration.md');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const mdContent = await response.text();
        const htmlContent = marked.parse(mdContent);

        container.classList.remove('loading');
        container.innerHTML = htmlContent;
    } catch (error) {
        logError('加载声明失败', error);
        container.classList.remove('loading');
        container.innerHTML = `<div class="error">声明内容加载失败<br><small>${error.message}</small></div>`;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', renderDeclaration);
