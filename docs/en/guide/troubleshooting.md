# Troubleshooting

## Affix/Sticky components stop working inside a demo

The demo preview container enables `overflow-x: auto` by default, so the browser treats it as a scroll container. Many Affix/Sticky components attach to the nearest scrollable ancestor, which can make:

- the `target` prop look ignored
- the component stick in the wrong place (for example, the bottom of the page)

Most demos are fine with horizontal scrolling inside the container, so the plugin keeps this style by default. If you need to preview an Affix/Sticky component, you can remove the scroll container via CSS, for example:

```css
.vitepress-ep-demo-plugin__container>.vitepress-ep-demo-plugin-preview:has(.el-affix) {
  overflow-x: unset;
}
```
