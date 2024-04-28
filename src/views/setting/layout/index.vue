<script setup lang="ts">
import { NLayout, NLayoutSider, NMenu, NScrollbar, NSpace, NTooltip } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { computed, h, ref, watch } from 'vue'
import GoChat from './components/GoChat.vue'
import { SvgIcon } from '@/components/common'

function renderIcon(icon: string) {
  return () => h(SvgIcon, { icon })
}

const menuOptions = [
  {
    label: '通用设置',
    key: '/setting/overview',
    icon: renderIcon('ri:settings-4-line'),
  },
  {
    label: '模型设置',
    key: '/setting/model',
    icon: renderIcon('carbon:ai'),
  },
  {
    label: '提示词',
    key: '/setting/prompt',
    icon: renderIcon('streamline:ai-prompt-spark'),
  },
  {
    label: '关于',
    key: '/setting/about',
    icon: renderIcon('mdi:about-circle-outline'),
  },
]

const router = useRouter()
const route = useRoute()

const activeKey = ref('')

watch(() => route.path, (newVal) => {
  activeKey.value = newVal
}, { immediate: true })

const title = computed(() => menuOptions.find(v => v.key === activeKey.value)?.label)

const isModelSetting = computed(() => activeKey.value === '/setting/model')

const handleMenuSelect = (key: string) => {
  router.push(key)
}

const goHome = () => {
  router.replace('/')
}
</script>

<template>
  <NSpace vertical>
    <NLayout>
      <NLayout has-sider>
        <NLayoutSider
          bordered show-trigger collapse-mode="width" :collapsed-width="64" :width="240"
          :native-scrollbar="false" style="height: 100vh;"
        >
          <div class="layout-sider-top">
            <h1>设置</h1>
          </div>
          <NMenu
            v-model:value="activeKey"
            :collapsed-width="64" :collapsed-icon-size="22" :options="menuOptions"
            @update:value="handleMenuSelect"
          />
          <NTooltip trigger="hover">
            <template #trigger>
              <div class="go-home" @click="goHome">
                <SvgIcon style="font-size: 36px;" icon="iconamoon:home-bold" />
              </div>
            </template>
            回到首页
          </NTooltip>
        </NLayoutSider>
        <NLayout>
          <NScrollbar style="max-height: 100vh">
            <div class="layout-main-top">
              <h1 class="layout-main-top-title">
                {{ title }}
              </h1>

              <div v-if="isModelSetting" class="right-tip">
                <GoChat />
              </div>
            </div>
            <div class="layout-main">
              <router-view />
            </div>
          </NScrollbar>
        </NLayout>
      </NLayout>
    </NLayout>
  </NSpace>
</template>

<style scoped>
.layout-sider-top {
  box-sizing: border-box;
  padding: 6px 32px;
  font-size: 26px;
  font-weight: bold;
}

.layout-main {
  box-sizing: border-box;
  padding-top: 60px;
}

.layout-main-top {
  position: fixed;
  z-index: 99;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  width: calc(100vw - 240px);
  padding: 0 32px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
}

.layout-main-top-title {
  font-size: 20px;
  font-weight: bold;
}

.right-tip {
  color: #111;
}

.go-home {
  position: relative;
  z-index: 99;
  left: 100px;
  top: 60vh;
  cursor: pointer;
}
</style>
