import { logError } from './utils.js';

// 1. 获取 URL 中的 fileName 参数（文章 MD 文件名）
function getUrlParam(name) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(name);
}

const fileName = getUrlParam('fileName');
if (!fileName) {
    document.getElementById('toc').innerHTML = '<div class="error">无效的文章链接！</div>';
    document.getElementById('contentLoading').style.display = 'none';
    document.getElementById('articleDetail').innerHTML = '<div class="error">未找到指定文章，请返回文章列表页！</div>';
}

// 2. 重构目录生成逻辑：支持层级折叠展开 + 修复 ID 生成
function generateToc(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    if (headings.length === 0) {
        return { tocHtml: '<div class="toc-empty">本文暂无目录</div>', updatedHtml: htmlContent };
    }

    // 步骤 1：构建层级结构（h1 为顶级，h2 是 h1 的子级，h3 是 h2 的子级...）
    const hierarchy = [];
    const stack = []; // 用于维护当前层级的父节点

    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.slice(1)); // 1-6
        const text = heading.textContent.trim();
        // 修复 1：ID 生成兼容中文 + 特殊字符，避免 ID 为空或重复
        const safeId = `heading-${index}-${text.replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '').toLowerCase()}`;
        heading.id = safeId; // 给标题添加唯一锚点 ID

        const node = {
            level,
            text,
            id: safeId,
            children: [],
            element: heading
        };

        // 维护层级栈：弹出比当前层级高的节点
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        if (stack.length === 0) {
            // 顶级节点（h1）
            hierarchy.push(node);
        } else {
            // 子节点，添加到父节点的 children 中
            stack[stack.length - 1].children.push(node);
        }
        stack.push(node);
    });

    // 步骤 2：递归生成带折叠功能的目录 HTML
    function buildTocHtml(nodes, level = 1) {
        let html = '<ul class="toc-list">';
        nodes.forEach(node => {
            // 判断是否有子节点（有则显示折叠按钮）
            const hasChildren = node.children.length > 0;
            // 四级以下（h1、h2、h3、h4）默认展开
            const isExpanded = level <= 4;
            const displayStyle = isExpanded ? '' : ' style="display:none;"';
            
            html += `
                <li class="toc-item toc-h${node.level}">
                    <div class="toc-item-inner">
                        ${hasChildren ? `<button class="toggle-btn${isExpanded ? ' expanded' : ''}" title="展开/收起"></button>` : '<span style="display:inline-block;width:18px;"></span>'}
                        <a href="#${node.id}" class="toc-link">${node.text}</a>
                    </div>
                    ${hasChildren ? `<div class="toc-children"${displayStyle}>${buildTocHtml(node.children, level + 1)}</div>` : ''}
                </li>
            `;
        });
        html += '</ul>';
        return html;
    }

    const tocHtml = buildTocHtml(hierarchy);
    // 序列化 DOM 为 HTML 字符串（修复之前的错误）
    const serializer = new XMLSerializer();
    const updatedHtml = serializer.serializeToString(doc);

    return { tocHtml, updatedHtml };
}

// 3. 初始化目录折叠展开交互
function initTocToggle() {
    // 折叠/展开按钮点击
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            // 切换按钮状态
            this.classList.toggle('expanded');
            // 切换子目录显示/隐藏 - 查找同级的 .toc-children
            const tocItem = this.closest('.toc-item');
            // 使用 children 查找直接子元素中的 .toc-children
            const children = Array.from(tocItem.children).find(
                child => child.classList.contains('toc-children')
            );
            if (children) {
                children.classList.toggle('expanded');
            }
        });
    });

    // 目录链接点击 - 使用原生滚动
    document.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            const contentContainer = document.querySelector('.article-content');
            
            if (targetElement && contentContainer) {
                e.preventDefault();
                // 计算滚动位置 - 增加偏移量避免标题被遮挡
                const headerOffset = 100;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                // 平滑滚动到目标位置
                contentContainer.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // 高亮目标标题
                targetElement.style.scrollMarginTop = headerOffset + 'px';
                targetElement.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                targetElement.style.borderRadius = '4px';
                setTimeout(() => {
                    targetElement.style.backgroundColor = '';
                }, 1500);
            }
        });
    });
}

// 4. 读取 MD 文件并渲染详情 + 目录
async function renderArticleDetail() {
    try {
        const response = await fetch(`./articles/${fileName}`);
        if (!response.ok) throw new Error('文章加载失败');

        let mdContent = await response.text();

        // 如果是 HTML（热铁盒会渲染 Markdown），提取原始内容
        if (mdContent.includes('<body>')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(mdContent, 'text/html');
            const markdownBody = doc.querySelector('.markdown-body');
            if (markdownBody) {
                mdContent = markdownBody.innerText;
            } else {
                const body = doc.querySelector('body');
                if (body) {
                    mdContent = body.innerText || body.textContent;
                }
            }
        }
        
        // 解析元信息
        const metaRegex = /^---([\s\S]*?)---/;
        const metaMatch = mdContent.match(metaRegex);
        let meta = { title: '未知标题', categories: '未分类', createTime: '未知时间', updateTime: '未知时间' };

        if (metaMatch) {
            const metaStr = metaMatch[1].trim();
            metaStr.split('\n').forEach(line => {
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
        }

        // 提取正文并解析为 HTML
        const content = mdContent.replace(metaRegex, '').trim();
        const htmlContent = marked.parse(content);

        // 生成目录和带锚点的 HTML
        const { tocHtml, updatedHtml } = generateToc(htmlContent);

        // 4. 渲染页面
        // 设置页面标题
        document.title = `${meta.title} - 我的个人网页`;
        // 渲染目录
        document.getElementById('toc').innerHTML = tocHtml;
        // 渲染文章详情（包含元信息 + 正文）
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

        // 5. 初始化目录交互（折叠展开 + 锚点跳转）
        initTocToggle();

        // 6. 初始化滚动高亮当前目录
        initScrollSpy();

    } catch (error) {
        logError('加载文章失败：', error);
        document.getElementById('toc').innerHTML = '<div class="error">目录加载失败</div>';
        document.getElementById('contentLoading').style.display = 'none';
        document.getElementById('articleDetail').innerHTML = '<div class="error">文章加载失败，请刷新重试！</div>';
    }
}

// 6. 滚动监听高亮当前目录项
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
            const offset = rect.top - containerTop;

            if (offset <= headerHeight) {
                currentId = heading.id;
            }
        });

        // 高亮当前目录项
        tocLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.slice(1) === currentId) {
                link.classList.add('active');
            }
        });

        // 控制返回顶部按钮显示/隐藏
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            if (contentContainer.scrollTop > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    });
}

// 返回顶部功能
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    const contentContainer = document.querySelector('.article-content');
    
    if (!backToTopBtn || !contentContainer) return;
    
    backToTopBtn.addEventListener('click', () => {
        contentContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 导航栏滚动效果
function initNavbarScroll() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// 当前页面导航高亮
function initActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || href === 'articles.html') {
            link.classList.add('active');
        }
    });
}

// 页面加载时渲染详情
document.addEventListener('DOMContentLoaded', () => {
    if (fileName) {
        renderArticleDetail();
    }
    initNavbarScroll();
    initActiveNav();
    initBackToTop();
});
