<script lang="ts" setup>
import {
  CodeOpenIcon,
  CodeCloseIcon,
  CopyIcon,
  FoldIcon,
  CodeSandboxIcon,
  StackblitzIcon,
  GithubIcon,
  GitlabIcon,
} from './icons/index';
import { MessageService } from './message';
import Tooltip from './tooltip/index.vue';
import { useDefaultNameSpace } from '../../shared/utils/namespace';
import {
  useDemoBox,
  type VitepressDemoBoxProps,
} from '@/shared/composables/useDemoBox';
import { ComponentType } from '@/shared/constant';
import { i18n } from '@/shared/locales/i18n';

const props = withDefaults(defineProps<VitepressDemoBoxProps>(), {
  title: '标题',
  description: '描述内容',
  visible: true,
  select: ComponentType.VUE,
  order: 'vue,react,html',
  github: '',
  gitlab: '',
  htmlWriteWay: 'write',
});

const emit = defineEmits(['mount']);

const {
  stackblitz,
  codesandbox,
  type,
  tabs,
  isCodeFold,
  setCodeFold,
  setCodeType,
  currentFiles,
  activeFile,
  currentCode,
  displayCode,
  openGithub,
  openGitlab,
  clickCodeCopy,
  htmlContainerRef,
  reactContainerRef,
  handleFileClick,
  sourceRef,
  sourceContentRef,
} = useDemoBox(props, emit, {
  onCopySuccess: () => MessageService.open(i18n.value.copySuccess),
});

const ns = useDefaultNameSpace();
</script>

<template>
  <div :class="[ns.e('container')]">
    <!-- 预览区 -->
    <section :class="[ns.bem('preview'), 'vp-raw']" :style="{ background: props.background }">
      <slot name="vue" v-if="type === 'vue'"></slot>
      <div ref="htmlContainerRef" v-else-if="type === 'html'">
        <iframe style="width: 100%; height: auto; border: none"></iframe>
      </div>
      <div ref="reactContainerRef" v-else-if="type === 'react'"></div>
    </section>
    <!-- 描述及切换 -->
    <section :class="[ns.bem('description')]">
      <div v-if="title" :class="[ns.bem('description', 'title')]">
        <div style="flex-shrink: 0">{{ title }}</div>
      </div>
      <div
        v-if="description"
        :class="[ns.bem('description', 'content')]"
        v-html="description"
      ></div>
      <div
        v-if="props.description || (!props.title && !props.description)"
        :class="[ns.bem('description', 'split-line')]"
      ></div>
      <div :class="[ns.bem('lang-tabs')]" v-if="tabs.length > 1 && visible">
        <div
          v-for="tab in tabs"
          :key="tab"
          :class="[ns.bem('tab'), type === tab && ns.bem('active-tab')]"
          @click="setCodeType?.(tab)"
        >
          {{ tab }}
        </div>
      </div>
      <div :class="[ns.bem('description', 'handle-btn')]">
        <Tooltip :content="i18n.openInStackblitz" v-if="stackblitz.show">
          <StackblitzIcon
            :code="currentCode"
            :type="type"
            :scope="scope || ''"
            :templates="stackblitz.templates || []"
          />
        </Tooltip>
        <Tooltip :content="i18n.openInCodeSandbox" v-if="codesandbox.show">
          <CodeSandboxIcon
            :code="currentCode"
            :type="type"
            :scope="scope || ''"
            :templates="codesandbox.templates || []"
          />
        </Tooltip>
        <Tooltip :content="i18n.openInGithub" v-if="github">
          <GithubIcon @click="openGithub" />
        </Tooltip>
        <Tooltip :content="i18n.openInGitlab" v-if="gitlab">
          <GitlabIcon @click="openGitlab" />
        </Tooltip>
        <Tooltip :content="i18n.collapseCode" v-if="!isCodeFold">
          <CodeCloseIcon @click="setCodeFold(true)" />
        </Tooltip>
        <Tooltip :content="i18n.expandCode" v-else>
          <CodeOpenIcon @click="setCodeFold(false)" />
        </Tooltip>
        <Tooltip :content="i18n.copyCode">
          <CopyIcon @click="clickCodeCopy" />
        </Tooltip>
      </div>
    </section>

    <!-- 代码展示区 -->
    <section :class="[ns.bem('source')]" ref="sourceRef">
      <div ref="sourceContentRef">
        <div
          :class="[ns.bem('file-tabs')]"
          v-if="Object.keys(currentFiles).length"
        >
          <div
            v-for="file in Object.keys(currentFiles)"
            :key="file"
            :class="[
              ns.bem('tab'),
              activeFile === file && ns.bem('active-tab'),
            ]"
            @click="handleFileClick(file)"
          >
            {{ file }}
          </div>
        </div>
        <pre class="language-html"><div v-html="displayCode"></div></pre>
      </div>
    </section>

    <div :class="ns.bem('fold')" v-if="!isCodeFold" @click="setCodeFold(true)">
      <FoldIcon />{{ i18n.collapseCode }}
    </div>
  </div>
</template>

<style lang="scss">
@import './style/var.scss';

html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}

.#{$defaultPrefix}__container > * {
  font-size: 14px;
}

.#{$defaultPrefix}__container {
  div[class*='language-'] {
    margin-top: 0;
    margin-bottom: 0;
    border-radius: 0;
    background: var(--coot-demo-box-code-bg);
  }
}

.#{$defaultPrefix}__container {
  width: 100%;
  border-radius: 4px;
  border: 1px solid var(--coot-demo-box-border);
  margin: 10px 0;

  .#{$defaultPrefix}-preview,
  .#{$defaultPrefix}-description,
  .#{$defaultPrefix}-source {
    width: 100%;
  }
}

.#{$defaultPrefix}__container > .#{$defaultPrefix}-preview {
  box-sizing: border-box;
  padding: 20px 20px 30px 20px;
  border-radius: 4px 4px 0 0;;
  & > p {
    margin: 0;
    padding: 0;
  }
}

.#{$defaultPrefix}__container > .#{$defaultPrefix}-description {
  position: relative;
  &:has(.#{$defaultPrefix}-description__title) {
    border-top: 1px solid var(--coot-demo-box-border);
  }
  .#{$defaultPrefix}-description__title {
    position: absolute;
    top: -12px;
    padding-inline: 8px;
    background: var(--coot-demo-box-title-bg);
    font-weight: 500;
    margin-inline-start: 12px;
    border-radius: 6px 6px 0 0;
  }

  .#{$defaultPrefix}-description__content {
    padding: 20px 20px 8px;
  }

  .#{$defaultPrefix}-description__split-line {
    border-bottom: 1px dashed var(--coot-demo-box-border);
  }

  .#{$defaultPrefix}-description__handle-btn {
    padding-top: 10px;
    padding-bottom: 10px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 16px;

    svg {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    svg:not(:last-of-type) {
      margin-right: 8px;
    }
  }
}

.#{$defaultPrefix}__container > .#{$defaultPrefix}-source {
  transition: all 0.4s ease-in-out;
  overflow: hidden;
  height: 0;

  div[class*='language-'] {
    margin-top: 0 !important;
  }

  .language-html {
    margin: 0;
    overflow-x: auto;

    .shiki {
      background-color: var(--vp-code-block-bg) !important;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
        Liberation Mono, Courier New, monospace;
      padding: 0 24px;
    }
  }
}

.#{$defaultPrefix}__container > .#{$defaultPrefix}-fold {
  position: sticky;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10;
  background-color: var(--vp-c-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 36px;
  font-size: 12px;
  column-gap: 4px;
  cursor: pointer;
  border-top: 1px solid var(--coot-demo-box-border);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.#{$defaultPrefix}-lang-tabs,
.#{$defaultPrefix}-file-tabs {
  line-height: 36px;
  display: flex;
  justify-content: center;
  column-gap: 16px;
  overflow-x: auto;

  .#{$defaultPrefix}-tab {
    cursor: pointer;
  }

  .#{$defaultPrefix}-active-tab {
    color: #1677ff;
    font-weight: 500;
  }
}

.#{$defaultPrefix}-lang-tabs {
  border-bottom: 1px dashed var(--coot-demo-box-border);
}

.#{$defaultPrefix}-file-tabs {
  border-top: 1px dashed var(--coot-demo-box-border);
}
</style>
