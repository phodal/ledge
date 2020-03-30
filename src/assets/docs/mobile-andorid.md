# Mobile Android DevOps

## 移动中台

### 单体应用

### 模块化应用

### 容器化应用

## 持续集成

独立编译

联合打包

## 测试

![测试金字塔，显示了应用的测试套件应包含的三类测试](https://developer.android.google.cn/images/training/testing/pyramid_2x.png "测试金字塔")

沿着金字塔逐级向上，从小型测试到大型测试，各类测试的保真度逐级提高，但维护和调试工作所需的执行时间和工作量也逐级增加。因此，您编写的单元测试应多于集成测试，集成测试应多于端到端测试。虽然各类测试的比例可能会因应用的用例不同而异，但我们通常建议各类测试所占比例如下：**小型测试占70%，中型测试占20%，大型测试占10%**。

### 单元测试（小型测试）

本地单元测试

插桩单元测试

### 集成测试（中型测试）
> 四大组件（Activity、Service、BroadcastReceiver、ContentProvider）测试

### UI测试（大型测试）

- Espresso
- UIAutomator

## 发布

热更新与热修复

灰度发布

## APM
