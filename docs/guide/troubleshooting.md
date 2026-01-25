# 故障排查

## Affix/Sticky 组件在 demo 中失效

现在 demo 预览容器默认上加了 `overflow-x: auto`样式，浏览器会把该容器视为“可滚动容器”。很多 Affix/Sticky 类组件会绑定到最近的可滚动父容器，从而导致：

- `target` 看起来失效
- 组件固定位置异常（例如固定在页面底部）

但是对大部分组件来说超出容器部分滚动都是没有问题的，因此插件还是默认保留了这个样式，当你在预览此类组件时可以通过CSS取消掉这个“可滚动容器”，比如：

```css
.vitepress-ep-demo-plugin__container>.vitepress-ep-demo-plugin-preview:has(.el-affix) {
  overflow-x: unset;
}
```
