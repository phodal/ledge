## 美团

来源：[美团外卖持续交付的前世今生](https://tech.meituan.com/2020/02/13/meituan-waimai-continuous-delivery.html)

```mindmap
 - CI 建设
  - 开发阶段准备 
    - 拉 Aimeituan 工程的开发分支
    - 修改开发分支版本号
    - Aimeituan 工程独立编译自动配置
  - PR 检测
    - 静态检测
    - 增量检测
     - SDK
     - 包大小
    - 单测
  - 开发阶段
    - 定时检测壳工程是否有更新，触发自动打包
    - 每日最新版本号提醒
  - 提测阶段
    - 冒烟提醒
    - 自动拉提测分支
    - 业务库检测是否有 PR 未合入
    - 提测打包、发提测邮件
  - 发版阶段
    - 分支合并
    - 外卖业务库合入 Aimeituan 提测分支
    - 全量提醒   
```
