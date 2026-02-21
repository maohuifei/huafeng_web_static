/**
 * 工具函数库
 * 提供全局通用的工具方法
 */

/**
 * 智能渲染图标 - 自动识别 URL 或 Iconfont 类名
 * @param {string} icon - 图标 URL 或类名
 * @param {string} className - 额外的 CSS 类名
 * @returns {string} HTML 字符串
 */
export function renderIcon(icon, className = '') {
    if (!icon) return '';
    
    // 判断是否是在线 URL
    if (icon.startsWith('http://') || icon.startsWith('https://')) {
        return `<img src="${icon}" alt="icon" class="${className}" loading="lazy">`;
    }
    // 否则是 Iconfont 类名
    else {
        return `<i class="iconfont ${icon} ${className}"></i>`;
    }
}

/**
 * 记录错误日志（仅开发环境）
 * @param {string} message - 错误信息
 * @param {any} error - 错误对象
 */
export function logError(message, error) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error(message, error);
    }
}

/**
 * 记录普通日志（仅开发环境）
 * @param {string} message - 日志信息
 */
export function log(message) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(message);
    }
}

/**
 * 获取 URL 参数
 * @param {string} name - 参数名
 * @returns {string|null} 参数值
 */
export function getUrlParam(name) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(name);
}

/**
 * 判断当前页面
 * @param {string} url - 要判断的页面 URL
 * @returns {boolean} 是否为当前页面
 */
export function isCurrentPage(url) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    return currentPage === url;
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期字符串或 Date 对象
 * @param {string} format - 格式（default: 'YYYY-MM-DD'）
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 平滑滚动到元素位置
 * @param {string|HTMLElement} target - 目标元素选择器或元素
 * @param {number} offset - 偏移量
 */
export function scrollToElement(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * 检查元素是否在视口中
 * @param {HTMLElement} element - 要检查的元素
 * @param {number} threshold - 阈值（0-1）
 * @returns {boolean} 是否在视口中
 */
export function isElementInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= viewportHeight &&
        rect.right <= viewportWidth
    );
}

/**
 * 添加事件监听器（支持一次触发）
 * @param {HTMLElement} element - 目标元素
 * @param {string} event - 事件名
 * @param {Function} handler - 处理函数
 * @param {boolean} once - 是否只触发一次
 */
export function addEvent(element, event, handler, once = false) {
    element.addEventListener(event, handler, { once });
}

/**
 * 移除 HTML 中的特殊字符
 * @param {string} str - 原始字符串
 * @returns {string} 清理后的字符串
 */
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 */
export function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}
