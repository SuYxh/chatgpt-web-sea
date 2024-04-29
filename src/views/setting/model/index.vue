<script lang='ts'>
import type { SelectOption } from 'naive-ui'
import { NCollapse, NCollapseItem, NInput, NSelect, NSwitch, NTooltip } from 'naive-ui'
import type { VNode } from 'vue'
import { computed, defineComponent, h } from 'vue'
import ModelChecker from './components/ModelChecker.vue'
import { useModelStore } from '@/store'
import type { PlatformConfig } from '@/store/modules/model/type'

export default defineComponent({
  components: {
    NCollapse, NCollapseItem, NInput, NSelect, NSwitch, ModelChecker,
  },
  setup() {
    const modelStore = useModelStore()
    const modelList = computed(() => {
      const models = modelStore.models.map((v) => {
        v.enable = !!v.enable
        v.defaultSelectModel = v.modelList.filter(i => i.selected === 1).map(m => m.value)
        return v
      })
      return models
    })

    const renderOption = ({ node, option }: { node: VNode; option: SelectOption }) => {
      if (option.desc) {
        return h(NTooltip, null, {
          trigger: () => node,
          default: () => `${option.desc}`,
        })
      }
      return node
    }

    const handleSelectChange = (group: string, val: any) => {
      console.log('handleSelectChange', group, val)
      modelStore.modelChange(group, val)
    }

    const handleChange = (item: PlatformConfig) => {
      modelStore.saveCurrentModel(item)
    }

    return {
      modelList, handleSelectChange, handleChange, renderOption,
    }
  },
})
</script>

<template>
  <div class="model-content">
    <div v-for="(item, index) in modelList" :key="index" class="collapse-item">
      <NCollapse default-expanded-names="1">
        <NCollapseItem name="1">
          <template #header>
            <div class="collapse-item-header">
              <img :src="item.logo" alt="" srcset="">
              <span>{{ item.platform }}</span>
            </div>
          </template>

          <template #header-extra>
            <div>
              <NSwitch v-model:value="item.enable" @click.stop="handleChange(item)" />
            </div>
          </template>

          <div class="collapse-item-content">
            <div class="config-item">
              <div class="config-left">
                <div class="title">
                  {{ item.apiKeyTitle }}
                </div>
                <div class="sub-title">
                  {{ item.apiKeyTip }}
                </div>
              </div>
              <div class="config-right">
                <NInput v-model:value="item.apikey" class="input-width" :placeholder="item.apiKeyTip" />
              </div>
            </div>

            <div class="config-item">
              <div class="config-left">
                <div class="title">
                  {{ item.baseUrlTitle }}
                </div>
                <div class="sub-title">
                  {{ item.baseUrlTip }}
                </div>
              </div>
              <div class="config-right">
                <NInput v-model:value="item.baseUrl" class="input-width" :placeholder="item.baseUrlTip" />
              </div>
            </div>

            <div class="config-item">
              <div class="config-left">
                <div class="title">
                  聊天接口地址
                </div>
                <div class="sub-title">
                  一般默认都是 /v1/chat/completions
                </div>
              </div>
              <div class="config-right">
                <NInput v-model:value="item.chatAPI" class="input-width" placeholder="请输入聊天接口" />
              </div>
            </div>

            <div class="config-item">
              <div class="config-left">
                <div class="title">
                  {{ item.modelListTitle }}
                </div>
                <div class="sub-title">
                  {{ item.modelListTip }}
                </div>
              </div>
              <div class="config-right">
                <NSelect
                  v-model:value="item.defaultSelectModel"
                  class="custom-select input-width"
                  filterable
                  multiple
                  tag
                  :options="item.modelList"
                  placeholder="请选择模型"
                  :render-option="renderOption"
                  @update:value="(val) => handleSelectChange(item.group, val)"
                />
              </div>
            </div>

            <div class="config-item">
              <div class="config-left">
                <div class="title">
                  连通性检查
                </div>
                <div class="sub-title">
                  测试 Api Key 与代理地址是否正确填写
                </div>
              </div>
              <div class="config-right">
                <!-- 检查 -->
                <ModelChecker :model-info="item" />
              </div>
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </div>
</template>

<style>
.model-content {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  padding: 32px;
}

.collapse-item {
  margin-bottom: 32px;
}

.collapse-item-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-item-header img {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.collapse-item-header span {
  font-size: 16px;
  font-weight: bold;
}

.collapse-item-content {
  padding: 24px;
  background-color:#f8f8f8;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.n-collapse .n-collapse-item .n-collapse-item__header {
  padding-left: 24px;
  padding-right: 24px;
  height: 80px;
  background-color: rgb(245, 245, 245);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-bottom: 1px solid #eee;
}

.n-collapse .n-collapse-item .n-collapse-item__content-wrapper .n-collapse-item__content-inner {
  padding-top: 0;
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.collapse-item-content :last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.title {
  font-size: 14px;
  color: #080808;
  font-weight: 500;
  margin-bottom: 8px;
}

.sub-title {
  font-size: 12px;
  color: #999999;
}

.input-width {
  min-width: 20vw;
}

.n-base-selection .n-base-selection-tags {
  max-width: 25vw;
  min-height: 40px;
  max-height: 120px;
  overflow: auto;
}

.n-tag {
  position: static;
}
</style>
