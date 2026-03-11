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
        city: "青岛",
        // 使用 paragraphs 数组支持多段落
        paragraphs: [
            "青岛地处山东半岛东南部，是一座充满活力的海滨城市，以红瓦绿树、碧海蓝天而闻名",
            "这里气候宜人，环境优美，融合了现代化都市的繁华与海滨城市的悠闲",
            "青岛是国家历史文化名城，也是重要的国际性港口城市和滨海度假旅游城市",
            "1891年清政府在此设防，青岛由此建置，因古代渔村青岛得名。青岛被誉为'东方瑞士'，是'世界啤酒之城'、'世界帆船之都'。",
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
