export function getCurrentDate() {
  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}

/**
 * 模拟 Array.prototype.findLast 方法
 * @param {Array} array - 要搜索的数组
 * @param {Function} predicate - 用于测试每个元素的函数，返回 true 表示找到匹配项
 * @returns {any} 返回数组中最后一个满足提供的测试函数的元素的值，否则返回 -1
 */
export function findLast<T>(array: T[], predicate: (item: T) => boolean): T | -1 {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return array[i]
    }
  }
  return -1 // 如果没有找到任何项，返回 -1
}
