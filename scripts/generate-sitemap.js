#!/usr/bin/env node

/**
 * 生成 sitemap.xml
 * 基于文章索引自动生成所有文章页面的 sitemap
 */

const fs = require('fs');
const path = require('path');

const INDEX_FILE = path.join(__dirname, '..', 'assets', 'data', 'articles-index.json');
const SITEMAP_FILE = path.join(__dirname, '..', 'sitemap.xml');
const BASE_URL = 'https://jzw.asia';

// 格式化日期为 YYYY-MM-DD
function formatDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    return dateStr.substring(0, 10);
}

// 生成 sitemap XML
function generateSitemap() {
    console.log('🗺️ 开始生成 sitemap.xml...');

    // 读取文章索引
    if (!fs.existsSync(INDEX_FILE)) {
        console.error('❌ 文章索引文件不存在，请先运行 generate-articles-index.js');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    const articles = data.articles;

    // 构建 sitemap 内容
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    <!-- 自动生成于 ${new Date().toISOString()} -->
    <!-- 域名：${BASE_URL} -->

    <!-- 首页 -->
    <url>
        <loc>${BASE_URL}/</loc>
        <lastmod>${formatDate(new Date().toISOString())}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>

    <!-- 文章列表页 -->
    <url>
        <loc>${BASE_URL}/articles.html</loc>
        <lastmod>${formatDate(new Date().toISOString())}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>

    <!-- 文章归档页 -->
    <url>
        <loc>${BASE_URL}/archive.html</loc>
        <lastmod>${formatDate(new Date().toISOString())}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>

    <!-- 关于页 -->
    <url>
        <loc>${BASE_URL}/about.html</loc>
        <lastmod>${formatDate(new Date().toISOString())}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>

    <!-- 声明页 -->
    <url>
        <loc>${BASE_URL}/declaration.html</loc>
        <lastmod>${formatDate(new Date().toISOString())}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.5</priority>
    </url>

`;

    // 添加所有文章
    articles.forEach(article => {
        const lastmod = formatDate(article.updateTime || article.createTime);
        sitemap += `    <!-- 文章：${article.title} -->
    <url>
        <loc>${BASE_URL}/article_detail.html?fileName=${encodeURIComponent(article.fileName)}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>

`;
    });

    sitemap += `</urlset>
`;

    // 写入文件
    fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf-8');
    console.log(`🎉 sitemap.xml 生成完成：${SITEMAP_FILE}`);
    console.log(`📊 共 ${articles.length + 5} 个页面（${articles.length} 篇文章 + 5 个固定页面）`);
}

// 执行
generateSitemap();
