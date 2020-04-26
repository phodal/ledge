# 前端

## 网络

### Internet 如何工作

### HTTP

### 浏览器如何工作

### DNS 如何工作

### 什么是域名

## HTML

### 语义化

### Accessibility

### SEO

## CSS

### 布局

#### Float

#### Positioning

#### Box Model

#### CSS Flex

[CSS Flex](https://developer.mozilla.org/en-US/docs/Web/CSS/flex) 是一种「一维」布局。

#### CSS Grid

[CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)，相较于 [Flex](https://developer.mozilla.org/en-US/docs/Web/CSS/flex) 是一种「二维」布局。

### SASS/LESS

### 响应式设计

### BEM

[BEM](http://getbem.com/)，即  Block Element Modifier 的缩写，是一种编写 CSS 的原则（methodologies），用于解决大型项目中 CSS 如何组织的问题。

### CSS Framework

#### Bootstrap

#### Material UI

#### Tailwind CSS

[Tailwind](https://tailwindcss.com/), 是一个 CSS Framework，官方称之为「utility-first」，即它讲一些 CSS 功能封装为 「class」，且可自定义和扩展。

### PostCSS

[PostCSS](https://postcss.org/)，基于 JavaScript 的 CSS 处理器。它有丰富的插件，例如：[autoprefixer](https://github.com/postcss/autoprefixer)、[postcss-preset-env](https://preset-env.cssdb.org/)。

### CSS Module

[CSS Modules](https://github.com/css-modules/css-modules)，是指同一个 CSS 文件中的所有 CSS class 等都默认本地作用域。由于不是 CSS 原生支持，所以一般需要配合 Webpack 的 CSS-loader 或者 PostCSS 使用。

### Styled Components

### Emotion

## JavaScript

### DOM 操作

### Fetch/AJAX

### ES6+

### TypeScript

## Web Component

### HTML Template

### Custom Element

### Shadow DOM

## 构建

### Webpack

### Rollup

### Parcel

## 包管理

### NPM

### yarn

## 测试

### Karma

### Jasmine

### Jest

### Cypress

### Enzyme

## 性能

### PRPL

[PRPL](https://web.dev/apply-instant-loading-with-prpl/) 指的是：

1. Push (or preload) the most important resources.
2. Render the initial route as soon as possible.
3. Pre-cache remaining assets.
4. Lazy load other routes and non-critical assets.

代表着一种让网页加载更快的模式。

### RAIL

[RAIL](https://developers.google.com/web/fundamentals/performance/rail) 指的是：

1. Response
2. Animation
3. Idle
4. Load

代表一种以用户为中心，将用户体验分解为上述 4 个方面的模式。

### Lighthouse

[Lighthouse](https://developers.google.com/web/tools/lighthouse) 是前端质量检测工具，包括「Performance」、「Accessibility」、「PWA」等等检测指标。

它可以在 Chrome、命令行和 Node 中使用。

### Devtools

## 安全

### CORS

### Content Security Policy

### OWASP

## 监控

## 框架

### Angular

#### RxJS

#### NGRX

### React

#### Redux

#### MobX

### Vue

#### VueX

## Server Side Rendering (SSR)

Server Side Rendering (SSR)，即服务端渲染，是指在**运行阶段**，由 Node 服务器渲染的 HTML 网页。已减少数据请求，从而达到更快的渲染速度。

SSR 可以保证数据的实时性，但是需要部署到一个 Node 服务器上。

### Next.js

[Next.js](https://nextjs.org/) 是基于 React 的 SSR/SSG 框架。

### Angular Universal

[Angular Universal](https://angular.io/guide/universal)，Angular 提供的 SSR 功能。

### Nuxt.js

[Nuxt.js](https://nuxtjs.org/) 是基于 Vue 的 SSR 框架。

## Static Side Generator (SSG)

Static Side Generator (SSG)，即静态网站生成，是指在**构建阶段**，直接生成渲染后的 HTML 网页。已达到最佳的 [Time-To-First-Byte](https://en.wikipedia.org/wiki/Time_to_first_byte) 效果，以及更好的 SEO。

SSG 的概念本身并不新，但是基于现在三大前端框架（Angular, React, Vue）的 SSG 框架，既满足了多样化、复杂化的前端开发需要，又可以得到更好的首次渲染性能。

但是由于生成阶段在构建阶段，就会导致其数据无法达到实时性。

### GatsbyJS

[GatsbyJS](https://www.gatsbyjs.org/) 是基于 React 的 SSG 框架。

### Scully

[Scully](https://github.com/scullyio/scully) 是基于 Angular 的 SSG 框架，本网站（https://devops.phodal.com/）就是使用了 Scully。

### Gridsome

[Gridsome](https://gridsome.org/) 是基于 Vue 的 SSG 框架。

## Mobile APP

### React Native

### Flutter

### NativeScript

### Ionic

## Desktop APP

### Electron

## GraphQL

### Apollo

### Relay

## Progressive Web APP

## WebAssembly

## 小程序

小程序主要是运行在某个「超级 APP」上的 Web 应用，主要包括：

1. [微信小程序](https://mp.weixin.qq.com/cgi-bin/wx?token=&lang=zh_CN)
2. [支付宝](https://mini.open.alipay.com/channel/miniIndex.htm)
3. [字节跳动小程序](https://developer.toutiao.com/)

### 小程序框架

由于各个公司都推出自己的小程序实现，导致开发者需要针对不同的小程序平台多次开发，所以 [Taro](https://taro.jd.com/) 这种小程序框架应运而生

> 多端统一开发框架，支持用 React 的开发方式编写一次代码，生成能运行在微信/京东/百度/支付宝/字节跳动/ QQ 小程序/快应用/H5/React Native 等的应用。

类似的还有 [WePY](https://wepyjs.github.io/wepy-docs/)、[mpvue](http://mpvue.com/) 、[uni-app](https://uniapp.dcloud.io/) 等等。

他们都是基于某种框架的语法（React、Vue），然后编译成对应的小程序语法。
