#!/bin/bash
# 更新文章索引脚本
# 使用方法：./update_index.sh

echo "正在生成文章索引..."
node assets/js/generate_index.js

if [ $? -eq 0 ]; then
    echo "✓ 索引更新完成"
    echo ""
    echo "提示：当添加/删除/修改文章后，请运行此脚本更新索引"
else
    echo "✗ 索引生成失败"
    exit 1
fi
