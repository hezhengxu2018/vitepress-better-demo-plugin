<script lang="ts" setup>
import type { VitepressDemoBoxProps } from '@/types'
import { ElCollapseTransition, ElIcon, ElMessage, ElRadio, ElRadioButton, ElRadioGroup, ElTooltip } from 'element-plus'
import { ref, useSlots, watch } from 'vue'
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
  description: '',
  select: COMPONENT_TYPE.VUE,
  order: 'vue,react,html',
  github: '',
  gitlab: '',
  htmlWriteWay: 'write',
  scope: '',
  codeHighlights: '',
  codeFold: true,
})

const emit = defineEmits(['mount'])
const slots = useSlots()

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

const showCode = ref(!isCodeFold.value)

watch(isCodeFold, (folded) => {
  if (!folded)
    showCode.value = true
})

const ns = useEpNameSpace()

function handleSourceAfterLeave() {
  showCode.value = false
}
</script>

<template>
  <div :class="[ns.e('wrapper')]">
    <div v-if="description" :class="[ns.bem('description', 'content')]" v-html="description" />
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
      <section :class="[ns.bem('operation-area-wrapper')]">
        <div
          :class="[ns.bem('operation-area-wrapper', 'split-line')]"
        />
        <div v-if="tabs.length > 1" :class="[ns.bem('lang-tabs')]">
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
        <div :class="[ns.bem('operation-area-wrapper', 'handle-btn-op-bar')]">
          <ElTooltip v-if="stackblitz.show" :content="i18n.openInStackblitz">
            <ElIcon :class="ns.bem('operation-area-wrapper', 'handle-btn')">
              <StackblitzIcon
                :code="currentCode"
                :type="type"
                :scope="scope"
                :templates="stackblitz.templates || []"
              />
            </ElIcon>
          </ElTooltip>
          <ElTooltip v-if="codesandbox.show" :content="i18n.openInCodeSandbox">
            <ElIcon :class="ns.bem('operation-area-wrapper', 'handle-btn')">
              <CodeSandboxIcon
                :code="currentCode"
                :type="type"
                :scope="scope"
                :templates="codesandbox.templates || []"
              />
            </ElIcon>
          </ElTooltip>
          <ElTooltip v-if="github" :content="i18n.openInGithub">
            <ElIcon :class="ns.bem('operation-area-wrapper', 'handle-btn')">
              <GithubIcon @click="openGithub" />
            </ElIcon>
          </ElTooltip>
          <ElTooltip v-if="gitlab" :content="i18n.openInGitlab">
            <ElIcon :class="ns.bem('operation-area-wrapper', 'handle-btn')">
              <GitlabIcon @click="openGitlab" />
            </ElIcon>
          </ElTooltip>
          <ElTooltip :content="i18n.copyCode">
            <ElIcon :class="ns.bem('operation-area-wrapper', 'handle-btn')">
              <CopyIcon @click="clickCodeCopy" />
            </ElIcon>
          </ElTooltip>
          <ElTooltip :content="i18n.expandCode">
            <ElIcon :class="ns.bem('operation-area-wrapper', 'handle-btn')">
              <CodeOpenIcon @click="setCodeFold(!isCodeFold)" />
            </ElIcon>
          </ElTooltip>
        </div>
      </section>
      <!-- 代码展示区 -->
      <section :class="[ns.bem('source')]">
        <ElCollapseTransition @after-leave="handleSourceAfterLeave">
          <div v-show="!isCodeFold">
            <template v-if="showCode">
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
              <template v-if="type === 'vue' && slots['code-vue']">
                <slot name="code-vue" />
              </template>
              <template v-else-if="type === 'react' && slots['code-react']">
                <slot name="code-react" />
              </template>
              <template v-else-if="type === 'html' && slots['code-html']">
                <slot name="code-html" />
              </template>
              <template v-else>
                <div v-if="currentCodeHtml" v-html="currentCodeHtml" />
              </template>
            </template>
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
  </div>
</template>

<style lang="scss">
  .#{$epPrefix}-description__content {
    font-size: 14px;
  }

  .#{$epPrefix}__container {
    div[class*='language-'] {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }

    .language-html {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
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

  .#{$epPrefix}__container>.#{$epPrefix}-operation-area-wrapper {

    .#{$epPrefix}-operation-area-wrapper__content {
      padding: 0 20px 20px 20px;
      font-size: 14px;
    }

    .#{$epPrefix}-operation-area-wrapper__split-line {
      border-bottom: 1px dashed var(--vp-c-divider);
    }

    .#{$epPrefix}-operation-area-wrapper__handle-btn-op-bar {
      height: 40px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 8px;
      color: var(--el-text-color-secondary, #909399);
      font-size: 16px;
    }

    .#{$epPrefix}-operation-area-wrapper__handle-btn {
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
    background: var(--vp-c-bg);

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
