import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/blog/',
  title: "博客",
  description: "苏子龙博客",
  markdown: {
    headers: {
      level: [2, 3, 4] // 目录显示的标题级别
    },
  },
  themeConfig: {
    // 1. 配置大纲（右侧目录）显示到 h3
    outline: {
      level: [2, 3],  // 显示 h2 和 h3 标题
      label: '目录',   // 目录标题文字
    },
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      // { text: 'Html', link: '/' },
      { text: 'Css', link: '/css/引入方式与优先级' },
      { text: 'JavaScript', link: '/javascript/basic/数据类型' },
      { text: '浏览器', link: '/browser/浏览器渲染原理' },
      { text: '工程化', link: '/engineering/Husky' },
      // { text: '网络', link: '/network/' },
      {
        text: '框架',
        items: [
          { text: 'Vue', link: '/vue/Vue3新特性' },
          { text: 'React', link: '/react/Fiber' },
        ]
      },
      { text: '性能', link: '/performance/vendor文件体积过大如何解决' },
      { text: '其他', link: '/other/资源' },
    ],
    // 侧边栏
    sidebar: {
      "browser": [
        {
          text: '浏览器',
          items: [
            { text: '浏览器渲染原理', link: '/browser/浏览器渲染原理' },
            { text: '浏览器输入URL后回车会发生什么', link: '/browser/浏览器输入URL后回车会发生什么' },
          ]
        },
      ],
      "html": [
        {
          text: 'Html',
          items: [
            { text: '浏览器渲染原理', link: '/browser/浏览器渲染原理' },
          ]
        },
      ],
      "css": [
        {
          text: 'Css',
          items: [
            { text: '引入方式与优先级', link: '/css/引入方式与优先级' },
            { text: '选择器', link: '/css/选择器' },
            { text: '伪类和伪元素', link: '/css/伪类和伪元素' },
            { text: '格式化上下文', link: '/css/格式化上下文' },
            { text: '层叠、优先级与继承', link: '/css/层叠、优先级与继承' },
            { text: '盒模型', link: '/css/盒模型' },
            { text: '布局', link: '/css/布局' },
            { text: '响应式网页设计和媒体查询', link: '/css/响应式网页设计和媒体查询' },
            { text: '溢出', link: '/css/溢出' },
            { text: '层叠上下文', link: '/css/层叠上下文' },
            { text: '重排与重绘', link: '/css/重排与重绘' },
            { text: 'GPU加速', link: '/css/GPU加速' },
            { text: '属性计算过程', link: '/css/属性计算过程' },
            { text: '包含块', link: '/css/包含块' },
          ]
        },
      ],
      "javascript": [
        {
          text: '基础知识',
          items: [
            { text: '数据类型', link: '/javascript/basic/数据类型' },
            { text: '类型转换', link: '/javascript/basic/类型转换' },
            { text: '相等性比较', link: '/javascript/basic/相等性比较' },
            { text: '严格模式', link: '/javascript/basic/严格模式' },
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '作用域', link: '/javascript/core/作用域' },
            { text: '提升', link: '/javascript/core/提升' },
            { text: '闭包', link: '/javascript/core/闭包' },
            { text: '执行上下文', link: '/javascript/core/执行上下文' },
            { text: 'this', link: '/javascript/core/this' },
            { text: '原型', link: '/javascript/core/原型' },
            { text: '继承', link: '/javascript/core/继承' },
            { text: '事件循环', link: '/javascript/core/事件循环' },
          ]
        },
        {
          text: '其他',
          items: [
            { text: '深拷贝与浅拷贝', link: '/javascript/other/深拷贝与浅拷贝' },
            { text: '编辑器撤销重做功能', link: '/javascript/other/编辑器撤销重做功能' },
            { text: '微前端iframe架构通讯方式', link: '/javascript/other/微前端iframe架构通讯方式' },
          ]
        },
        {
          text: '高级主题',
          items: [
          ]
        },
        // {
        //   text: 'DOM',
        //   items: [
        //     { text: '闭包', link: '/javascript/闭包' },
        //   ]
        // },
        // {
        //   text: 'BOM',
        //   items: [
        //     { text: '闭包', link: '/javascript/闭包' },
        //   ]
        // },
        // {
        //   text: '存储相关',
        //   items: [
        //     { text: '闭包', link: '/javascript/闭包' },
        //   ]
        // },
        // {
        //   text: '网络请求',
        //   items: [
        //     { text: '闭包', link: '/javascript/闭包' },
        //   ]
        // },
        // {
        //   text: '函数进阶',
        //   items: [
        //     { text: '闭包', link: '/javascript/闭包' },
        //   ]
        // },
        {
          text: 'ES6',
          items: [
            { text: '箭头函数', link: '/javascript/es6/箭头函数' },
          ]
        },
        // {
        //   text: '异步编程',
        //   items: [
        //     { text: '闭包', link: '/javascript/闭包' },
        //   ]
        // },
        // {
        //   text: '性能优化',
        //   items: [
        //     { text: '闭包', link: '/javascript/闭包' },
        //   ]
        // },
        // {
        //   text: '设计模式',
        //   items: [
        //     { text: '闭包', link: '/javascript/闭包' },
        //   ]
        // },
        // {
        //   text: '安全相关',
        //   items: [
        //     { text: '闭包', link: '/javascript/闭包' },
        //   ]
        // },
      ],
      "vue": [
        {
          text: '基础',
          items: [
            { text: 'Vue3新特性', link: '/vue/Vue3新特性' },
            { text: 'new Vue()和createApp()的区别', link: '/vue/new Vue()和createApp()的区别' },
            { text: 'Vue2源码执行流程', link: '/vue/Vue2源码执行流程' },
            { text: '响应式原理', link: '/vue/响应式原理' },
            { text: '虚拟Dom', link: '/vue/虚拟Dom' },
            { text: 'Diff算法', link: '/vue/Diff算法' },
            { text: 'key的作用', link: '/vue/key的作用' },
          ]
        },

      ],
      "react": [
        {
          text: 'react',
          items: [
            { text: 'Fiber', link: '/react/Fiber' },
            { text: '自动批处理', link: '/react/自动批处理' },
          ]
        },

      ],
      "资源": [
        {
          text: '资源',
          items: [
            { text: '资源', link: '/other/资源' },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
