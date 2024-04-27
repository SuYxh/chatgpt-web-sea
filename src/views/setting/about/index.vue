<script setup lang='ts'>
import { NButton, NSpace } from 'naive-ui'
</script>

<template>
  <NSpace>
    <NButton>model</NButton>

    <div class="box" />
  </NSpace>
</template>

<style>
.box {
  height: 200vh;
  width: 200px;
  background-color: #eee;
}
</style>
