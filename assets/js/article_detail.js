/**
 * 文章详情页脚本 - 渲染文章内容和目录
 */
import { logError } from './utils.js';





/**
 * 初始化代码块高亮和复制功能
 */
function initCodeBlocks() {
    // 等待 Prism 加载完成
    const initPrism = () => {
        if (typeof Prism !== 'undefined' && Prism.highlightAll) {
            // 使用 Prism 的自动高亮功能
            Prism.highlightAll();
            console.log('[Prism] 代码高亮已初始化');
        } else {
            // Prism 还未加载，稍后重试
            setTimeout(initPrism, 100);
        }
    };
    initPrism();
}

/**
 * 从标题数据生成目录
 */
function generateTocFromHeadings(headingsData) {
    if (headingsData.length === 0) {
        return '<div class="toc-empty">本文暂无目录</div>';
    }

    // 构建层级结构
    const hierarchy = [];
    const stack = [];

    headingsData.forEach(heading => {
        const node = { ...heading, children: [] };

        while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
            stack.pop();
        }

        if (stack.length === 0) {
            hierarchy.push(node);
        } else {
            stack[stack.length - 1].children.push(node);
        }
        stack.push(node);
    });

    // 递归生成目录 HTML
    function buildTocHtml(nodes, level = 1) {
        let html = '<ul class="toc-list">';
        nodes.forEach(node => {
            const hasChildren = node.children.length > 0;
            const isExpanded = level <= 4;
            html += `
                <li class="toc-item toc-h${node.level}">
                    <div class="toc-item-inner">
                        ${hasChildren ? `<button class="toggle-btn${isExpanded ? ' expanded' : ''}" title="展开/收起"></button>` : '<span style="display:inline-block;width:18px;"></span>'}
                        <a href="#${node.id}" class="toc-link">${node.text}</a>
                    </div>
                    ${hasChildren ? `<div class="toc-children"${isExpanded ? '' : ' style="display:none;"'}>${buildTocHtml(node.children, level + 1)}</div>` : ''}
                </li>
            `;
        });
        html += '</ul>';
        return html;
    }

    return buildTocHtml(hierarchy);
}

/**
 * 生成目录（支持层级折叠）- 旧版本，用于HTML字符串
 */
function generateToc(htmlContent) {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    if (headings.length === 0) {
        return { tocHtml: '<div class="toc-empty">本文暂无目录</div>', updatedHtml: htmlContent };
    }

    // 构建层级结构
    const hierarchy = [];
    const stack = [];

    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.slice(1));
        const text = heading.textContent.trim();
        const safeId = `heading-${index}-${text.replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '').toLowerCase()}`;
        heading.id = safeId;

        const node = { level, text, id: safeId, children: [] };

        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        if (stack.length === 0) {
            hierarchy.push(node);
        } else {
            stack[stack.length - 1].children.push(node);
        }
        stack.push(node);
    });

    // 递归生成目录 HTML
    function buildTocHtml(nodes, level = 1) {
        let html = '<ul class="toc-list">';
        nodes.forEach(node => {
            const hasChildren = node.children.length > 0;
            const isExpanded = level <= 4;
            html += `
                <li class="toc-item toc-h${node.level}">
                    <div class="toc-item-inner">
                        ${hasChildren ? `<button class="toggle-btn${isExpanded ? ' expanded' : ''}" title="展开/收起"></button>` : '<span style="display:inline-block;width:18px;"></span>'}
                        <a href="#${node.id}" class="toc-link">${node.text}</a>
                    </div>
                    ${hasChildren ? `<div class="toc-children"${isExpanded ? '' : ' style="display:none;"'}>${buildTocHtml(node.children, level + 1)}</div>` : ''}
                </li>
            `;
        });
        html += '</ul>';
        return html;
    }

    const tocHtml = buildTocHtml(hierarchy);
    const updatedHtml = new XMLSerializer().serializeToString(doc);
    return { tocHtml, updatedHtml };
}

/**
 * 初始化目录折叠交互
 */
function initTocToggle() {
    // 折叠/展开按钮
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.toggle('expanded');
            const tocItem = this.closest('.toc-item');
            const children = Array.from(tocItem.children).find(c => c.classList.contains('toc-children'));
            if (children) children.classList.toggle('expanded');
        };
    });

    // 目录链接点击
    document.querySelectorAll('.toc-link').forEach(link => {
        link.onclick = function(e) {
            const targetId = this.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();
                
                // 方法1：使用原生的scrollIntoView（最简单可靠）
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 添加视觉反馈
                targetElement.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                targetElement.style.borderRadius = '4px';
                targetElement.style.transition = 'background-color 0.3s ease';
                setTimeout(() => { 
                    targetElement.style.backgroundColor = '';
                }, 1500);
                
                // 更新URL哈希（可选，但会添加历史记录）
                // history.pushState(null, null, `#${targetId}`);
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
 * 渲染文章详情
 */
async function renderArticleDetail() {
    try {
        // 等待一小段时间确保DOM完全加载
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 现在文章已经是完整的HTML页面，不需要再获取markdown文件
        // 直接从页面中获取内容生成目录
        const articleBody = document.querySelector('.article-body');
        
        if (!articleBody) {
            console.warn('找不到 .article-body 元素');
            // 尝试通过其他方式查找内容
            const articleDetail = document.querySelector('.article-detail');
            if (articleDetail) {
                return generateToc(articleDetail.innerHTML);
            }
            throw new Error('找不到文章内容');
        }
        
        console.log('找到文章内容，长度:', articleBody.innerHTML.length);
        
        // 获取页面中的所有标题元素并设置id
        const pageHeadings = document.querySelectorAll('.article-body h1, .article-body h2, .article-body h3, .article-body h4, .article-body h5, .article-body h6');
        const headingsData = [];
        
        pageHeadings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.slice(1));
            const text = heading.textContent.trim();
            const safeId = `heading-${index}-${text.replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '').toLowerCase()}`;
            heading.id = safeId;
            console.log(`设置标题id: ${safeId} for "${text}" (h${level})`);
            
            headingsData.push({
                level,
                text,
                id: safeId
            });
        });
        
        // 基于页面DOM中的标题生成目录
        const tocHtml = generateTocFromHeadings(headingsData);
        
        // 更新目录
        const tocElement = document.getElementById('toc');
        if (tocElement) {
            console.log('更新目录元素');
            tocElement.innerHTML = tocHtml;
        } else {
            console.warn('找不到 #toc 元素');
        }
        
        // 移除"目录生成中..."的提示
        const tocEmpty = document.querySelector('.toc-empty');
        if (tocEmpty) {
            console.log('移除目录生成中提示');
            tocEmpty.style.display = 'none';
        }
        
        // 初始化交互
        initTocToggle();
        initScrollSpy();
        initCodeBlocks();
        
    } catch (error) {
        logError('生成目录失败', error);
        const tocElement = document.getElementById('toc');
        if (tocElement) {
            tocElement.innerHTML = '<div class="error">目录加载失败</div>';
        }
        
        // 移除"目录生成中..."的提示
        const tocEmpty = document.querySelector('.toc-empty');
        if (tocEmpty) {
            tocEmpty.style.display = 'none';
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - 开始渲染文章详情');
    renderArticleDetail();
    initBackToTop();
});
