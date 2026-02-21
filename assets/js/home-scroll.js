// 首页滚动动画 - 文字渐入效果

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
            // 可选：动画完成后取消观察
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// 初始化动画
function initScrollAnimation() {
    // 获取所有需要动画的元素
    const animateElements = document.querySelectorAll('.animate-text');
    
    // 为每个元素添加观察
    animateElements.forEach((el, index) => {
        // 重置状态
        el.classList.remove('visible');
        // 添加延迟（根据索引）
        if (index > 0) {
            el.style.transitionDelay = `${Math.min(index * 0.2, 0.6)}s`;
        }
        // 开始观察
        observer.observe(el);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟一点时间确保 DOM 完全渲染
    setTimeout(initScrollAnimation, 100);
});

// 如果使用了 Turbolinks 或类似库，需要在页面切换后重新初始化
document.addEventListener('page:load', () => {
    setTimeout(initScrollAnimation, 100);
});
