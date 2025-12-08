# 开发自己的包裹容器

为了方便逻辑复用，现在插件把大分部逻辑都封装在了`useDemoBox`这个hooks里，如果需要，可以通过引入这个hooks包装自己文档风格的容器。

```ts
import { useDemoBox } from 'vitepress-better-demo-plugin'
```

可以参考element-plus风格容器的实现：

```vue
<script lang="ts" setup>
import type { VitepressDemoBoxProps } from '@/types'
import { ElCollapseTransition, ElDivider, ElIcon, ElMessage, ElRadio, ElRadioButton, ElRadioGroup, ElTooltip } from 'element-plus'
import { useDemoBox } from '@/shared/composables/useDemoBox'
import { COMPONENT_TYPE } from '@/shared/constant'
import { i18n } from '@/shared/locales/i18n'
import { useEpNameSpace } from '@/shared/utils/namespace'
import {
  CodeOpenIcon,
  CodeSandboxIcon,
  CopyIcon,
  FoldIcon,
  GithubIcon,
  GitlabIcon,
  StackblitzIcon,
} from './icons/index'

const props = withDefaults(defineProps<VitepressDemoBoxProps>(), {
  title: '标题',
  description: '描述内容',
  visible: true,
  select: COMPONENT_TYPE.VUE,
  order: 'vue,react,html',
  github: '',
  gitlab: '',
  htmlWriteWay: 'write',
  codeHighlights: '',
})

const emit = defineEmits(['mount'])

function onCopySuccess() {
  ElMessage.success(i18n.value.copySuccess)
}

const {
  stackblitz,
  codesandbox,
  isCodeFold,
  setCodeFold,
  type,
  tabs,
  currentFiles,
  activeFile,
  currentCode,
  currentCodeHtml,
  openGithub,
  openGitlab,
  clickCodeCopy,
  htmlContainerRef,
  reactContainerRef,
} = useDemoBox(props, emit, {
  onCopySuccess,
})

const ns = useEpNameSpace()
</script>

<template>
  <div :class="[ns.e('container')]">
    <!-- 预览区 -->
    <section class="vp-raw" :class="[ns.bem('preview')]" :style="{ background: props.background }">
      <slot v-if="type === 'vue'" name="vue" />
      <div v-else-if="type === 'html'" ref="htmlContainerRef">
        <iframe style="width: 100%; height: auto; border: none" />
      </div>
      <div v-else-if="type === 'react'" ref="reactContainerRef" />
    </section>
    <!-- 描述及切换 -->
    <section :class="[ns.bem('description')]">
      <ElDivider v-if="title" :class="[ns.bem('description', 'title')]" content-position="left">
        {{ title }}
      </ElDivider>
      <div
        v-if="description"
        :class="[ns.bem('description', 'content')]"
        v-html="description"
      />
      <div
        v-if="props.description || (!props.title && !props.description)"
        :class="[ns.bem('description', 'split-line')]"
      />
      <div v-if="tabs.length > 1 && visible" :class="[ns.bem('lang-tabs')]">
        <ElRadioGroup v-model="type">
          <ElRadio
            v-for="tab in tabs"
            :key="tab"
            :value="tab"
          >
            {{ tab }}
          </ElRadio>
        </ElRadioGroup>
      </div>
      <div :class="[ns.bem('description', 'handle-btn-op-bar')]">
        <ElTooltip v-if="stackblitz.show" :content="i18n.openInStackblitz">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <StackblitzIcon
              :code="currentCode"
              :type="type"
              :scope="scope || ''"
              :templates="stackblitz.templates || []"
            />
          </ElIcon>
        </ElTooltip>
        <ElTooltip v-if="codesandbox.show" :content="i18n.openInCodeSandbox">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <CodeSandboxIcon
              :code="currentCode"
              :type="type"
              :scope="scope || ''"
              :templates="codesandbox.templates || []"
            />
          </ElIcon>
        </ElTooltip>
        <ElTooltip v-if="github" :content="i18n.openInGithub">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <GithubIcon @click="openGithub" />
          </ElIcon>
        </ElTooltip>
        <ElTooltip v-if="gitlab" :content="i18n.openInGitlab">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <GitlabIcon @click="openGitlab" />
          </ElIcon>
        </ElTooltip>
        <ElTooltip :content="i18n.copyCode">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <CopyIcon @click="clickCodeCopy" />
          </ElIcon>
        </ElTooltip>
        <ElTooltip :content="i18n.expandCode">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <CodeOpenIcon @click="setCodeFold(!isCodeFold)" />
          </ElIcon>
        </ElTooltip>
      </div>
    </section>
    <!-- 代码展示区 -->
    <section :class="[ns.bem('source')]">
      <ElCollapseTransition>
        <div v-show="!isCodeFold">
          <div v-if="Object.keys(currentFiles).length" :class="[ns.bem('file-tabs')]">
            <ElRadioGroup v-model="activeFile">
              <ElRadioButton
                v-for="file in Object.keys(currentFiles)"
                :key="file"
                size="small"
                :value="file"
              >
                {{ file }}
              </ElRadioButton>
            </ElRadioGroup>
          </div>
          <div v-html="currentCodeHtml" />
        </div>
      </ElCollapseTransition>

      <Transition name="el-fade-in-linear">
        <div
          v-show="!isCodeFold"
          :class="[ns.bem('float-control')]"
          tabindex="0"
          role="button"
          @click="setCodeFold(!isCodeFold)"
        >
          <ElIcon :size="16">
            <FoldIcon />
          </ElIcon>
          <span>{{ i18n.collapseCode }}</span>
        </div>
      </Transition>
    </section>
  </div>
</template>
```

目前二次开发的逻辑还不算完善，部分类型或者值没有导出，可能需要自己实现，开发完成后可以参考多主题的章节注册使用自己的容器。