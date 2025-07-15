/**
 * 日時処理のユーティリティ関数
 */

/**
 * ISO 8601形式（YYYY-MM-DDTHH:MM:SSZ）をDateオブジェクトに変換
 * @param {string} isoString - ISO 8601形式の文字列
 * @returns {Date|null} Dateオブジェクト、無効な場合はnull
 */
export const parseISOString = isoString => {
  if (!isoString) return null

  try {
    return new Date(isoString)
  } catch {
    return null
  }
}

/**
 * DateオブジェクトをISO 8601形式に変換
 * @param {Date} date - Dateオブジェクト
 * @returns {string} ISO 8601形式の文字列
 */
export const toISOString = date => {
  if (!date) return ''

  try {
    return date.toISOString()
  } catch {
    return ''
  }
}

/**
 * HTML5 datetime-local用のフォーマット（YYYY-MM-DDTHH:MM）
 * @param {Date} date - Dateオブジェクト
 * @returns {string} datetime-local用の文字列
 */
export const toDateTimeLocal = date => {
  if (!date) return ''

  try {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}

/**
 * datetime-local形式をDateオブジェクトに変換
 * @param {string} dateTimeLocal - datetime-local形式の文字列
 * @returns {Date|null} Dateオブジェクト、無効な場合はnull
 */
export const fromDateTimeLocal = dateTimeLocal => {
  if (!dateTimeLocal) return null

  try {
    return new Date(dateTimeLocal)
  } catch {
    return null
  }
}

/**
 * 残り日時を計算
 * @param {string|Date} limitDate - 期限日時
 * @returns {object} 残り日時の情報
 */
export const calculateRemainingTime = limitDate => {
  const limit = parseISOString(limitDate)
  if (!limit) return null

  const now = new Date()
  const diff = limit.getTime() - now.getTime()

  if (diff <= 0) {
    return {
      isOverdue: true,
      days: 0,
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
    }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const totalMinutes = Math.floor(diff / (1000 * 60))

  return {
    isOverdue: false,
    days,
    hours,
    minutes,
    totalMinutes,
  }
}

/**
 * 残り日時をユーザーフレンドリーな文字列で表示
 * @param {string|Date} limitDate - 期限日時
 * @returns {string} 表示用の文字列
 */
export const formatRemainingTime = limitDate => {
  const remaining = calculateRemainingTime(limitDate)
  if (!remaining) return ''

  if (remaining.isOverdue) {
    return '期限切れ'
  }

  if (remaining.days > 0) {
    return `${remaining.days}日${remaining.hours}時間後`
  } else if (remaining.hours > 0) {
    return `${remaining.hours}時間${remaining.minutes}分後`
  } else if (remaining.minutes > 0) {
    return `${remaining.minutes}分後`
  } else {
    return 'まもなく期限'
  }
}

/**
 * 期限日時を表示用フォーマットに変換
 * @param {string|Date} limitDate - 期限日時
 * @returns {string} 表示用の文字列
 */
export const formatLimitDate = limitDate => {
  const date = parseISOString(limitDate)
  if (!date) return ''

  try {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  } catch {
    return ''
  }
}
