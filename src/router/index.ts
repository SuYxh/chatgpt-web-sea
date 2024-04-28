import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { setupPageGuard } from './permission'
import { ChatLayout } from '@/views/chat/layout'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: ChatLayout,
    redirect: '/chat',
    children: [
      {
        path: '/chat/:uuid?',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
      },
    ],
  },
  // overview
  {
    path: '/setting',
    name: 'Setting',
    component: () => import('@/views/setting/layout/index.vue'),
    redirect: '/setting/overview',
    children: [
      {
        path: '/setting/overview',
        name: 'settingOverview',
        component: () => import('@/views/setting/overview/index.vue'),
      },
      {
        path: '/setting/model',
        name: 'settingModel',
        component: () => import('@/views/setting/model/index.vue'),
      },
      {
        path: '/setting/prompt',
        name: 'settingPrompt',
        component: () => import('@/views/setting/prompt/index.vue'),
      },
      {
        path: '/setting/about',
        name: 'settingAbout',
        component: () => import('@/views/setting/about/index.vue'),
      },
    ],
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404/index.vue'),
  },

  {
    path: '/500',
    name: '500',
    component: () => import('@/views/exception/500/index.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/404',
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}
