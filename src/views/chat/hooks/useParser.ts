import { createParser } from 'eventsource-parser'
import { ref } from 'vue'

interface ParserHooks {
  onParsing?: (data: any) => void
  onParsed?: () => void
  onError?: (message: string) => void
}

export function useParser() {
  const onParsing = ref<((data: any) => void) | null>(null)
  const onParsed = ref<(() => void) | null>(null)
  const onError = ref<((message: string) => void) | null>(null)

  // @ts-expect-error
  const parser = createParser(onParse)

  function onParse(event: { type: string; data: any }) {
    // console.log('onParse', event)

    switch (event.type) {
      case 'event':
        handleEvent(event.data)
        break
      case 'reconnect-interval':
        handleReconnectInterval(event.data)
        break
      default:
        console.warn(`Unhandled event type: ${event.type}`)
    }
  }

  function handleEvent(data: any) {
    if (data === '[DONE]') {
      handleDone()
      return
    }
    try {
      const jsonData = JSON.parse(data)
      onParsing.value?.(jsonData)
    }
    catch (e: any) {
      console.error('Error parsing event data:', e)
      onError.value?.(e.message)
    }
  }

  function handleReconnectInterval(value: any) {
    console.log('We should set reconnect interval to %d milliseconds', value)
    onError.value?.(`Reconnect interval: ${value}`)
  }

  function handleDone() {
    console.log('Parsing completed')
    onParsed.value?.()
  }

  // 解析中
  function parse({ chunk, hooks }: { chunk: string; hooks: ParserHooks }) {
    parser.feed(chunk)
    onParsing.value = hooks.onParsing || null
    onParsed.value = hooks.onParsed || null
    onError.value = hooks.onError || null
  }

  return {
    parse,
  }
}
