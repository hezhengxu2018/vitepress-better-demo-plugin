<template>
  <div v-loading="true" :class="[ns.e('container')]">
  </div>
</template>

<script setup lang="ts">
import { vLoading } from "element-plus";
import { useEpNameSpace } from '../../shared/utils/namespace';

const ns = useEpNameSpace('placeholder');
</script>

<style scoped lang="scss">
.#{$epPrefix}-placeholder__container {
  width: 100%;
  border-radius: 4px;
  border: 1px solid var(--vp-c-border);
  overflow: hidden;
  min-height: 200px;
}
</style>
