<script lang="ts" setup>
import { ElTable, ElTableColumn } from 'element-plus'

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]
</script>

<template>
  <ElTable :data="tableData" border stripe style="width: 100%">
    <ElTableColumn prop="date" label="Date" width="180" />
    <ElTableColumn prop="name" label="Name" width="180" />
    <ElTableColumn prop="address" label="Address" />
  </ElTable>
</template>
