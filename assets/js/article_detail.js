/**
 * 文章详情页脚本 - 渲染文章内容和目录
 */
import { logError } from './utils.js';

/**
 * 获取 URL 参数
 */
function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

const fileName = getUrlParam('fileName');

// 验证参数
if (!fileName) {
    document.getElementById('toc').innerHTML = '<div class="error">无效的文章链接！</div>';
    document.getElementById('contentLoading').style.display = 'none';
    document.getElementById('articleDetail').innerHTML = '<div class="error">未找到指定文章！</div>';
}

/**
 * 配置 marked 渲染器以支持 Prism.js
 */
function configureMarkedForPrism() {
    if (typeof marked !== 'undefined') {
        // 配置 marked 选项
        marked.setOptions({
            gfm: true,
            breaks: true
        });
        
        // 配置 code 渲染器以支持 Prism.js
        const codeRenderer = {
            code(token) {
                let language = token.lang || 'plaintext';

                // 处理语言别名
                const langAlias = {
                    'js': 'javascript',
                    'ts': 'typescript',
                    'py': 'python',
                    'sh': 'bash',
                    'shell': 'bash'
                };
                if (langAlias[language]) {
                    language = langAlias[language];
                }

                // 转义 HTML 特殊字符
                const codeText = String(token.text)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');

                return `<pre class="language-${language}"><code class="language-${language}">${codeText}</code></pre>`;
            }
        };

        marked.use({ renderer: codeRenderer });
    }
}

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
 * 生成目录（支持层级折叠）
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
 * 渲染文章详情
 */
async function renderArticleDetail() {
    try {
        const response = await fetch(`./articles/${fileName}`);
        if (!response.ok) throw new Error('文章加载失败');

        let mdContent = await response.text();

        // 处理 HTML 格式
        if (mdContent.includes('<body>')) {
            const doc = new DOMParser().parseFromString(mdContent, 'text/html');
            const markdownBody = doc.querySelector('.markdown-body');
            if (markdownBody) {
                const firstH2 = markdownBody.querySelector('h2');
                if (firstH2 && firstH2.textContent.includes('title:')) {
                    mdContent = firstH2.textContent + '\n\n' + markdownBody.innerHTML.replace(firstH2.outerHTML, '');
                } else {
                    mdContent = markdownBody.innerText;
                }
            }
        }

        // 解析元信息
        const metaRegex = /---\r?\n([\s\S]*?)---\r?\n/g;
        const matches = [...mdContent.matchAll(metaRegex)];
        let meta = { title: '未知标题', categories: '未分类', createTime: '未知时间', updateTime: '未知时间' };

        matches.forEach(match => {
            match[1].trim().split('\n').forEach(line => {
                const cleanLine = line.trim();
                if (!cleanLine) return;
                const colonIndex = cleanLine.indexOf(':');
                if (colonIndex === -1) return;

                const key = cleanLine.substring(0, colonIndex).trim();
                const value = cleanLine.substring(colonIndex + 1).trim();
                if (key && value) {
                    meta[key.trim()] = value;
                }
            });
        });

        // 配置 marked 渲染器以支持 Prism.js
        configureMarkedForPrism();

        // 提取正文
        let content = mdContent.replace(metaRegex, '').trim();
        const htmlContent = marked.parse(content);

        // 修复 HTML 中的图片路径：将 markdown 图片语法转换为正确的 img 标签
        // 匹配 ![alt](./path/to/image.png) 并转换为 <img src="./articles/path/to/image.png" alt="alt">
        const fixedHtmlContent = htmlContent.replace(
            /!\[([^\]]*)\]\(\.\/([^)]+)\)/g,
            `<img src="./articles/$2" alt="$1">`
        );

        // 生成目录（使用修复后的 HTML）
        const { tocHtml, updatedHtml } = generateToc(fixedHtmlContent);

        // 渲染页面
        document.title = `${meta.title} - 我的个人网页`;
        document.getElementById('toc').innerHTML = tocHtml;
        document.getElementById('contentLoading').style.display = 'none';
        document.getElementById('articleDetail').innerHTML = `
            <div class="article-meta-detail">
                <span class="article-category-detail">${meta.categories}</span>
                <h1 class="article-title-detail">${meta.title}</h1>
                <div class="article-time-detail">
                    <span>创建时间：${meta.createTime}</span>
                    <span>更新时间：${meta.updateTime}</span>
                </div>
            </div>
            <div class="article-body">${updatedHtml}</div>
        `;

        // 初始化交互
        initTocToggle();
        initScrollSpy();
        initCodeBlocks();
    } catch (error) {
        logError('加载文章失败', error);
        document.getElementById('toc').innerHTML = '<div class="error">目录加载失败</div>';
        document.getElementById('contentLoading').style.display = 'none';
        document.getElementById('articleDetail').innerHTML = '<div class="error">文章加载失败</div>';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    if (fileName) renderArticleDetail();
    initBackToTop();
});
