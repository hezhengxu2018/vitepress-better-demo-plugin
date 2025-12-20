# 更新日志



## [0.3.1](/compare/v0.3.0...v0.3.1) (2025-12-20)


### Bug Fixes

* **package.json:** 修复导出路径异常 d52a889

# [0.3.0](/compare/v0.2.0...v0.3.0) (2025-12-20)


### Bug Fixes

* **ssg:** 为实现兼容给Vitepress2的写法，移除了对ssg的支持 310e265
* **type:** 为主题组件添加类型声明文件 876f7a3


### Features

* 使用兼容Vitepress2.x的写法 c65a7e1

# [0.2.0](/compare/v0.1.0...v0.2.0) (2025-12-14)


### Bug Fixes

* 调整组件入参，使组件可以继承额外的入参 5f36518


### Features

* **plugin:** 使用通用的属性解析方案 20d2b41

# [0.1.0](/compare/v0.0.1...v0.1.0) (2025-12-08)


### Bug Fixes

* **default-theme:** 修复tooltip悬浮窗触发异常的问题 ad0716d
* **hooks:** 修复加载状态异常的问题 6ac6680
* **placeholder:** 修复加载状态组件共享的问题 21ce0d5


### Features

* **useDemoBox:** 导出useDemoBox c2697ab

## 0.0.1 (2025-11-29)


### Bug Fixes

* 添加对正则表达式的兼容性 a9d8919
* 修复eslint报错 afc3a1e
* **default-theme:** 移除css变量,使用文档的主题 7c08668
* **demo-block:** 修复代码无法正常显示的错误 5552e12
* **dts:** 修复产生的类型错误 7a3d5e5
* **dts:** 修复类型文件错误 1fe468c
* **theme-default:** 修复默认主题样式 3d49d61


### Features

* **default-theme:** 新增默认主题 2a051cc
* **dts:** 添加类型声明 acaa0fe
* init project d9d6958
* **plugin:** 支持markdown-it-container插件 eb79541
