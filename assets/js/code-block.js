/**
 * 代码块语言标签和复制按钮功能 - 修复版
 * 修复问题：按钮状态改为已复制后，前面出现两个对号
 */

document.addEventListener('DOMContentLoaded', function() {
    // 处理所有代码块
    initCodeBlocks();
});

/**
 * 初始化所有代码块，添加语言标签和复制按钮
 */
function initCodeBlocks() {
    // 查找所有 <pre><code class="language-xxx"> 元素
    const codeBlocks = document.querySelectorAll('pre > code[class*="language-"]');
    
    codeBlocks.forEach((codeElement, index) => {
        const preElement = codeElement.parentElement;
        if (!preElement) return;
        
        // 如果已经处理过，跳过
        if (preElement.classList.contains('code-block-processed')) {
            return;
        }
        
        // 解析语言
        const language = parseLanguageFromClass(codeElement.className);
        
        // 创建代码块容器
        const container = createCodeBlockContainer(preElement, language, index);
        
        // 标记为已处理
        preElement.classList.add('code-block-processed');
    });
}

/**
 * 从class属性解析语言
 * @param {string} className - 元素的class属性
 * @returns {string} 语言名称
 */
function parseLanguageFromClass(className) {
    // 匹配 language-xxx 格式
    const match = className.match(/\blanguage-(\w+)/i);
    if (match) {
        return match[1];
    }
    
    // 如果没有明确的语言，尝试从其他class中猜测
    if (className.includes('javascript') || className.includes('js')) {
        return 'javascript';
    } else if (className.includes('html')) {
        return 'html';
    } else if (className.includes('css')) {
        return 'css';
    } else if (className.includes('python') || className.includes('py')) {
        return 'python';
    } else if (className.includes('java')) {
        return 'java';
    } else if (className.includes('sql')) {
        return 'sql';
    } else if (className.includes('bash') || className.includes('shell')) {
        return 'shell';
    } else if (className.includes('markdown') || className.includes('md')) {
        return 'markdown';
    } else if (className.includes('json')) {
        return 'json';
    } else {
        return 'text';
    }
}

/**
 * 创建代码块容器，包含语言标签和复制按钮
 * @param {HTMLElement} preElement - 原始的pre元素
 * @param {string} language - 语言名称
 * @param {number} index - 代码块索引
 * @returns {HTMLElement} 新的容器元素
 */
function createCodeBlockContainer(preElement, language, index) {
    // 创建容器
    const container = document.createElement('div');
    container.className = 'code-block-container';
    container.id = `code-block-${index}`;
    
    // 创建工具栏
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    
    // 创建语言标签
    const languageLabel = document.createElement('span');
    languageLabel.className = `code-language ${language}`;
    languageLabel.textContent = language;
    
    // 创建复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';
    copyButton.type = 'button';
    copyButton.setAttribute('aria-label', '复制代码');
    copyButton.innerHTML = '<span class="icon">⎘</span> <span class="text">复制</span>';
    copyButton.dataset.codeId = index;
    copyButton.dataset.originalHtml = copyButton.innerHTML;
    
    // 添加复制功能
    copyButton.addEventListener('click', function() {
        const codeText = preElement.querySelector('code')?.textContent || preElement.textContent;
        copyToClipboard(codeText, this);
    });
    
    // 组装工具栏
    toolbar.appendChild(languageLabel);
    toolbar.appendChild(copyButton);
    
    // 替换pre元素的父级关系
    preElement.parentNode.insertBefore(container, preElement);
    container.appendChild(toolbar);
    container.appendChild(preElement);
    
    return container;
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @param {HTMLElement} button - 复制按钮元素
 */
function copyToClipboard(text, button) {
    // 防止重复点击
    if (button.classList.contains('copying')) {
        return;
    }
    
    button.classList.add('copying');
    
    // 使用现代剪贴板API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showCopySuccess(button);
                button.classList.remove('copying');
            })
            .catch(err => {
                console.error('复制失败:', err);
                fallbackCopyToClipboard(text, button);
                button.classList.remove('copying');
            });
    } else {
        // 回退方案
        fallbackCopyToClipboard(text, button);
        button.classList.remove('copying');
    }
}

/**
 * 回退的复制方法
 * @param {string} text - 要复制的文本
 * @param {HTMLElement} button - 复制按钮元素
 */
function fallbackCopyToClipboard(text, button) {
    // 创建临时textarea元素
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    
    // 选中文本
    textarea.select();
    textarea.setSelectionRange(0, 99999); // 移动设备支持
    
    try {
        // 执行复制命令
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(button);
        } else {
            showCopyError(button, '复制失败，请手动复制');
        }
    } catch (err) {
        console.error('回退复制失败:', err);
        showCopyError(button, '复制失败: ' + err.message);
    }
    
    // 清理
    document.body.removeChild(textarea);
}

/**
 * 显示复制成功状态
 * @param {HTMLElement} button - 复制按钮元素
 */
function showCopySuccess(button) {
    // 保存原始状态
    if (!button.dataset.originalHtml) {
        button.dataset.originalHtml = button.innerHTML;
    }
    
    // 设置已复制状态
    button.innerHTML = '<span class="icon">✓</span> <span class="text">已复制</span>';
    button.classList.add('copied');
    
    console.log('复制成功 - 按钮HTML:', button.innerHTML);
    
    // 2秒后恢复原状
    setTimeout(() => {
        if (button.dataset.originalHtml) {
            button.innerHTML = button.dataset.originalHtml;
            button.classList.remove('copied');
        }
    }, 2000);
    
    // 显示成功提示
    showToast('代码已复制到剪贴板');
}

/**
 * 显示复制错误状态
 * @param {HTMLElement} button - 复制按钮元素
 * @param {string} message - 错误信息
 */
function showCopyError(button, message) {
    const originalHtml = button.dataset.originalHtml || button.innerHTML;
    
    button.innerHTML = '<span class="icon">✗</span> <span class="text">失败</span>';
    button.style.background = 'var(--danger-color)';
    
    // 显示错误提示
    showToast(message, 'error');
    
    setTimeout(() => {
        button.innerHTML = originalHtml;
        button.style.background = '';
        button.classList.remove('copied');
    }, 3000);
}

/**
 * 显示提示信息
 * @param {string} message - 提示信息
 * @param {string} type - 提示类型：'success' 或 'error'
 */
function showToast(message, type = 'success') {
    // 检查是否已存在提示
    const existingToast = document.querySelector('.code-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = `code-toast code-toast-${type}`;
    toast.textContent = message;
    
    // 添加样式
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: var(--radius-md);
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
        color: white;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 9999;
        box-shadow: var(--shadow-lg);
        animation: toastSlideIn 0.3s ease-out;
        opacity: 0.95;
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlideOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 3000);
}

/**
 * 添加动画样式
 */
(function addToastStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastSlideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 0.95;
            }
        }
        
        @keyframes toastSlideOut {
            from {
                transform: translateX(0);
                opacity: 0.95;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();