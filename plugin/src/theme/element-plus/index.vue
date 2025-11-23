<script lang="ts" setup>
import type { VitepressDemoBoxProps } from "@/types";
import {
  CodeOpenIcon,
  CopyIcon,
  FoldIcon,
  CodeSandboxIcon,
  StackblitzIcon,
  GithubIcon,
  GitlabIcon,
} from './icons/index';
import { ElTooltip, ElIcon, ElMessage, ElRadioGroup, ElRadioButton, ElRadio, ElDivider, ElCollapseTransition } from 'element-plus';
import { useEpNameSpace } from '@/shared/utils/namespace';
import { useDemoBox } from '@/shared/composables/useDemoBox';
import { COMPONENT_TYPE } from '@/shared/constant';
import { i18n } from '@/shared/locales/i18n';

const props = withDefaults(defineProps<VitepressDemoBoxProps>(), {
  title: '标题',
  description: '描述内容',
  visible: true,
  select: COMPONENT_TYPE.VUE,
  order: 'vue,react,html',
  github: '',
  gitlab: '',
  htmlWriteWay: 'write',
  codeHighlights: ''
});

const emit = defineEmits(['mount']);

function onCopySuccess() {
  ElMessage.success(i18n.value.copySuccess);
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
});

const ns = useEpNameSpace();
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
      <ElDivider  v-if="title" :class="[ns.bem('description', 'title')]" content-position="left">{{ title }}</ElDivider>
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
        <ElTooltip :content="i18n.openInStackblitz" v-if="stackblitz.show">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <StackblitzIcon
              :code="currentCode"
              :type="type"
              :scope="scope || ''"
              :templates="stackblitz.templates || []"
            />
          </ElIcon>
        </ElTooltip>
        <ElTooltip :content="i18n.openInCodeSandbox" v-if="codesandbox.show">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <CodeSandboxIcon
              :code="currentCode"
              :type="type"
              :scope="scope || ''"
              :templates="codesandbox.templates || []"
            />
          </ElIcon>
        </ElTooltip>
        <ElTooltip :content="i18n.openInGithub" v-if="github">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <GithubIcon @click="openGithub" />
          </ElIcon>
        </ElTooltip>
        <ElTooltip :content="i18n.openInGitlab" v-if="gitlab">
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
                size="small"
                :key="file"
                :value="file"
              >
                {{ file }}
              </ElRadioButton>
            </ElRadioGroup>
          </div>
          <div v-html="currentCodeHtml"></div>
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

<style lang="scss">
  .#{$epPrefix}__container {
    div[class*='language-'] {
      margin-top: 0;
      margin-bottom: 0;
    }

    .language-html {
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  .#{$epPrefix}__container {
    width: 100%;
    border-radius: 4px;
    border: 1px solid var(--vp-c-divider);
    margin: 10px 0;

    .#{$epPrefix}-source {
      background-color: var(--vp-code-block-bg);
    }
  }

  .#{$epPrefix}__container>.#{$epPrefix}-preview {
    box-sizing: border-box;
    padding: 20px 20px 30px 20px;
    border-radius: 4px 4px 0 0;
    ;

    &>p {
      margin: 0;
      padding: 0;
    }
  }

  .#{$epPrefix}__container>.#{$epPrefix}-description {
    .el-divider {
      --el-border-color: var(--vp-c-divider);
    }

    .el-divider__text {
      background-color: var(--vp-c-bg);
      color: var(--vp-c-text-1);
    }

    .#{$epPrefix}-description__content {
      padding: 0 20px 20px 20px;
      font-size: 14px;
    }

    .#{$epPrefix}-description__split-line {
      border-bottom: 1px dashed var(--vp-c-divider);
    }

    .#{$epPrefix}-description__handle-btn-op-bar {
      height: 40px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 8px;
      color: var(--el-text-color-secondary, #909399);
      font-size: 16px;
    }

    .#{$epPrefix}-description__handle-btn {
      margin: 0 8px;
      cursor: pointer;
      color: var(--text-color-lighter);
      transition: .2s;
    }
  }

  .#{$epPrefix}-float-control {
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid var(--vp-c-divider);
    height: 44px;
    box-sizing: border-box;
    background-color: var(--bg-color, #fff);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    margin-top: -1px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    position: sticky;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;

    span {
      font-size: 14px;
      margin-left: 10px;
    }

    &:hover {
      color: var(--vp-brand-1);
    }
  }

  .#{$epPrefix}-lang-tabs,
  .#{$epPrefix}-file-tabs {
    padding: 4px 0;
    display: flex;
    justify-content: center;

    .el-radio__input {
      display: none;
    }
  }

  .#{$epPrefix}-lang-tabs {
    border-bottom: 1px solid var(--vp-c-divider);
  }

  .#{$epPrefix}-file-tabs {
    border-top: 1px solid var(--vp-c-divider);
  }
</style>
