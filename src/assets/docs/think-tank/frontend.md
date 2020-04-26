# 前端

## 网络

### Internet 如何工作

[How does the Internet work](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/How_does_the_Internet_work)。

### HTTP

[HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)。

主要版本为：

1. HTTP/1.1
2. [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)
3. [HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)

### 浏览器如何工作

1. [How Browsers Work](https://www.freecodecamp.org/news/web-application-security-understanding-the-browser-5305ed2f1dac/)
2. [Inside look at modern web browse](https://developers.google.com/web/updates/2018/09/inside-browser-part1)
3. [浏览器的工作原理：新式网络浏览器幕后揭秘](https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/)

### DNS 如何工作

[Domain Name System](https://en.wikipedia.org/wiki/Domain_Name_System)

### 什么是域名

[Domain Name](https://en.wikipedia.org/wiki/Domain_name)

## HTML

[Hypertext Markup Language](https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/HTML5)。

HTML5 是最新的 HTML 版本

> HTML5 是定义 HTML 标准的最新的版本。 该术语通过两个不同的概念来表现：它是一个新版本的 HTML 语言，具有新的元素，属性和行为，它有更大的技术集，允许构建更多样化和更强大的网站和应用程序。这个集合有时称为 HTML5 和它的朋友们，不过大多数时候仅缩写为一个词 HTML5。

**值得注意的是在中文语境中（主要指中国大陆），「H5」一般指移动端 Web 网页，有时也包括小程序。**

### 语义化

[语义化](https://developer.mozilla.org/zh-CN/docs/Glossary/%E8%AF%AD%E4%B9%89)

### Accessibility

[可访问性](https://developer.mozilla.org/zh-CN/docs/Learn/Accessibility)

> 可访问性是一种让尽可能多的用户可以使用你的网站的做法。传统上我们认为这只与残疾人士有关，但提升网站的可访问性也可以让其他用户群体受益。比如使用移动设备的人群，那些使用低速网络连接的人群。

### SEO

[Search engine optimization](https://zh.wikipedia.org/wiki/%E6%90%9C%E5%B0%8B%E5%BC%95%E6%93%8E%E6%9C%80%E4%BD%B3%E5%8C%96)

> 一种透过了解搜索引擎的运作规则来调整网站，以及提高目的网站在有关搜索引擎内排名的方式

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

[PWA](https://en.wikipedia.org/wiki/Progressive_web_application)，不同于 Native APP 或者 Web APP，PWA 以 Web 技术开发（Javascript、HTML、CSS 等），同时使用一些现代 API 已实现例如：推送、离线使用、访问硬件等一般 Web APP 无法做到的功能。

PWA 对比 Native APP 有无需安装，方便用户直接使用的优势；对比 Web APP 又有推送等上述 Navive 的功能。

## WebAssembly

[Webassembly](https://webassembly.org/)

> 它是一种低级的类汇编语言，具有紧凑的二进制格式，可以接近原生的性能运行，并为诸如 C / C ++等语言提供一个编译目标，以便它们可以在 Web 上运行。它也被设计为可以与 JavaScript 共存，允许两者一起工作。

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
