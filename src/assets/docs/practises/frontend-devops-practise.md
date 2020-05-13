# 前端 DevOps 实施

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

## Vue

### 单元测试（UT）

> [Vue CLI](https://cli.vuejs.org/zh/) 拥有开箱即用的通过 [Jest](https://github.com/facebook/jest) 或 [Mocha](https://mochajs.org/) 进行单元测试的内置选项。我们还有官方的 [Vue Test Utils](https://vue-test-utils.vuejs.org/zh/) 提供更多详细的指引和自定义设置。

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

# 前端监控

参考来源：《[前端如何搞监控总结篇](https://www.yuque.com/giscafer/felearn/wymb2u#d6Kig)》
