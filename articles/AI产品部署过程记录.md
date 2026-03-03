---
title: AI产品部署过程记录
categories: 过程记录
createTime: 2026-03-03
updateTime: 2026-03-03
description: AI产品部署过程记录
top: false
---
# Ollama
## 部署本地DeepSeek
# OpenClaw
## 前置环境
1. win11虚拟机
2. `GIT` 和 `Node`
## 基础部署
进入官网：[openclaw官网](ttps://openclaw.ai)
### 1、执行npm安装命令
```bash
# Install OpenClaw（安装openclaw）
$npm i -g openclaw
```
### 2. 执行初始化openclaw命令
```bash
# Meet your lobster（开始使用）
$openclaw onboard
```
### 3. 产品的介绍和风险说明
![产品的介绍和风险说明](/articles/AI产品部署过程记录/chanpinjieshao.png)
### 4. 部署模式选择快速
```bash
 Onboarding mode

│  QuickStart
```
### 5. 选择大模型平台，并配置ApiKey
![选择大模型平台，并配置ApiKey](/articles/AI产品部署过程记录/daxingmoxingpingtai.png)
### 5. 选择消息机器人，并配置AppId和AppSecret
![选择消息机器人，并配置AppId和AppSecret](/articles/AI产品部署过程记录/xiaoxijiqiren.png)
### 6. 选择是否现在配置 skills 和 hooks
skills选择no，后续按需配置。
hooks默认全选
![选择是否现在配置skills和hooks](/articles/AI产品部署过程记录/skillshehooks.png)
### 7. 选择使用时的界面类型
![选择使用时的界面类型](/articles/AI产品部署过程记录/wancheng.png)
### 8. 完成
![完成](/articles/AI产品部署过程记录/buquwancheng.png)
### 9. 相关命令
```bash
#停止服务
openclaw gateway stop

#启动服务
openclaw gateway start

#重启服务
openclaw gateway restart

#查看服务状态
openclaw gateway status

#重新运行配置
openclaw configure
```
## 进阶配置