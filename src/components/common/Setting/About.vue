<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NSpin } from 'naive-ui'
import { fetchChatConfig } from '@/api'

interface ConfigState {
  timeoutMs?: number
  reverseProxy?: string
  apiModel?: string
  socksProxy?: string
  httpsProxy?: string
  usage?: string
}

const loading = ref(false)

const config = ref<ConfigState>()

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <NSpin :show="loading">
    <div class="p-4 space-y-4">
      <h2 class="text-xl font-bold">
        hello
      </h2>
      <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
        <p>
          {{ $t("setting.openSource") }}
          <a
            class="text-blue-600 dark:text-blue-500"
            href="https://github.com/SuYxh/chatgpt-web-sea"
            target="_blank"
          >
            GitHub
          </a>
          {{ $t("setting.freeMIT") }}
        </p>
        <p>
          {{ $t("setting.stars") }}
        </p>
      </div>
    </div>
  </NSpin>
</template>
