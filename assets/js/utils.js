/**
 * 工具函数库
 */

/**
 * 渲染图标 - 支持 URL 或 Iconfont 类名
 * @param {string} icon - 图标 URL 或类名
 * @param {string} className - 额外类名
 * @returns {string} HTML 字符串
 */
export function renderIcon(icon, className = '') {
    if (!icon) return '';

    if (icon.startsWith('http://') || icon.startsWith('https://')) {
        return `<img src="${icon}" alt="icon" class="${className}" loading="lazy">`;
    }
    return `<i class="iconfont ${icon} ${className}"></i>`;
}

/**
 * 记录错误日志（仅开发环境）
 * @param {string} message - 错误信息
 * @param {any} error - 错误对象
 */
export function logError(message, error) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('[Error]', message, error);
    }
}

/**
 * 判断当前页面
 * @param {string} url - 要判断的 URL
 * @returns {boolean} 是否为当前页面
 */
export function isCurrentPage(url) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    return currentPage === url;
}
