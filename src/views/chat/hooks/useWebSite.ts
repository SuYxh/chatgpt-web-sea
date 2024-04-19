import { fetchWebSite } from '@/api'
import { ss } from '@/utils/storage'
import { useUserStore } from '@/store'

const LOCAL_NAME = 'webSite'

export function useWebSite() {
  const user = useUserStore()
  function setLocalWebSiteData(state: any) {
    ss.set(LOCAL_NAME, state)
  }

  function updateModelData(state: any) {
    setLocalWebSiteData(state)
  }

  const getWebSite = async () => {
    const result = await fetchWebSite()
    console.log('getWebSite', result)
    if (result.status === 'Success') {
      user.updateUserInfo(result.data)
      setLocalWebSiteData(result.data)
    }
  }

  function getLocalWebSiteData(): any {
    const localState = ss.get(LOCAL_NAME) ?? {}
    return localState
  }

  function getWebSiteItem(name: string): any {
    const localState = ss.get(LOCAL_NAME) ?? {}
    return localState[name] ?? ''
  }

  return {
    getWebSiteItem,
    getWebSite,
    updateModelData,
    setLocalWebSiteData,
    getLocalWebSiteData,
  }
}
