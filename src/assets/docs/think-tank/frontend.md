# Frontend Roadmap

## 网络

### Internet 如何工作

### HTTP

### 浏览区如何工作

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

#### CSS Grid

### SASS/LESS

### PostCSS

### 响应式设计

### BEM

### CSS Framework

#### Bootstrap

#### Material UI

#### Tailwind CSS

### Styled Components

### CSS Module

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

### RAIL

### Lighthouse

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
