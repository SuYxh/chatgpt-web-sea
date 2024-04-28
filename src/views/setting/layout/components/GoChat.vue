<script setup lang='ts'>
import { NGradientText } from 'naive-ui'
import { useRouter } from 'vue-router'
import { SvgIcon } from '@/components/common'

const router = useRouter()

const skipToChat = () => {
  router.replace({
    path: '/',
  })
}
</script>

<template>
  <div class="flex items-center cursor-pointer" @click="skipToChat">
    <NGradientText class="mr-2" type="success">
      去聊天
    </NGradientText>

    <SvgIcon class="text-lg text-emerald-500" icon="teenyicons:arrow-right-outline" />
  </div>
</template>

<style>
</style>
