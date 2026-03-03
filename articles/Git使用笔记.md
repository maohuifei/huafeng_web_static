---
title: Git 使用笔记
categories: 使用笔记
createTime: 2022-12-03
updateTime: 2026-02-21
description: Git使用笔记
top: true
---
## Git的下载与安装

官网：[https://git-scm.com/](https://git-scm.com/)

根据需要安装即可，如遇英文界面，可使用jieping翻译辅助理解。

安装完成后，会有以下三个环境：

- **Git bash**：Unix与Linux风格的命令行，推荐使用。
- **Git CMD**：Windows风格命令行。
- **Git GUI**：图形界面的Git，不推荐新手使用，建议先熟悉命令行操作。

## 常用的Linux命令

![基本Linux命令](http://1.94.0.101/wp-content/uploads/2024/03/%E5%9F%BA%E6%9C%ACLinux%E5%91%BD%E4%BB%A4-528x295.jpg)

## Git工作区域（运行原理）

工作区——暂存区——本地库——远程库

![Git工作区域](http://1.94.0.101/wp-content/uploads/2024/03/Git%E5%B7%A5%E4%BD%9C%E5%8C%BA%E5%9F%9F.jpg)

## Git文件的四种状态

版本控制的核心是对文件的版本进行管理。在进行文件的修改和提交等操作前，首先需要了解文件当前的状态。

- **Untracked**：未跟踪状态，文件存在于文件夹中，但尚未提交到Git库，不参与版本控制。通过`git add`命令可将其转变为staged状态。
- **Unmodify**：已入库且未修改状态，即库中的文件与文件夹中的内容完全一致。若被修改，则变为Modified状态。使用`git rm`移除版本库，变为Untracked状态。
- **Modified**：已修改状态，文件已被修改，但尚未进行其他操作。有两种处理方式：通过`git add`进入暂存区staged状态；通过`git checkout`丢弃修改，变回Unmodify状态。
- **staged**：暂存状态，使用`git commit`将修改同步到库中，此时库文件和本地文件一致，文件变为Unmodify状态。使用`git reset HEAD filename`可取消暂存，文件变为Modified状态。

## Git的使用

### 创建及提交

```sh
$ git init                 # 初始化，会新建一个名为.git的隐藏文件
git remote add origin [url] # 指定提交的远程存储库的链接
git clone [url]            # 克隆远端仓库到本地
git status                 # 查看所有文件状态
git add .                  # 添加所有文件到暂存区
git commit -m "消息内容"   # 提交暂存区内容到本地仓库，-m后接提交信息/备注信息
git push                   # 提交到远程仓库
```

### 常用命令

```shell
git pull origin master     # 下载代码及快速合并
git push origin master     # 上传代码及快速合并
git fetch origin           # 从远程库获取代码
git branch                 # 显示所有分支
git checkout master        # 切换到master分支
git checkout -b dev        # 创建并切换到dev分支
git status                 # 查看状态
git log                    # 查看提交历史
git init                   # 初始化本地代码仓
git add .                  # 添加本地代码
git commit -m "add local source" # 提交本地代码
git pull origin master     # 下载远程代码
git merge master           # 合并master分支
git push -u origin master  # 上传代码
```

### 忽略文件（指定某些文件不提交）

有时我们不想将某些文件纳入版本控制中，如数据库文件、临时文件、设计文件等。
在主目录下新建`.gitignore`文件，此文件遵循以下规则：

```
# 为注释
*.txt                      # 忽略所有后缀为.txt的文件
!lib.txt                   # 除了lib.txt以外的文件
/tempbulid/                # 忽略bulid项目下的所有文件
doc/*.txt                  # 忽略doc根目录下的.txt文件，不包括doc/ect/001.txt
```

## 报错及解决方法

### 本地远程冲突

- **报错**：```

```
! [rejected] main -> main (non-fast-forward) error: failed to push some refs to '<https://gitee.com/maohuifei/WebSiteTest.git'>
```

- **原因**：他人上传至远程仓库后，未及时同步（拉取）至本地，同时你又添加了一些内容（提交），导致提交时检测到本地仓库状态与远程仓库不一致，出于安全考虑拒绝提交。
- **解决方法**：
- 先拉取：`git pull --rebase origin master`，
- 再上传：`git push -u origin master`。

## 其他

### Gitee/Github的免密码登录

- Gitee：[https://gitee.com/](https://gitee.com/)
- Github：[https://github.com/](https://github.com/)

进入`C:\Users\用户名\.ssh`目录，使用Git Bash输入命令`ssh-keygen -t rsa`生成公钥。

生成两个文件：`id_rsa.pub`（公钥）和`id_rsa`（私钥）。

登录Gitee/Github，进入“设置”——“SSH公钥”——填写`id_rsa.pub`文件内容——保存。

### Git使用代理网络问题

配置Git代理：

```shell
$ git config --global https.proxy http://127.0.0.1:1080
git config --global https.proxy https://127.0.0.1:1080
git config --global http.proxy 'socks5://127.0.0.1:1080'
git config --global https.proxy 'socks5://127.0.0.1:1080' # ip和端口根据代理软件不同可能有所不同
```

### Git配置文件路径

#### Git配置文件

GIt安装目录下的`etc`文件夹里的`gitconfig`文件。路径示例：`F:\Git\etc\gitconfig`。

内容示例：

```
[diff "astextplain"]
    textconv = astextplain
[filter "lfs"]
    clean = git-lfs clean -- %f
    smudge = git-lfs smudge -- %f
    process = git-lfs filter-process
    required = true
[http]
    sslBackend = openssl
    sslCAInfo = F:/Git/mingw64/ssl/certs/ca-bundle.crt
[core]
    autocrlf = true
    fscache = true
    symlinks = true
[pull]
    rebase = false
[credential]
    helper = manager-core
[credential "<https://dev.azure.com>"]
    useHttpPath = true
[init]
    defaultBranch = master
```

#### 全局配置文件

C盘用户目录下的`.gitconfig`文件。路径示例：`C:\Users\用户名\.gitconfig`。

内容示例：

```
[user]
    email = 991270685@qq.com
    name = maohuifei
[init]
    defaultBranch = main
[https]
    proxy = http://192.168.43.1:10809

```

#### 新建的.git配置文件

执行`git init`后，

## 提交前执行的脚本

