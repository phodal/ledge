# fir.im  应用内测分发平台

[fir.im](https://zeroqr.com/ndf8) 是一个为移动开发者服务，针对应用开发内测阶段，提供应用托管分发服务的平台。

应用测试分发，只需两步！

![图1](https://zeroqr.com/img1)

无论是大神，还是刚入门的小白，都可以找到合适的使用方法。

## 初级玩法 - 网页上传

第一步：登录网站，拖拽安装包到黄色区域上传应用

![图2](https://zeroqr.com/img2)

第二步：点击“预览”，获取应用下载的短地址及访问二维码

![图3](https://zeroqr.com/img3)


## 进阶玩法 - API 检测更新 + CLI 脚本上传

### API 检测更新

fir.im 提供应用信息的查询及安装接口，用户可通过需要实现的逻辑进行判断，实现提示更新、强制更新等更新引导。

### CLI 脚本上传

不登陆网站，玩转命令行一样可以高效的测试分发应用，当前 CLI 上传脚本已经在 GitHub 开源了，[查看使用方法](https://github.com/FIRHQ/fir-cli/blob/master/README.md)


## 高级玩法 - Jenkins/Fastlane 插件打包上传自动化

### Jenkins 自动化

使用 Jenkins 进行持续集成时，只需要在 Jenkins Web 中调用 fir-cli 脚本即可。


### Fastlane 插件自动化

调用 Fastlane 插件，轻松自动实现从编译、测试到打包、上传、通知测试成员整个工作流。

![图4](https://zeroqr.com/img4)



