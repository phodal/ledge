# 测试

```quadrant
 - 测试四象限（Brain Marick）
     - 自动/手动
       - 用户故事测试
       - 端到端测试
       - 回归测试
       - ……
     - 手动
       - 探索式测试
       - 用户验收测试
       - 用户演示（showcase）
       - 用户培训
       - 安全测试（业务部分）
       - ……
     - 自动化
       - 单元测试
       - 组件测试
       - 集成测试
       - ……
     - 工具
       - 安全测试（技术部分）
       - 性能测试
       - 辅助功能测试
       - ……

config: {"left": "支持团队", "right": "评价产品", "bottom": "面向技术", "top": "面向业务"}
```

## 敏捷测试原则

—— 出处：《[ThoughtWorks 的敏捷测试](https://insights.thoughtworks.cn/thoughtworks-agile-testing/)》

1. 我们的目标在于和团队一起尽快地交付高质量软件。
2. 测试人员尽早参与软件早期阶段，与所有团队角色合作，通过实例化需求，确保对业务价值理解的一致性。
3. 测试人员关注生产环境状态，收集数据，指导和优化前期的分析、开发和测试。
4. 测试人员和开发人员同处一个产品项目团队，而不是独立的测试团队或部门。
5. 测试人员负责探索性测试，和开发人员结对，设计、实现和维护自动化测试。
6. 自动化测试在流水线中持续精准执行，快速发现每次代码提交对于已有功能的影响
7. 测试数据对于自动化测试是充分的，并能按需获得。
8. 测试活文档化，和代码一起，作为知识资产进行版本化管理。
9. 自动化测试需要有效的分层。
10. 预防缺陷，而不是关注缺陷的数量。

### 团队为质量负责

所有人应该对质量负责：

![淘宝内测线上 bug 示例](/assets/docs/images/ios-bug-taobao.jpg '淘宝内测 bug 示例')

从流程上来说：

- 缺乏单元测试。
- Code Review 没有有效实施。
- 没有结对编程。内部存在一定的结对编程
- 测试。测试缺乏对这种场景的测试情况
- 紧急修复。热修复不支持，只能通过新版本解决。

## 测试金字塔

```pyramid
 - 测试金字塔
   - 集成测试
   - 组件测试
   - 单元测试
```

- **单元测试**。
- **集成测试**。
- **系统测试**。

### 自动化测试框架选型金字塔

自动化测试框架组成：

- 测试框架。主要是用于管理测试用例，运行测试用例，断言，测试报告等， 比如 Cucumber，RF 等。
- 测试控制与逻辑。主要是用于粘连测试框架层和测试驱动层，使用各种编程技术比 如 PageObject， DesignPattern 等实现各种测试逻辑和断言等。
- 测试驱动。主要是用于驱动被测软件和设备 等，比如 Selenium， UiAutomator 等

```pyramid
 - 自动化测试框架选型金字塔
   - 富文档型
   - 多领域语言型
   - 单领域语言型
   - 函数型
```

### 生产测试

又被称之为黑盒测试，包含了：

- 黑盒测试
- 压力测试
- 金丝雀测试

## 测试策略

来源：《[一页纸测试策略](https://mp.weixin.qq.com/s/cEkI3Duyg-Jqk-TTFwKVqQ)》

> 质量内建，旨在软件交付过程的早期发现并预防缺陷，将任务移动到软件开发生命周期的左侧来提高质量，测试人员可以从需求分析阶段开始介入。

```process-table
| 需求分析 | 开发前 | 开发  | 开发完成 | 测试|  发布前|已发布 |
|--|--|--|--|--|--|--|
| 用户故事评审 | 特性启动 | 单元测试 | 用户故事验收 | 用户故事测试 | 回归测试 | 监控 |
| 估算 | 测试用例设计 | 组件测试 | 底层测试评审 | 探索式测试 | 发布指南 | 支持 |
| 方案设计 | 用户故事启动 | | 发布可测试版本 | 缺陷管理 | 用户验收测试 | 质量分析 |
| 迭代计划 | 测试计划 | | | 风险评估 | 发布版本确认 | |
| | | | | 集成测试 | | |
| | | | | 端到端测试 | | |
```

### 自从而下的测试

- 优先考虑用户体验
- 需要更强的开发技能
- 更多的测试覆盖率
- 实现和修复的时间长

### 自下而上的测试

- 平衡各类测试
- 更多的低级别测试

## 自动化测试

### 引入自动化测试的策略

- 先测新增代码
- 先测高价值代码
- 先测稳定代码
- 先做冒烟测试
- 为缺陷增加测试

### 自动化测试成本

#### 一次性投入

- 学习的成本
- 搭建环境的成本

#### 持续性投入

- 编写自动化测试用例的成本
- 维护自动化测试用例的成本

### 自动化测试原则

- 测试用例之间保持独立
- 一个测试用例只做一件事情
- 测试的结果必须稳定
- 单元测试用例必须足够的快

测试过慢

- E2E 测试定期执行
- 拆分测试策略
- 检视以往的测试。删除无用的
- 并行执行测试

### 三段式测试

- BDD 方式（Given-When-Then）
- 设置-操作-断言（Arrange-Act-Assert）

#### BDD

Given-When-Then 表达方式可以称之为一个公式一个模板，这种方式旨在指导程序员为“用户故事”编写测试用例变得方便。

- Given 一个上下文，指定测试预设。以 Given 开头的步骤，表示运作开始时系统所处的位置。
- When 进行一系列操作，即所要执行的操作。以 When 开头的步骤，表示用户在系统上所执行的操作。
- Then 得到一系列可观察的后果，即需要检测的断言。以 Then 开头的步骤，表示前面步骤的结果。

E2E 定义示例：

```javascript
Given('当我在网站的首页', function () {
  return this.driver.get('http://0.0.0.0:7272/');
});

When('输入用户名 {string}', function (text) {
  return this.driver.findElement(By.id('username_field')).sendKeys(text);
});

When('输入密码 {string}', function (text) {
  return this.driver.findElement(By.id('password_field')).sendKeys(text);
});

When('提交登录信息', function () {
  return this.driver.findElement(By.id('login_button')).click();
});

Then('用户应该跳转到欢迎页', function () {
  this.driver.getTitle().then(function (title) {
    expect(title).to.equal('Welcome Page');
  });
});

Then('页面应该返回 {string}', function (string) {
  this.driver.getTitle().then(function (title) {
    expect(title).to.equal(string);
  });
});
```

#### 设置-操作-断言

JUnit 示例：

```java
@Test
public void shouldReturnItemNameInUpperCase() {
    // Given
    Item mockedItem = new Item("it1", "Item 1", "This is item 1", 2000, true);
    when(itemRepository.findById("it1")).thenReturn(mockedItem);

    // When
    String result = itemService.getItemNameUpperCase("it1");

    // Then
    verify(itemRepository, times(1)).findById("it1");
    assertThat(result, is("ITEM 1"));
}
```

### 测试替身

> 有时候对被测系统(SUT)进行测试是很困难的，因为它依赖于其他无法在测试环境中使用的组件。这有可能是因为这些组件不可用，它们不会返回测试所需要的结果，或者执行它们会有不良副作用。在其他情况下，我们的测试策略要求对被测系统的内部行为有更多控制或更多可见性。 如果在编写测试时无法使用（或选择不使用）实际的依赖组件(DOC)，可以用测试替身来代替。测试替身不需要和真正的依赖组件有完全一样的的行为方式；他只需要提供和真正的组件同样的 API 即可，这样被测系统就会以为它是真正的组件！ ——Gerard Meszaros

| 类型         | 解释                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Dummy Object | 不包含实现的对象（Null 也是），在测试中需要传入，但是它没有被真正地使用，通常它们只是被用来填充参数列表。                                |
| Fake         | 有具体实现的，但是实现中做了些捷径，使它们不能应用与生产环境（举个典型的例子：内存数据库）                                               |
| Stub         | 状态验证。返回固定值的实现                                                                                                               |
| Spy          | 行为验证。类似于 Stub，但会记录被调用那些成员，以确定 SUT（System Under Test）与它的交互是否是正确的                                     |
| Mock         | 由 Mock 库动态创建的，能提供类似 Dummy、Stub、Spy 的功能。开发人员看不到 Mock object 的代码，但可以设置 Mock object 成员的行为及返回值。 |

Mock 和 Stub 就是常见的两种方式：

- Stub 是一种状态确认，它用简单的行为来替换复杂的行为
- Mock 是一种行为确认，它用于模拟其行为

示例见：《[测试替身](https://growth.phodal.com/#%E6%B5%8B%E8%AF%95%E6%9B%BF%E8%BA%AB)》

### 简单规则

测试自动化应该遵循的简单规则

| 规则                             | 理由                                                                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 单一职责                         | 易于调试：业务规则变更时易于修改                                                                                                               |
| 不要重复自己                     | 能够只改一个地方                                                                                                                               |
| 使用领域特定语言                 | 使测试人员相关的沟通更加容易                                                                                                                   |
| 抽象测试                         | 使测试更加易读                                                                                                                                 |
| 设置和清除（setup & teardown     | 可以重复执行测试                                                                                                                               |
| 避免访问数据库（尽可能）         | 访问数据库会使测试变慢（注意，有些情况还是需要访问数据库的）                                                                                   |
| 测试必须一直保持绿色             | 保证测试的信心：活文档                                                                                                                         |
| 应用公共测试标准（包括命名约定） | 可以共享代码或者测试的所有权，对测试达成共识                                                                                                   |
| 将测试（什么）和（如何）执行分隔 | 把什么（和为什么）抽象出来可以让各层分别完善；为使人读懂规则说明（测试），你可以增加更多示例，或者在不会影响精力规则的前提下更改底层自动化实现 |

## FIRST 原则

- Fast（快速）。测试的运行速度将直接决定自动化的反馈速度，速度越快，越能提早发现问题。
- Isolated（独立）。每一个测试用例需要保证完全独立运行，互不依赖，这样才能保证测试运行不被干扰，从而能够进行并行运行甚至分布式运行，使得测试运行更加 Fast。
- Repeatable（可重复）。每一个测试用例在运行条件不变的情况下，不论重复运行多少次，运行结果必须完全一致（幂等）。
- Self-Validating（自验）。测试用例必须能够自动告知（断言）运行结果，而不依赖人工进行判断。
- Timely（及时）。编写自动化测试是一种好的习惯，为了保证能够及时得到反馈，必须及时编写自动化测试而不拖延，一旦拖延，就很难补回来。为了能够将这件事情做到极致，那么就要做到“测试先行（Test First）”，直至“测试驱动开发（Test-Driven Development）”

## Right-BICEP 原则

- Right（是否符合设计要求？）。可以通过自动化测试验证待测系统（SUT）是否符合设计要求。
- Boundary（是否检查了全部边界条件？）。对于待测系统（SUT），需要通过自动化测试确保必要的边界条件都得到了测试。
- Inverse（是否需要进行反向检查？）。对于一些待测系统（SUT），可能需要测试其反向逻辑。
- Cross-Checking（是否需要进行交叉检查？）。我们可以通过“另一种方法”，对待测系统（SUT）进行测试。
- Error（是否需要检查异常情况？）。测试可以用来发现异常，也可以用来验证异常
- Performance（是否需要检查性能？）。虽然我们不优先考虑性能问题，但是一旦发生性能问题，自动化测试就能够成为我们得到及时反馈或对问题进行定位的有效手段。

## 测试驱动开发

依据 J.Timothy King 所总结的《[测试先行的 12 个好处](http://sd.jtimothyking.com/2006/07/11/twelve-benefits-of-writing-unit-tests-first/)》：

- 测试可证明你的代码是可以解决问题的
- 一面写单元测试，一面写实现代码，这样感觉更有兴趣
- 单元测试也可以用于演示代码
- 会让你在写代码之前做好计划
- 它降低了 Bug 修复的成本
- 可以得到一个底层模块的回归测试工具
- 可以在不改变现有功能的基础上继续改进你的设计
- 可以用于展示开发的进度
- 它真实的为程序员消除了工作上的很多障碍
- 单元测试也可以让你更好的设计
- 单元测试比代码审查的效果还要好
- 它比直接写代码的效率更高

详见：《[测试驱动开发](https://growth.phodal.com/#%E6%B5%8B%E8%AF%95%E9%A9%B1%E5%8A%A8%E5%BC%80%E5%8F%91)》

## 测试代码坏味道

详见：《[测试代码的坏味道](https://www.phodal.com/blog/test-bad-smell/)》

> 测试代码坏味道，是指单元测试代码中的不良编程实践（例如，测试用例的组织方式，实现方式以及彼此之间的交互方式），它们表明测试源代码中潜在的设计问题。

常见的测试坏味道：

- 空的测试。测试是生成的，但是没有内容。
- 忽略的测试。即测试被 Ignore
- 没有断言的测试。为了测试覆盖率而出现的测试
- 多余的 Println。调试时留下的讯息。
- 多重断言。每个测试函数只应该测试一个概念。

然后，再来个 Examples。

## API 测试

### Mock 测试

#### Mock Server

相关的工具：

- Mountebank，是第一个开源、跨平台、多协议的服务虚拟化工具。
- WireMock，是一个灵活的 API 模拟工具，可进行快速，强大和全面的测试。
- Stubby4j，是一个 HTTP stub 服务器，用于测试应用程序与 Web 服务（REST 等）的交互以及用于轻松测试的外部系统 stub。
- VCR/Betamax，可以记录和重放应用程序的网络流量。
- Hoverfly，是一个轻量的 API 服务模拟工具（有时候也被称作服务虚拟化工具）。除了回放和记录，Hoverfly 还支持监视、合成、修改、差异等模式。

### 契约测试

前提条件：消费者和生产者**都同意**需要一个约束彼此交互的契约。当只有消费者愿意采用契约测试时，是很难进行契约测试的。

#### 消费者驱动的契约测试

> 消费者驱动契约测试（Consumer-Driven Contracts Testing）背后的理念是定义每个服务消费者与提供者之间的契约，然后根据该契约对消费者和提供者进行独立测试，以验证他们是否符合契约约定的事项。

- [Moco](https://github.com/dreamhead/moco) + [Moscow](https://github.com/macdao/moscow)
- [Spring Cloud Contract](https://spring.io/projects/spring-cloud-contract)
- [Pact](https://docs.pact.io)

Resources: [Qixi's presentations](https://github.com/macdao/presentations)

## 测试覆盖率

### 测试覆盖率曲线

```echarts
{
    "xAxis": {
        "type": "category"
    },
    "yAxis": {
        "type": "value"
    },
    "series": [{
        "data": [0, 1, 5, 10, 9, 14, 15, 30, 40, 45, 54, 60, 58, 65, 60, 70, 75, 78, 76, 80, 82, 83, 84, 85, 86, 87, 92, 95, 98, 97, 99, 98, 99, 98, 97, 99],
        "type": "line",
        "smooth": true
    }]
}
```


# 单元测试

## 流水线集成 

Ant + JUnit + Jacoco 示例：[model-ant-project](https://github.com/jenkinsci/model-ant-project)

# 测试工具

## 兼容性测试

### UI Recorder

UI Recorder是一款零成本的整体自动化测试解决方案，一次自测等于多次测试，测一个浏览器等于测多个浏览器！

*   支持所有用户行为: 键盘事件, 鼠标事件, alert, 文件上传, 拖放, svg, shadow dom
*   支持无线native app录制, 基于macaca实现: [https://macacajs.com/](https://macacajs.com/)
*   无干扰录制: 和正常测试无任何区别，无需任何交互
*   录制用例存储在本地
*   支持丰富的断言类型: val,text,displayed,enabled,selected,attr,css,url,title,cookie,localStorage,sessionStorage
*   支持数据mock: fake.js
*   支持公共测试用例: 允许用例中动态调用另外一个
*   支持并发测试
*   支持多国语言: 英文, 简体中文, 繁体中文
*   支持HTML报告和JUnit报告
*   全系统支持: windows, mac, linux
*   支持多运行时测试, 例如：开发测试、预发测试
*   基于Nodejs的测试用例: jWebDriver

简单来说就是把你每次自测的流程录制下来，而且是全可视化的，然后在各种浏览器上自动回放。

### F2etest

[F2etest](https://github.com/alibaba/f2etest) 是一个面向前端、测试、产品等岗位的多浏览器兼容性测试整体解决方案。

### 图片比对

[Resemble.js](https://github.com/rsmbl/Resemble.js)

## 数据捕捉

### mountebank

[mountebank](https://github.com/bbyars/mountebank)




### Polly.JS

> Polly.JS 是一个独立于框架且与框架无关的J avaScript 库，可用于记录，重放和中断HTTP交互。 通过在Node和浏览器上利用多个请求 API，Polly.JS 能够在几乎没有配置的情况下模拟请求和响应，同时使您能够通过简单，强大且直观的 API 来完全控制每个请求。

[Polly.JS](https://github.com/Netflix/pollyjs)



### TCPCopy
 
[TCPCopy](https://github.com/session-replay-tools/tcpcopy)
  
> TCPCopy是用来做TCP重放的，常用的场景是把线上流量复制到测试环境，用来排查线下不容易重现的问题，或者对测试环境做压力测试。

![TCPCopy](https://camo.githubusercontent.com/df0c7d58574a4d492b45ae450bbe6f34101d66a4/68747470733a2f2f7261772e6769746875622e636f6d2f77616e6762696e3537392f617578696c696172792f6d61737465722f696d616765732f746370636f70792e474946)

功能：

 - 分布式压力测试工具，利用在线数据，可以测试系统能够承受的压力大小（远比ab压力测试工具真实地多）,也可以提前发现一些bug
 - 普通上线测试，可以发现新系统是否稳定，提前发现上线过程中会出现的诸多问题，让开发者有信心上线
 - 对比试验，同样请求，针对不同或不同版本程序，可以做性能对比等试验
 - 流量放大功能，可以利用多种手段构造无限在线压力，满足中小网站压力测试要求
 - 利用TCPCopy转发传统压力测试工具发出的请求，可以增加网络延迟，使其压力测试更加真实
 - 热备份

3.组成部分

  1. TCPCopy Server(tcpcopy)：部署在 测试服务器 ，用于接收复制的线上请求，github地址：https://github.com/session-replay-tools/tcpburn

  2. TCPCopy Client(intercept)：部署在 线上服务器 ，用于捕获线上请求，通过修改TCP/IP数据包，发送到TCPCopy Server进行稳定性测试，截获响应包，并传递响应包头信息给TCPCopy client,以完成TCP交互。Github地址：https://github.com/session-replay-tools/intercept

### GoReplay

[GoReply](https://github.com/buger/goreplay)

> goreplay是一款从生产环境copy流量到测试环境的工具，且不会影响生产环境的业务响应，又能很简单的达到复用http请求来做稳定性测试的目的。

![GoReplay](https://camo.githubusercontent.com/1c65a684aeb1d16343d59c3ab6d3f9d41c77c36f/68747470733a2f2f692e696d6775722e636f6d2f494e327866446d2e706e67)

GoReplay 工作方式：listener server 捕获流量，并将其发送至 replay server 或者保存至文件。replay server 会将流量转移至配置的地址。

最简单的使用模式是：listener server捕获流量，并将其发送至kafka，然后解析kafka的消息并存入mysql,处理起来还是比较方便的.

### Proxy

[go-tcp-proxy](https://github.com/jpillora/go-tcp-proxy) A small TCP proxy written in Go. This project was intended for debugging text-based protocols. The next version will address binary protocols.

#### 自制


Go：[https://github.com/jpillora/go-tcp-proxy](https://github.com/jpillora/go-tcp-proxy), A small TCP proxy written in Go

对应的客户端示例：Java + Spring: [SpringBoot TCP client/server Integration Example](https://github.com/lapozzo/springboot-tpc-integration-example)


## 自动化测试

### Taurus

> Taurus是一个用于测试自动化的开源框架。 这个免费工具运行来自其他开源工具的脚本的性能测试，包括JMeter，Gatling，Locust和Selenium。 通过扩展他们的能力并掩盖复杂性，Taurus提供了一种创建，运行和分析负载测试的简单方法。 Taurus使用YAML或JSON，它们更容易管理。

官网：https://gettaurus.org/

### BlazeMeter

```bash
┌───── 1 73 users, 2 ~73 active ─────┐┌──────────────────── Latest Interval Stats at 18:03:47 ────────────────────┐ ┌─┬─┐
│                                 ..o││         Average Times:              Percentiles:          Response Codes: │   │
│                               .o..o││          Elapsed: 4.566               0.0%: 3.224       200:  100.00% (34)│   │   ┌───┐ ┬   ┬ ┬──┐ ┬   ┬ ┌───┐
│                           o.oo.o..o││          Connect: 0.170              50.0%: 5.068        All: 100.00% (34)│   │   ┌───┤ │   │ │    │   │ └───┐
│                       o.o.o.oo.oo.o││          Latency: 1.480              90.0%: 5.248                         │   ┴   └───┴ └───┴ ┴    └───┴ └───┘
│                    oo.o.o.o.oo.oooo││                                      95.0%: 6.088                         │     \ v1.14.2 by BlazeMeter.com \
│                 oo.oo.o.o.o.oo.oooo││                                      99.0%: 6.796                         │
│             ooo.oo.oo.o.o.o.ooooooo││                                      99.9%: 6.796                         │JMeter: quick-test
│         .oooooooooooo.o.ooooooooooo││                                     100.0%: 6.796                         │                 15 %
│      .ooooooooooooooooooooooooooooo││                                                                           │Elapsed: 00:00:54        ETA: 00:05:05
│  ..oooooooooooooooooooooooooooooooo││                                                                           │
│oooooooooooooooooooooooooooooooooooo││                                                                           │ local
└────────────────────────────────────┘└───────────────────────────────────────────────────────────────────────────┘   disk-write: 8,334,038
┌──────── 1 34 hits, 2 0 fail ───────┐┌──────────────────────── Cumulative Stats 00:00:36 ────────────────────────┐  engine-loop: 0.154
│                       . . .        ││         Average Times:              Percentiles:          Response Codes: │    disk-read: 4,063,098
│                       . . .    .  .││          Elapsed: 1.774               0.0%: 0.240      200:  100.00% (745)│     conn-all: 147
│                 ..  . . . .    .  .││          Connect: 0.074              50.0%: 1.553       All: 100.00% (745)│   bytes-recv: 1,454,890
│       .   .     .. .. . . . .  .  .││          Latency: 0.576              90.0%: 3.000                         │   bytes-sent: 504,321
│    .  . ....... .. .. . . . .  .  .││                                      95.0%: 4.204                         │          cpu: 9.400
│    . .......... .. .. . . . .. .  .││                                      99.0%: 5.388                         │   disk-space: 86.600
│  ................. .. . . . .. .. .││                                      99.9%: 6.796                         │          mem: 64.200
│ ....................... . . .. .. .││                                     100.0%: 6.796                         │
│ ...................................││                                                                           │
│ ...................................││                                                                           │
│....................................││                                                                           │
└────────────────────────────────────┘│                                                                           │
┌─ 1 4.566 avg time (2 lat, 3 conn) ─┐│ Labels                  Hits   Failures   Avg Time                        │──────────────────────────────────────
│                                  . ││https://www.google.com/    745      0.00%      1.774                       │18:03:29 INFO: Changed data analysis
│                                  ..││                                                                           │delay to 3s
│                               .  ..││ Errors:                                                                   │18:03:37 INFO: Changed data analysis
│                               . ...││No failures occured                                                        │delay to 4s
│                            ........││                                                                           │18:03:47 INFO: Changed data analysis
│                          ..........││                                                                           │delay to 5s
│                        .......o....││                                                                           │18:03:51 INFO: Changed data analysis
│                 ..............o..oo││                                                                           │delay to 6s
│          . .................oo@oooo││                                                                           │18:03:57 INFO: Changed data analysis
│.   ...............oooooooooooo@oo@o││                                                                           │delay to 8s
│@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@││                                                                           │18:04:01 INFO: Changed data analysis
└────────────────────────────────────┘└───────────────────────────────────────────────────────────────────────────┘delay to 9s
```


# 测试策略

1. 识别梳理
2. 改进
3. 定义
4. 规划

## 定义

 - UAT - 用户验收测试。类产品环境验证，主要用于向业务收集系统反馈。
 - 探索式测试 。作为脚本测试的补充环节，利用测试人员的自由度与主动性发现深层次缺陷，发生于系统测试和系统集成测试之间。
 - UI 端到端自动化测试（SIT）。以业务为视角的自动化测试防护网，包含完整用户旅途（User Journey），关注主干业务流程。
 - SIT - 系统集成测试。基于真实用户场景，主要关注测试子系统间的数据流转和集成问题。
 - 系统测试。测试提前，更早的时间点发现问题减少修复成本。子系统功能完成后，基于挡板技术测试子系统逻辑。
 - API 测试。保证 API 级别功能，覆盖高优先级特殊情况下反案例，选取手动 API 测试案例中全部正案例与部分特殊情况反案例添加。
 - 单元测试。保证方法级别的功能正反案例覆盖全面，保留现有单元测试能力与度量标准（覆盖率 80%）。

## 模型

### V 模型

V 模型可以分为三部分，分析阶段、编码阶段、测试阶段。

 - 分析阶段：用户需求、需求分析、概要分析、详细分析。
 - 测试阶段：验收测试、系统测试、集成测试、单元测试。

V 模型开创性地提出 测试 的重要性，并且明确表明在不同的项目阶段，应完成对应级别的测试活动，强调每个测试活动与之对应分析活动的关联性，用户需求与验收测试关联、需求分析与系统测试关联、概要分析与集成测试关联、详细分析与单元测试关联。

### 双 V 模型

> 双V模型也叫W模型，但是W并不能体现出开发与测试的分离与并行，甚至容易让人产生两个V模型串行执行的误会，所以笔者更倾向于 双V模型 。

### X 模型

> X模型是对V模型的改进，X模型提出针对单独的程序片段进行相互分离的编码和测试。此后通过频繁的交接，通过集成最终合成为可执行的程序。

### H 模型

> H模型将软件测试活动完全独立出来，始终贯穿于产品生命周期，与其他流程并发进行。当某个测试点准备就绪，就可以从测试准备阶段进行到测试执行阶段。软件测试可以尽早的进行，并且可以根据被测物的不同而分层次进行。

# 测试数据管理

## 测试数据生成

### 常见生成方法

1. 基于 GUI 操作生成测试数据
2. 通过 API 调用生成测试数据
3. 通过数据库操作生成测试数据
4. 给合运用 API 和数据库的方式生成测试数据

### 测试数据生成时机

1. One-the-fly，实时创建测试数据。
2. Out-of-box，即开箱即用，在准备测试环境的时间，就准备好测试数据。



## 测试数据类型

### 测试数据管理

来源：[Test Data Generation: What is, How to, Example, Tools](https://www.guru99.com/software-testing-test-data.html)

#### 用于安全测试的测试数据

安全测试是确定信息系统是否保护数据免受恶意攻击的过程。为了完全测试软件安全性而需要设计的数据集必须涵盖以下主题：

 - 机密性：客户提供的所有信息均被严格保密，不会与任何外部各方共享。作为简短示例，如果应用程序使用 SSL，则可以设计一组测试数据，以验证加密是否正确完成。
 - 完整性：确定系统提供的信息正确。要设计合适的测试数据，您可以先深入了解设计，代码，数据库和文件结构。
 - 身份验证：表示建立用户身份的过程。可以将测试数据设计为用户名和密码的不同组合，其目的是检查只有经授权的人员才能访问软件系统。
 - 授权：告知特定用户的权限。测试数据可能包含用户，角色和操作的不同组合，以便仅检查具有足够特权的用户能够执行特定操作。

#### 黑盒测试的测试数据

在黑匣子测试中，测试人员看不到该代码。您的功能测试用例可以具有符合以下条件的测试数据：

 - 无数据：未提交数据时检查系统响应
 - 有效数据：提交有效测试数据后检查系统响应
 - 无效的数据：提交无效测试数据时检查系统响应
 - 非法数据格式：测试数据格式无效时检查系统响应
 - 边界条件数据集：满足边界值条件的测试数据
 - 等效分区数据集：验证您的等效分区的测试数据。
 - 决策表数据集：使决策表测试策略合格的测试数据
 - 状态转换测试数据集：符合您的状态转换测试策略的测试数据
 - 用例测试数据：与您的用例同步的测试数据。

## 测试数据管理实践

### Google

[Google 测试数据管理](https://cloud.google.com/solutions/devops/devops-tech-test-data-management) 实践：

 - **支持单元测试**。单元测试应该彼此独立，并且除了要测试的代码外，系统其他任何部分都应独立。单元测试不应依赖于外部数据。根据测试自动化金字塔的定义，单元测试应构成您的大部分测试。与较高级别的测试相比，针对设计良好的代码库运行良好的单元测试要容易分类和维护便宜。增加单元测试的覆盖范围可以帮助最大程度地减少对使用外部数据的更高级别测试的依赖。
 - **尽量减少对测试数据的依赖**。测试数据需要仔细和持续的维护。随着 API 和接口的发展，您必须更新或重新创建相关的测试数据。此过程表示可能会对团队速度产生负面影响的成本。因此，优良作法是尽量减少运行自动化测试所需的测试数据量。
 - **隔离测试数据**。在定义明确的环境中运行测试，该环境具有可控输入和可与实际输出进行比较的预期输出。确保特定测试消耗的数据与该测试明确关联，并且未被其他测试或流程修改。在可能的情况下，测试应使用应用程序的 API 在安装过程中自行创建必要的状态。隔离测试数据也是并行运行测试的先决条件。
 - **最大限度地减少对数据库中存储的测试数据的依赖**。出于以下原因，维护存储在数据库中的测试数据可能会特别具有挑战性：
   - 测试隔离性差。数据库持久地存储数据；除非明确重设，否则对数据的任何更改将在测试中保留。不太可靠的测试输入将使测试隔离更加困难，并可能阻止并行化。
   - 性能影响。执行速度是自动化测试的关键要求。与数据库交互通常比与本地存储的数据交互慢且麻烦。在适当的地方使用内存数据库。
 - **使测试数据随时可用**。针对完整生产数据库的副本运行测试会带来风险。刷新数据可能既困难又挑战。结果，数据可能会过时。生产数据还可以包含敏感信息。相反，请确定测试所需的数据的相关部分。定期导出这些部分并使其易于测试。

## 测试数据生成

### 测试数据抓取

#### [GoReplay](https://github.com/buger/goreplay) 

> GoReplay is an open-source network monitoring tool which can record your live traffic, and use it for shadowing, load testing, monitoring and detailed analysis.

```
# Run on servers where you want to catch traffic. You can run it on every `web` machine.
sudo gor --input-raw :80 --output-http http://staging.com
```

#### [Flowgger](https://github.com/awslabs/flowgger)

> Flowgger is a fast, simple and lightweight data collector written in Rust.

Flowgger supports common input types: stdin, UDP, TCP, TLS and Redis, as well as multiple input formats: JSON (GELF), LTSV, Cap'n Proto and RFC5424. Normalized messages can be sent to Kafka, Graylog, to downstream Flowgger servers, or to other log collectors for further processing.

### 测试数据生成工具

#### [Faker](https://github.com/joke2k/faker)

> Faker is a Python package that generates fake data for you. Whether you need to bootstrap your database, create good-looking XML documents, fill-in your persistence to stress test it, or anonymize data taken from a production service, Faker is for you.

```python
from faker import Faker
fake = Faker()

fake.name()
# 'Lucy Cechtelar'

fake.address()
# '426 Jordy Lodge
#  Cartwrightshire, SC 88120-6700'

fake.text()
# 'Sint velit eveniet. Rerum atque repellat voluptatem quia rerum. Numquam excepturi
#  beatae sint laudantium consequatur. Magni occaecati itaque sint et sit tempore. Nesciunt
#  amet quidem. Iusto deleniti cum autem ad quia aperiam.
```

#### Datafaker

[Datafaker](https://github.com/gangly/datafaker) 是一个大批量测试数据和流测试数据生成工具，兼容 Python2.7 和 Python3.4+。

 - 参数解析器。解析用户从终端命令行输入的命令。
 - 元数据解析器。用户可以指定元数据来自本地文件或者远程数据库表。解析器获取到文件内容后按照规则将文本内容解析成表字段元数据和数据构造规则。
 - 数据构造引擎。构造引擎根据元数据解析器产生的数据构造规则，模拟产生不同类型的数据。数据路由。根据不同的数据输出类型，分成批量数据和流数据生成。
 - 流数据可指定产生频率。然后将数据转换成用户指定的格式输出到不同数据源中。
 - 数据源适配器。适配不同数据源，将数据导入到数据源中。



# 附录 1：移动应用的自动化测试

## BDD 方式

文章来源：《[【架构拾集】移动应用的自动化测试（BDD 方式）](https://www.phodal.com/blog/phodal-architecture-101-mobile-appllication-test-architecture/)》

### 技术愿景

作为一个团队的技术负责人，我希望：拥有一个移动应用测试架构，它能快速让测试人员快速上手——阅读、编写测试用例。与此同时，我希望这些测试用例是能让非技术人员阅读，诸如业务分析人员，并且符合真实的用户使用场景。

### 架构设计

当我们谈到业务分析人员也能编写的测试，我们说的只有 BDD（Behavior Driven Development，行为驱动开发）。它是一种敏捷软件开发的技术，它鼓励软件项目中的开发者、QA（测试人员）和非技术人员或商业参与者之间的协作。

BDD 在这一种上相当的迷人——能让非技术人员编写测试。而其核心的部分在于：创建了一个环境隔离的 DSL，仿人类语言的 DSL。咳咳，这个 DSL 实现起来，可不轻松。关注顶层 DSL 的同时，开发人员还要努力实现好底层的实现。举个简单的例子，如下是之前在 BDD 一文中的 DSL 示例，这是顶层的设计：

```gherkin
功能: 失败的登录

  场景大纲: 失败的登录
    假设 当我在网站的首页
```

对应的，开发人员需要编写实现：

```javascript
Given('当我在网站的首页', function () {
  return this.driver.get('http://0.0.0.0:7272/');
});
```

从上述的代码中，一眼就可以看出复杂的地方，实现一个领域特定（业务特定）的 DSL 语言。

我们要完成的 DSL 实现，上层是提供一个 DSL，下层则是对接 driver 的 Agent 层。在 Web 领域里，这个 driver 的 Agent 层负责对接不同的浏览器，诸如 Selenium，driver 则视不同的浏览器而有所不同，如 ChromeDriver、FirefoxDriver、PhantomJSDriver 等等。Selenium 这样的测试框架，除了通过 driver 直接操作了浏览器，还提供了不同语言的编程接口。

相似的，在 APP 领域也有这样的方案，它要通常这个 agent 来连接物理设备，并提供一系列的编程接口。

### 架构设计方案

对整个架构有了一个基本的认识之后，让我们继续往下移动，来重新发掘一下：我们究竟需要哪些基本元素？

- BDD 测试框架，为开发人员提供可创建 DSL 的接口。
- 移动设备的测试编程接口，提供一个操作移动应用的接口。
- 连接移动设备的操作库，即移动端的 WebDriver。
- 用于编写测试时的 UI 检查工具。

从这一点上来看，它与 Web 应用的 BDD 架构差不多。为此，我们需要准备如下的一些框架：

- Robot Framework，一个支持 BDD 的、基于 Python 编写的功能自动化测试软件框架。
- Appium，是一个开源测试自动化框架，用于原生，混合和移动 Web 应用程序。它使用 WebDriver 协议来驱动 iOS、Android 和 Windows 应用程序。
- XCUITest Driver，基于 Apple 官方的界面自动化测试 XCUITest 封装的测试接口，可以直接执行 iOS 的自动化测试。
- UiAutomator2 Driver，则是 Google 官方提供的用于 Android 系统的测试接口，可以直接执行 Android 的自动化测试。
- Appium Inspector，用于查找 iOS/Android 上的元素
- UiAutomator Viewer，由 Android SDK 自带的元素查找工具。

由于我们计划的顶层是由 DSL 来实现，而对应的 BDD 层实现是由 Robot Framework 来完成的。Robot Framework 使用的是 Python 语言，我们就需要找到对应的 Python 主要依赖有：

- robotframework，即 Robot Framework 本身
- robotframework-appiumlibrary，用于为 Robot Framework 提供 Appium 相应的接口封装
- robotframework-ride，用于 Robot Framework 的测试数据编辑器

有了这些主要的库，我们就可以编写我们的 DSL？不，我们还需要配置好，对应的移动端 Driver。

**Android Driver 依赖**

比较简单，通过 `appium-uiautomator2-driver` 库就拥有了 driver。

**iOS Driver 依赖**

为了实现对 iOS 设备的自动化测试，需要安装 XCUITest，为此我们需要下面的这一系列工具：

- `libimobiledevice`，是一个跨平台的用于与 iOS 设备通讯的协议库，它可以让 Windows、macOS、GNU/Linux 系统连接 iPhone/iPod Touch 等 iOS 设备。
- `carthage` 是一个简单的、去中心化的依赖管理工具。
- `ios-deploy` 是一个使用命令行安装 iOS 应用程序到连接设备的工具
- `xcodebuild`，是苹果发布自动构建的工具。
- `xcpretty`，用于对 xcodebuild 的输出进行格式化，包含输出 report 功能。

看，有了这一系列的知识，我们几乎知道怎么做搭建移动应用的自动化测试。
