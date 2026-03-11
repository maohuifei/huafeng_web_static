/**
 * 静态文章详情页脚本 - 仅处理交互，不加载和解析Markdown
 */

/**
 * 初始化目录交互
 */
function initTocInteraction() {
    // 目录链接点击
    document.querySelectorAll('.toc-link').forEach(link => {
        link.onclick = function(e) {
            const targetId = this.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            const contentContainer = document.querySelector('.article-content');

            if (targetElement && contentContainer) {
                e.preventDefault();
                const headerOffset = 100;
                const offsetPosition = targetElement.offsetTop - headerOffset;

                contentContainer.scrollTo({ top: offsetPosition, behavior: 'smooth' });

                targetElement.style.scrollMarginTop = headerOffset + 'px';
                targetElement.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                targetElement.style.borderRadius = '4px';
                setTimeout(() => { targetElement.style.backgroundColor = ''; }, 1500);
            }
        };
    });
}

/**
 * 滚动监听高亮目录
 */
function initScrollSpy() {
    const contentContainer = document.querySelector('.article-content');
    const headings = document.querySelectorAll('.article-body h1, .article-body h2, .article-body h3, .article-body h4, .article-body h5, .article-body h6');
    const tocLinks = document.querySelectorAll('.toc-link');

    if (!contentContainer || headings.length === 0) return;

    const headerHeight = document.querySelector('header').offsetHeight + 20;

    contentContainer.addEventListener('scroll', () => {
        let currentId = '';

        headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            const containerTop = contentContainer.getBoundingClientRect().top;
            if (rect.top - containerTop <= headerHeight) {
                currentId = heading.id;
            }
        });

        tocLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href')?.slice(1) === currentId);
        });

        // 返回顶部按钮
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            backToTopBtn.classList.toggle('visible', contentContainer.scrollTop > 300);
        }
    });
}

/**
 * 返回顶部功能
 */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    const contentContainer = document.querySelector('.article-content');

    if (backToTopBtn && contentContainer) {
        backToTopBtn.onclick = () => {
            contentContainer.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
}

/**
 * 初始化代码块复制功能
 */
function initCodeBlocks() {
    // 等待Prism加载完成
    const checkPrism = () => {
        if (typeof Prism !== 'undefined') {
            // Prism已加载，为代码块添加复制按钮
            document.querySelectorAll('pre[class^="language-"]').forEach(pre => {
                // 如果还没有复制按钮，添加一个
                if (!pre.querySelector('.copy-button')) {
                    const button = document.createElement('button');
                    button.className = 'copy-button';
                    button.textContent = '复制';
                    button.title = '复制代码';
                    
                    button.onclick = async () => {
                        const code = pre.querySelector('code')?.textContent || '';
                        try {
                            await navigator.clipboard.writeText(code);
                            button.textContent = '已复制!';
                            setTimeout(() => {
                                button.textContent = '复制';
                            }, 2000);
                        } catch (err) {
                            console.error('复制失败:', err);
                            button.textContent = '复制失败';
                            setTimeout(() => {
                                button.textContent = '复制';
                            }, 2000);
                        }
                    };
                    
                    pre.style.position = 'relative';
                    button.style.position = 'absolute';
                    button.style.top = '8px';
                    button.style.right = '8px';
                    button.style.padding = '4px 8px';
                    button.style.background = 'var(--primary-color)';
                    button.style.color = 'white';
                    button.style.border = 'none';
                    button.style.borderRadius = '4px';
                    button.style.cursor = 'pointer';
                    button.style.fontSize = '12px';
                    button.style.zIndex = '10';
                    
                    pre.appendChild(button);
                }
            });
        } else {
            // Prism还未加载，稍后重试
            setTimeout(checkPrism, 100);
        }
    };
    
    checkPrism();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initTocInteraction();
    initScrollSpy();
    initBackToTop();
    initCodeBlocks();
    
    console.log('[Static] 文章详情页交互已初始化');
});