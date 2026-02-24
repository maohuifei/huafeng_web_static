/**
 * 首页滚动动画 - 文字渐入效果
 */

// 观察器配置
const observerOptions = {
    root: null,
    rootMargin: '-100px',
    threshold: 0.1
};

// 创建观察器
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

/**
 * 初始化滚动动画
 */
function initScrollAnimation() {
    const elements = document.querySelectorAll('.animate-text');

    elements.forEach((el, index) => {
        el.classList.remove('visible');
        if (index > 0) {
            el.style.transitionDelay = `${Math.min(index * 0.2, 0.6)}s`;
        }
        observer.observe(el);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initScrollAnimation, 100);
});
