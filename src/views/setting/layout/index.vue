<script setup lang="ts">
import { NLayout, NLayoutSider, NMenu, NScrollbar, NSpace } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { computed, h, ref, watch } from 'vue'
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
    icon: renderIcon('ri:settings-4-line'),
  },
  {
    label: '关于',
    key: '/setting/about',
    icon: renderIcon('ri:settings-4-line'),
  },
]

const router = useRouter()
const route = useRoute()

const activeKey = ref('')

watch(() => route.path, (newVal) => {
  activeKey.value = newVal
}, { immediate: true })

const title = computed(() => menuOptions.find(v => v.key === activeKey.value)?.label)

const handleMenuSelect = (key: string) => {
  console.log('key', key)
  router.push(key)
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
        </NLayoutSider>
        <NLayout>
          <NScrollbar style="max-height: 100vh">
            <div class="layout-main-top">
              <h1>{{ title }}</h1>
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
  padding: 12px;
  font-size: 26px;
  font-weight: bold;
}

.layout-main {
  box-sizing: border-box;
  padding-top: 60px;
}

.layout-main-top {
  position: fixed;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 60px;
  width: 100%;
  padding-left: 12px;
  background-color: #fff;
  z-index: 99;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}
</style>
