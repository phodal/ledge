## Etsy

来源：《[Etsy 是如何做到每天 50 次以上部署的](https://www.infoq.cn/article/2014/04/etsy-deploy-50-times-a-day)》

> ps: 年代在 2014 年，参考价值比较低。

采取的工具和作法：

- 强制基于 IRC 的沟通
- 开发者虚拟机
- 持续集成
- 一键式部署
- 全面的应用和系统监控
- 免责怪的事后检查（post-mortem）： 对于开发和运营团队都如此
- 随叫随到

### 开发者虚拟机

- 通过 Chef 配置的 KVM
- 通过 Virtual Madness (一个可以实现整个过程自动化的 Web 应用) 提供虚拟机
- 包含线上运营中使用的 cookbooks

### 持续集成

[Try](https://github.com/etsy/TryLib)是一个工具，它允许开发人员在 Jenkins (在 Etsy 中使用的持续集成工具) 中测试他的代码变更，而不需要先提交到 trunk 中。

### 一键式部署

Deployinator（已不维护） 是由 Etsy 构建并使用的部署工具，提供一键式部署。

### 配置标志

> 配置标志，也被称为功能标志，是部署过程中的一个主要组成部分。通过其功能 API ，Etsy 能够做 A/B 测试，即完全启用或者禁用某一功能或一个给定功能的变体。

### 监控
