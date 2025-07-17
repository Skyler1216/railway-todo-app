/**
 * 日時処理のユーティリティ関数
 *
 * このファイルは、タスクの期限機能で使用される日時関連の処理を提供します。
 * 主な機能:
 * - ISO 8601形式とDateオブジェクトの相互変換
 * - HTML5 datetime-local形式との相互変換
 * - 残り時間の計算と表示用フォーマット
 * - 期限切れ判定
 */

/**
 * ISO 8601形式（YYYY-MM-DDTHH:MM:SSZ）をDateオブジェクトに変換
 *
 * @param {string} isoString - ISO 8601形式の文字列（例: "2024-12-31T23:59:59.000Z"）
 * @returns {Date|null} Dateオブジェクト、無効な場合はnull
 *
 * 使用例:
 * parseISOString("2024-12-31T23:59:59.000Z") // → Dateオブジェクト
 * parseISOString("") // → null
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
 *
 * @param {Date} date - Dateオブジェクト
 * @returns {string} ISO 8601形式の文字列（例: "2024-12-31T23:59:59.000Z"）
 *
 * 使用例:
 * toISOString(new Date()) // → "2024-12-31T23:59:59.000Z"
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
 *
 * @param {Date} date - Dateオブジェクト
 * @returns {string} datetime-local用の文字列（例: "2024-12-31T23:59"）
 *
 * 使用例:
 * toDateTimeLocal(new Date()) // → "2024-12-31T23:59"
 */
export const toDateTimeLocal = date => {
  if (!date) return ''

  try {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // 月は0始まりなので+1
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
 *
 * @param {string} dateTimeLocal - datetime-local形式の文字列（例: "2024-12-31T23:59"）
 * @returns {Date|null} Dateオブジェクト、無効な場合はnull
 *
 * 使用例:
 * fromDateTimeLocal("2024-12-31T23:59") // → Dateオブジェクト
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
 *
 * 現在時刻と期限時刻の差分を計算し、日、時間、分に分解します。
 * 期限を過ぎている場合は期限切れフラグを立てます。
 *
 * @param {string|Date} limitDate - 期限日時（ISO文字列またはDateオブジェクト）
 * @returns {object|null} 残り日時の情報、無効な場合はnull
 *
 * 戻り値の例:
 * {
 *   isOverdue: false,    // 期限切れかどうか
 *   days: 3,            // 残り日数
 *   hours: 2,           // 残り時間（24時間制）
 *   minutes: 30,        // 残り分数
 *   totalMinutes: 4410  // 総残り分数
 * }
 */
export const calculateRemainingTime = limitDate => {
  // 期限日時をDateオブジェクトに変換
  const limit = parseISOString(limitDate)
  if (!limit) return null

  const now = new Date()
  // ミリ秒単位での差分を計算
  const diff = limit.getTime() - now.getTime()

  // 期限切れの場合
  if (diff <= 0) {
    return {
      isOverdue: true,
      days: 0,
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
    }
  }

  // 日、時間、分に分解
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)) // 日数
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) // 時間
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) // 分数
  const totalMinutes = Math.floor(diff / (1000 * 60)) // 総分数

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
 *
 * 日本語で分かりやすい形式で残り時間を表示します。
 *
 * @param {string|Date} limitDate - 期限日時
 * @returns {string} 表示用の文字列
 *
 * 表示例:
 * - "3日2時間後"（1日以上）
 * - "2時間30分後"（1日未満、1時間以上）
 * - "30分後"（1時間未満、1分以上）
 * - "まもなく期限"（1分未満）
 * - "期限切れ"（期限を過ぎている）
 */
export const formatRemainingTime = limitDate => {
  const remaining = calculateRemainingTime(limitDate)
  if (!remaining) return ''

  // 期限切れの場合
  if (remaining.isOverdue) {
    return '期限切れ'
  }

  // 日数がある場合
  if (remaining.days > 0) {
    return `${remaining.days}日${remaining.hours}時間後`
  }
  // 時間がある場合
  else if (remaining.hours > 0) {
    return `${remaining.hours}時間${remaining.minutes}分後`
  }
  // 分数がある場合
  else if (remaining.minutes > 0) {
    return `${remaining.minutes}分後`
  }
  // 1分未満の場合
  else {
    return 'まもなく期限'
  }
}

/**
 * 期限日時を表示用フォーマットに変換
 *
 * 日本語形式で期限日時を表示します。
 *
 * @param {string|Date} limitDate - 期限日時
 * @returns {string} 表示用の文字列
 *
 * 表示例:
 * - "2024年12月31日 23:59"
 * - "2024年1月1日 09:00"
 */
export const formatLimitDate = limitDate => {
  const date = parseISOString(limitDate)
  if (!date) return ''

  try {
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // 月は0始まりなので+1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0') // 2桁で0埋め
    const minutes = String(date.getMinutes()).padStart(2, '0') // 2桁で0埋め

    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  } catch {
    return ''
  }
}
