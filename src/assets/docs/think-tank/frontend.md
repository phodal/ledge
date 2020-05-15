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

[Float](https://css-tricks.com/all-about-floats/)，是最常用的 CSS 布局方式。

#### Position

[Position](https://developer.mozilla.org/en-US/docs/Web/CSS/position)

1. static
2. relative
3. absolute
4. fixed
5. sticky

#### Box Model

[Box Model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model)

#### CSS Flex

[CSS Flex](https://developer.mozilla.org/en-US/docs/Web/CSS/flex) 是一种「一维」布局。

#### CSS Grid

[CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)，相较于 [Flex](https://developer.mozilla.org/en-US/docs/Web/CSS/flex) 是一种「二维」布局。

### SASS/LESS

[SASS](https://sass-lang.com/) 和 [LESS](http://lesscss.org/) 是两种 [CSS 预处理器](https://developer.mozilla.org/en-US/docs/Glossary/CSS_preprocessor)

### 响应式设计

> 自适应网页设计、回应式网页设计、对应式网页设计。 是一种网页设计的技术做法，该设计可使网站在不同的设备（从桌面电脑显示器到移动电话或其他移动产品设备）上浏览时对应不同分辨率皆有适合的呈现，减少用户进行缩放、平移和滚动等操作行为

### BEM

[BEM](http://getbem.com/)，即  Block Element Modifier 的缩写，是一种编写 CSS 的原则（methodologies），用于解决大型项目中 CSS 如何组织的问题。

### CSS Framework

#### Bootstrap

[Bootstrap](https://getbootstrap.com/)

> Bootstrap 是一个用于 HTML、CSS 和 JS 开发的开源工具包。利用 Bootstrap 提供的 Sass 变量和混合（mixins）、响应式栅格系统、可扩展的预制组件以及强大的 jQuery 插件，能够让你快速地开发出产品原型或构建整个 app。

#### Tailwind CSS

[Tailwind](https://tailwindcss.com/), 是一个 CSS Framework，官方称之为「utility-first」，即它讲一些 CSS 功能封装为 「class」，且可自定义和扩展。

### PostCSS

[PostCSS](https://postcss.org/)，基于 JavaScript 的 CSS 处理器。它有丰富的插件，例如：[autoprefixer](https://github.com/postcss/autoprefixer)、[postcss-preset-env](https://preset-env.cssdb.org/)。

### CSS Module

[CSS Modules](https://github.com/css-modules/css-modules)，是指同一个 CSS 文件中的所有 CSS class 等都默认本地作用域。由于不是 CSS 原生支持，所以一般需要配合 Webpack 的 CSS-loader 或者 PostCSS 使用。

### CSS in JS

[CSS in JS](https://en.wikipedia.org/wiki/CSS-in-JS)

> CSS-in-JS is a styling technique where JavaScript is used to style components. When this JavaScript is parsed, CSS is generated (usually as a style element) and attached into the DOM. It allows you to abstract CSS to the component level itself, using JavaScript to describe styles in a declarative and maintainable way.

1. [Styled Components](https://styled-components.com/) 是一种在 React Component 应用 CSS 样式的库。

2. [Emotion](https://emotion.sh/)，也是一种使用 JavaScript 来写 CSS 的库。

由于 React 官方并没有一种推荐的方式，导致社区中有了众多的方法。

## JavaScript

### DOM 操作

[DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction)

### Fetch/AJAX

浏览器的两种原生网络请求方式：

[AJAX](https://developer.mozilla.org/en-US/docs/Web/Guide/AJAX)

[Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

### ES6+

JavaScript 的标准称之为 [ECMAScript](https://en.wikipedia.org/wiki/ECMAScript) 简称 ES，它有多个版本，普遍意义上讲已 2015 年以后发布的 ES6 （ES2015）为「现代的 JavaScript」。

### TypeScript

[TypeScript](https://www.typescriptlang.org/) 是 JavaScript 类型的超集，他可以编译成 JavaScript。

## Web Component

[Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

> Web Components 是一套不同的技术，允许您创建可重用的定制元素（它们的功能封装在您的代码之外）并且在您的 web 应用中使用它们。

### HTML Template

[HTML Template](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/template)

> HTML 内容模板元素是一种用于保存客户端内容机制，该内容在加载页面时不会呈现，但随后可以(原文为 may be)在运行时使用 JavaScript 实例化。

### Custom Element

[Custom Element](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements)

> Web Components 标准非常重要的一个特性是，它使开发者能够将 HTML 页面的功能封装为 custom elements（自定义标签），而往常，开发者不得不写一大堆冗长、深层嵌套的标签来实现同样的页面功能。

### Shadow DOM

> Web components 的一个重要属性是封装——可以将标记结构、样式和行为隐藏起来，并与页面上的其他代码相隔离，保证不同的部分不会混在一起，可使代码更加干净、整洁。其中，Shadow DOM 接口是关键所在，它可以将一个隐藏的、独立的 DOM 附加到一个元素上。

## 构建

### Webpack

[Webpack](https://webpack.js.org/)

> 本质上，webpack 是一个现代 JavaScript 应用程序的静态模块打包工具。当 webpack 处理应用程序时，它会在内部构建一个 依赖图(dependency graph)，此依赖图会映射项目所需的每个模块，并生成一个或多个 bundle。

### Rollup

[Rollup](https://rollupjs.org/)

> It uses the new standardized format for code modules included in the ES6 revision of JavaScript, instead of previous idiosyncratic solutions such as CommonJS and AMD.

简单来说：Webpack 用来打包应用，Rollup 用来打包库。

### Parcel

[Parcel](https://parceljs.org/)

> 极速零配置 Web 应用打包工具

### Bazel

[Bazel](https://bazel.build/)

Bazel 是 Google 基于内部的打包工具开源的多语言打包工具。

Angular 官方有使用 Bazel 打包的[教程](https://angular.io/guide/bazel)。

## 包管理

### npm

[npm](https://www.npmjs.com/) 是 Node.js 默认的包管理工具。

### yarn

[yarn](https://yarnpkg.com/) 是 Facebook 推出的 JavaScript 包管理工具。

值得注意的是，[yarn 2](https://dev.to/arcanis/introducing-yarn-2-4eh1)，带有 [PNP (plug ’n’ play)](https://yarnpkg.com/features/pnp/) 支持，但是不支持 React Native。

## 测试

1. Karma

2. Jasmine

3. Jest

4. Cypress

5. Enzyme

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

## 安全

### Content Security Policy

> 内容安全策略 (CSP) 是一个额外的安全层，用于检测并削弱某些特定类型的攻击，包括跨站脚本 (XSS) 和数据注入攻击等。无论是数据盗取、网站内容污染还是散发恶意软件，这些攻击都是主要的手段。

### OWASP

[OWASP](https://devops.phodal.com/maturity/owasp)

## 监控

前端监控一般指监控用户的使用情况和系统的运行状态，例如 PV、UV、平均访问时长、bug 等等。

## 框架

1. [Angular](https://angular.io)

   - [RxJS](https://rxjs-dev.firebaseapp.com/)

     > Reactive Extensions Library for JavaScript

   - [NGRX](https://ngrx.io/)

     > Reactive State for Angular

2. [React](https://reactjs.org/)

   - [Redux](https://redux.js.org/)

   - [MobX](https://mobx.js.org/)

3. [Vue](https://vuejs.org/)

   - [VueX](https://vuex.vuejs.org/)

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

1. [React Native](https://reactnative.dev/)

2. [Flutter](https://flutter.dev/)

3. [NativeScript](https://www.nativescript.org/)

4. [Ionic](https://ionicframework.com/)

## Desktop APP

1. [Electron](https://www.electronjs.org/)

   > 使用 JavaScript，HTML 和 CSS 构建跨平台的桌面应用程序

它使用 Chromium rendering engine 和 Node.js

## GraphQL

[GraphQL](https://graphql.org/)

> GraphQL 既是一种用于 API 的查询语言也是一个满足你数据查询的运行时。 GraphQL 对你的 API 中的数据提供了一套易于理解的完整描述，使得客户端能够准确地获得它需要的数据，而且没有任何冗余，也让 API 更容易地随着时间推移而演进，还能用于构建强大的开发者工具。

### Apollo

[Apollo](https://www.apollographql.com/)，是一个 GraphQL 的实现，包括 [Apollo Server](https://www.apollographql.com/docs/apollo-server/)、[Apollo Client](https://www.apollographql.com/docs/) 等多个框架/工具。

### Relay

[Relay](https://relay.dev/)，是 Facebook 推出的，针对 React 的 GraphQL clinet。

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
