---
title: arm架构macos部署sqlserver
categories: 过程记录
createTime: 2025-01-20
updateTime: 2026-02-21
description: arm架构macos部署sqlserver
---

## 安装docker

```
sudo apt update
sudo apt install docker.io

```

## 启动docker

```
sudo systemctl start docker

```

## docker开机自启

```
sudo systemctl enable docker

```

## 用户加组

```
sudo usermod -aG docker $USER

```

## 拉取 Azure SQL Edge 镜像

```
docker pull mcr.microsoft.com/azure-sql-edge

```

## 运行容器

```
docker run -e 'ACCEPT_EULA=1' -e 'MSSQL_SA_PASSWORD=SAsa991((!' \
   -p 1433:1433 --name azuresqledge \
   -d mcr.microsoft.com/azure-sql-edge

```

## 查看容器状态

```
docker ps

```

## 连接sql（使用DBeaver ARM 社区构建版）

### java环境

```
sudo apt update
sudo apt install default-jre -y
java -version

```

### 下载

```
wget https://dbeaver.io/files/ea/dbeaver-ce-25.1.0-linux.gtk.aarch64-nojdk.tar.gz

```

### 解压并运行

```
tar -xvzf dbeaver-ce-25.1.0-linux.gtk.aarch64-nojdk.tar.gz
cd dbeaver
./dbeaver
```
