# 前端 DevOps 实施


# 流程和规范

## 构建流程

## 发布规范

使用：[https://github.com/conventional-changelog/standard-version](https://github.com/conventional-changelog/standard-version)

`standard-version` will then do the following:

1.  Retrieve the current version of your repository by looking at `packageFiles`, falling back to the last `git tag`.
2.  `bump` the version in `bumpFiles` based on your commits.
3.  Generates a `changelog` based on your commits (uses [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) under the hood).
4.  Creates a new `commit` including your `bumpFiles` and updated CHANGELOG.
5.  Creates a new `tag` with the new version number.

### CHANGELOG

https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli

```bash
$ npm install -g conventional-changelog-cli
$ cd my-project
$ conventional-changelog -p angular -i CHANGELOG.md -s
```

## 规范自动化

 - editorconfig，帮助开发人员定义和维护跨编辑器（或IDE）的统一的代码风格
 - prettier，一个强势武断的代码格式化工具。
 - husky，一个用于 Node.js 项目的快速安装 git hooks 的工具。
 - lint-staged，在 git staged 阶段，执行各种 Linter 的工具。
 - converntional-changelog，根据 Git 提交历史生成 CHANGELOG 的工具。
 - commitLint， 对提交信息进行 Lint 的工具。
 - styleLint，对 CSS 进行 Lint 的工具。
 - remark-lint，使用 Remark 对 Markdown 进行 Lint

### 基于 Husky + LintStaged

流程：

1. 待提交的代码 `git add` 添加到暂存区；
2. 执行 `git commit`；
3. 注册到 git 钩子函数的 husky `pre-commit`  脚本被调用，执行 `lint-staged`；
4. 修改的文件依次执行 lint-staged 定义的任务；
5. lint 失败，则需要等待修复；
6. lint 成功，而执行 commit
7. 同理，对于 `pre-push` 也是如此。

## 代码规范

 - Google JavaScript 规范：[Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) ， 中文翻译：[Google JavaScript 代码风格指南](https://juejin.im/post/5bd01d4a518825781e647e90)
 - Airbnb JavaScript 规范：[Airbnb JavaScript Style Guide() {](https://github.com/airbnb/javascript)
 - JavaScript Standard 规范：[JavaScript 代码规范，自带 linter & 代码自动修正](https://github.com/standard/standard/blob/master/docs/README-zhcn.md)

### 自定义 Lint

#### StyleLint 相关

相关的库：

 - 标准：[https://github.com/stylelint/stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard) ，包含可能报错的 rule，code format 的 css 标准
 - 推荐：[https://github.com/stylelint/stylelint-config-recommended](https://github.com/stylelint/stylelint-config-recommended) ， 继承于 recommend，包含了一些常见的css书写标准，启用其他规则以强制执行一些 CSS 样式指南中的通用样式约定，包括：The Idiomatic CSS Principles，Google 的 CSS 样式指南，Airbnb 的样式指南和 @mdo 的代码指南。

#### ESLint 示例

相关的库：

 - https://eslint.org/
 - https://github.com/ElemeFE/eslint-config-elemefe
 - https://github.com/AlloyTeam/eslint-config-alloy
 - https://github.com/vuejs/eslint-plugin-vue
 - https://github.com/yannickcr/eslint-plugin-react
 - https://github.com/typescript-eslint/typescript-eslint
 
 ### 整合 Sonar

 - https://github.com/SonarSource/eslint-plugin-sonarjs
 - https://github.com/racodond/sonar-css-plugin

 ### React 示例
 
 ```javascript
 module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'plugin:compat/recommended'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true, // preview.pro.ant.design only do not use in your production ; preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
    page: true,
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 0,
    'react/forbid-prop-types': 0,
    'react/jsx-one-expression-per-line': 0,
    'import/no-unresolved': [2, { ignore: ['^@/', '^umi/'] }],
    'import/no-extraneous-dependencies': [
      2,
      {
        optionalDependencies: true,
        devDependencies: ['**/tests/**.js', '/mock/**/**.js', '**/**.test.js'],
      },
    ],
    'import/no-cycle': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'linebreak-style': 0,
    'jsx-a11y/media-has-caption': 0,
    'react/no-array-index-key': 0,
  },
  settings: {
    polyfills: ['fetch', 'Promise', 'Number.isNaN', 'Object.assign', 'Object.entries', 'URL'],
  },
}
```

### Vue 示例

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    'plugin:import/recommended',
    process.env.CI ? '' : 'plugin:prettier/recommended',
    'prettier',
    'prettier/vue',
  ],
  rules: {
    eqeqeq: [
      'error',
      'always',
      {
        null: 'ignore',
      },
    ],
    'consistent-return': "error",
    'import/no-unresolved': 'off',
    'import/first': 'error',
    'import/order': [
      'error',
      {
        'newlines-between': 'always-and-inside-groups',
      },
    ],
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
  globals: {
    QC: false,
  },
  noInlineConfig: true,
}
```

### TypeScript 示例

```javascript
module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    // 'plugin:import/recommended',
    '@vue/typescript/recommended',
    // '@vue/prettier',
    // '@vue/prettier/@typescript-eslint',
  ],

  rules: {
    'eqeqeq': [
      'error',
      'always',
      {
        null: 'ignore',
      },
    ],
    // Best Practices
    // 'array-callback-return': 'error',
    // 'class-methods-use-this': 'error',
    'complexity': ['error', 50],
    'curly': 'error',
    'consistent-return': 'error',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-else-return': 'error',
    'no-extend-native': 'error',
    'no-implicit-coercion': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    'prefer-promise-reject-errors': 'error',
    // 'radix': 'error',
    'yoda': 'error',
    // End of 'Best Practices'

    // Stylistic
    'array-bracket-newline': ['error', 'consistent'],
    'array-bracket-spacing': 'error',
    'comma-dangle': ["error", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "always-multiline",
      "exports": "always-multiline",
      "functions": "never"
    }],
    'eol-last': 'error',
    // End of 'Stylistic'
    // 'import/no-unresolved': 'off',
    // 'import/first': 'error',
    // 'import/order': [
    //   'error',
    //   {
    //     'newlines-between': 'always-and-inside-groups',
    //   },
    // ],
    // 'import/newline-after-import': 'error',
    // 'import/no-duplicates': 'error',
    'vue/no-v-html': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'indent': 'off',
    '@typescript-eslint/indent': ['error', 2],
    'semi': 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    'quotes': 'off',
    '@typescript-eslint/quotes': ['error', 'single'],
  },

  parserOptions: {
    parser: '@typescript-eslint/parser',
  },

  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
    {
      files: ['vue.config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],

  globals: {
    QC: false,
  },

  noInlineConfig: true,
}
```
 

# 前端测试

## 通用 BDD

| x            | Cucumber                          | Gauge                              | Robot                          |
| ------------ | --------------------------------- | ---------------------------------- | ------------------------------ |
| 编程语言支持 | Java,Ruby,JavaScript 等 13 种语言 | Java, JavaScript, Ruby 等 6 种语言 | Python, Java, C                |
| 支持的系统   | 所有主流系统                      | 所有主流系统                       | 所有主流系统                   |
| 多语言支持   | UTF-8                             | UTF-8                              | 用户关键字及用例层面支持 UTF-8 |
| 中文社区支持 | 完善                              | 待完善                             | 完善                           |
| Report       | JS 不支持 HTML                    | 粗粒度                             | 细粒度                         |
| 失败时截图   | 不支持                            | 支持                               | 支持                           |

## Angular

自带

- Unit: Jasmine
- E2E: Protractor

## Vue

```bash
vue add @vue/unit-jest
```

### 单元测试（UT）

> [Vue CLI](https://cli.vuejs.org/zh/) 拥有开箱即用的通过 [Jest](https://github.com/facebook/jest) 或 [Mocha](https://mochajs.org/) 进行单元测试的内置选项。我们还有官方的 [Vue Test Utils](https://vue-test-utils.vuejs.org/zh/) 提供更多详细的指引和自定义设置。

## 快照测试

### DOM Snapshots

Jest: [https://jestjs.io/docs/zh-Hans/next/snapshot-testing](https://jestjs.io/docs/zh-Hans/next/snapshot-testing)

```javascript
describe('TodoItem snapshot test', () => {
  it('first render', () => {
    const wrapper = shallowMount(TodoItem, {
      propsData: {
        item: {
          finished: true,
          content: 'test TodoItem',
        },
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
```

示例结果：

```javascript
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`renders correctly 1`] = `
<a
  className="normal"
  href="http://www.facebook.com"
  onMouseEnter={[Function]}
  onMouseLeave={[Function]}
>
  Facebook
</a>
`;
```

### Visual Snapshots

- [Wraith](https://github.com/BBC-News/wraith) is a screenshot comparison tool, created by developers at BBC News.
- [Hermione](https://github.com/gemini-testing/hermione) is a utility for integration testing of web pages using WebdriverIO v4 and Mocha.
- [Differencify](https://github.com/NimaSoroush/differencify) is a library for visual regression testing via comparing your local changes with reference screenshots of your website.

更多工具：[关于前端测试](https://juejin.im/post/5daac11fe51d45252a3df4db#heading-39)

## E2E 测试

- [TestCafe](https://devexpress.github.io/testcafe/)
- [Cucumber.js](https://github.com/cucumber/cucumber-js)
- [Nightwatch](https://nightwatchjs.org)
- [Puppeteer](https://github.com/puppeteer/puppeteer)
- [Cypress](https://www.cypress.io/)

### TestCafe

```bash
npm install -g testcafe
```

```javascript
import { Selector } from 'testcafe';

fixture`Getting Started`.page`http://devexpress.github.io/testcafe/example`;

test('My first test', async (t) => {
  await t.typeText('#developer-name', 'John Smith').click('#submit-button');
});
```

### Nightwatch

Install -> [Installation](https://nightwatchjs.org/gettingstarted/installation/)

```javascript
module.exports = {
  'Demo test ecosia.org': function (browser) {
    browser
      .url('https://www.ecosia.org/')
      .waitForElementVisible('body')
      .assert.titleContains('Ecosia')
      .assert.visible('input[type=search]')
      .setValue('input[type=search]', 'nightwatch')
      .assert.visible('button[type=submit]')
      .click('button[type=submit]')
      .assert.containsText('.mainline-results', 'Nightwatch.js')
      .end();
  },
};
```

### Puppeteer

```bash
npm i puppeteer
```

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();
```

### Cucumber.js

```bash
yarn add -D chai@latest cucumber@latest

npm i -D chai@latest cucumber@latest
```

Steps

```gherkin
# features/simple_math.feature
Feature: Simple maths
  In order to do maths
  As a developer
  I want to increment variables

  Scenario: easy maths
    Given a variable set to 1
    When I increment the variable by 1
    Then the variable should contain 2

  Scenario Outline: much more complex stuff
    Given a variable set to <var>
    When I increment the variable by <increment>
    Then the variable should contain <result>

    Examples:
      | var | increment | result |
      | 100 |         5 |    105 |
      |  99 |      1234 |   1333 |
      |  12 |         5 |     17 |
```

```javascript
// features/support/steps.js
const { Given, When, Then } = require('cucumber');
const { expect } = require('chai');

Given('a variable set to {int}', function (number) {
  this.setTo(number);
});

When('I increment the variable by {int}', function (number) {
  this.incrementBy(number);
});

Then('the variable should contain {int}', function (number) {
  expect(this.variable).to.eql(number);
});
```

### Cypress

```bash
npm install cypress
```

示例：

```javascript
describe('My First Test', () => {
  it('clicking "type" navigates to a new url', () => {
    cy.visit('https://example.cypress.io');

    cy.contains('type').click();

    // Should be on a new URL which includes '/commands/actions'
    cy.url().should('include', '/commands/actions');
  });
});
```

# 前端架构拆分

方式：

- 微应用化
- 微前端：

## 微前端

> 微前端架构是一种类似于微服务的架构，它将微服务的理念应用于浏览器端，即将 Web 应用由单一的单体应用转变为多个小型前端应用聚合为一的应用。
> 由此带来的变化是，这些前端应用可以独立运行、独立开发、独立部署。以及，它们应该可以在共享组件的同时进行并行开发——这些组件可以通过 NPM 或者 Git Tag、Git Submodule 来管理。

详细：[微前端如何落地](https://www.infoq.cn/article/xm_AaiOTXmLpPgWvX9y9)

## 微应用化

> 微应用化与微前端架构相当的类似，它们在开发时都是独立应用，在构建时又可以按照需求单独加载。如果以微前端的单独开发、单独部署、运行时聚合的基本思想来看，微应用化就是微前端的一种实践。只是使用微应用化意味着：我们只能使用唯一的一种前端框架。如果从框架不限的角度来定义，怕是离微前端有些远，不过大团队怕是不会想同时支持多个前端框架。

详细见：[微前端：微应用化](https://www.phodal.com/blog/architecutre-in-word-design-micro-application-frontend-architecture/)

# 前端监控

参考来源：《[前端如何搞监控总结篇](https://www.yuque.com/giscafer/felearn/wymb2u#d6Kig)》
