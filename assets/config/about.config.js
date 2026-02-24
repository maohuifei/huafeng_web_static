// 关于页配置
export const aboutConfig = {
    // 个人介绍（支持多段落）
    introduction: {
        title: "关于我",
        // 使用 paragraphs 数组支持多段落
        paragraphs: [
            "你好，我是画风，对于编程和设计有一定涉猎",
        ]
    },

    // 所在地信息（支持多段落）
    location: {
        title: "所在地",
        city: "烟台",
        // 使用 paragraphs 数组支持多段落
        paragraphs: [
            "烟台地处山东半岛东北部，是一座美丽的滨海城市，依山傍海，气候宜人",
            "这里有着丰富的海洋资源和独特的胶东文化，是一座宜居宜业的海滨城市",
            "烟台市古为东夷族地，夏朝时东夷族建国，明洪武三十一年，为加强海防，明政府在此设奇山守御所，这是烟台最早的城市雏形。在北山筑烽火台，又称‘狼烟台’，烟台由此而得名。",
        ]
    },

    // 联系方式
    contactList: [
        {
            icon: "icon-youxiang",
            title: "Email",
            url: "mailto:jzwbuer@163.com"
        },
        {
            icon: "icon-GitHub",
            title: "GitHub",
            url: "https://github.com/maohuifei"
        },
        {
            icon: "icon-weixin",
            title: "微信",
            url: "javascript:;",
            qrcode: "./assets/images/wechat_qrcode.jpg"
        },
        {
            icon: "icon-tuite",
            title: "X",
            url: "javascript:;"
        }
    ],

    // 参与的项目
    projects: [
        {
            icon: "icon-GitHub",
            title: "huafeng_web_dynamic",
            description: "使用 TypeScript 全栈开发，前端 Vue + 后端 Express + 数据库 MySQL 的，前后端分离的，简单的动态个人网站",
            url: "https://github.com/maohuifei/huafeng_web_dynamic"
        },
        {
            icon: "icon-GitHub",
            title: "huafeng_web_static",
            description: "使用原生 HTML/CSS/JavaScript 编写的，纯静态的个人在线笔记，解析本地 markdown 文件并展示",
            url: "https://github.com/maohuifei/huafeng_web_static"
        },
        {
            icon: "icon-ziyuan",
            title: "青岛市北不可移动文物巡查",
            description: "对青岛市北区的不可移动文物进行巡查和保护，确保文化遗产的安全",
            url: "https://www.baidu.com/"
        },
        {
            icon: "icon-May_th_icon",
            title: "青岛自贸人才港",
            description: "致力于吸引和培养高端人才，推动区域经济发展",
            url: "https://www.baidu.com/"
        }
    ]
};
