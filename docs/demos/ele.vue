<script setup lang="ts">
import { ElButton } from 'element-plus'
</script>

<template>
  <div class="mb-4">
    <ElButton>Default</ElButton>
    <ElButton type="primary">
      Primary
    </ElButton>
    <ElButton type="success">
      Success
    </ElButton>
    <ElButton type="info">
      Info
    </ElButton>
    <ElButton type="warning">
      Warning
    </ElButton>
    <ElButton type="danger">
      Danger
    </ElButton>
  </div>

  <div class="mb-4">
    <ElButton plain>
      Plain
    </ElButton>
    <ElButton type="primary" plain>
      Primary
    </ElButton>
    <ElButton type="success" plain>
      Success
    </ElButton>
    <ElButton type="info" plain>
      Info
    </ElButton>
    <ElButton type="warning" plain>
      Warning
    </ElButton>
    <ElButton type="danger" plain>
      Danger
    </ElButton>
  </div>

  <div class="mb-4">
    <ElButton round>
      Round
    </ElButton>
    <ElButton type="primary" round>
      Primary
    </ElButton>
    <ElButton type="success" round>
      Success
    </ElButton>
    <ElButton type="info" round>
      Info
    </ElButton>
    <ElButton type="warning" round>
      Warning
    </ElButton>
    <ElButton type="danger" round>
      Danger
    </ElButton>
  </div>
</template>

<style>
.mb-4 {
  margin-bottom: 16px;
}
</style>
