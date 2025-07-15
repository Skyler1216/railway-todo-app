import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { handleThunkError } from '~/utils/handleThunkError'
import axios from '~/vendor/axios'

/**
 * タスク管理の初期状態
 * - tasks: タスク一覧（配列）
 * - listId: 現在選択中のリストID
 * - isLoading: ローディング状態
 */
const initialState = {
  tasks: null,
  listId: null,
  isLoading: false,
}

/**
 * タスク管理のReduxスライス
 * タスクの作成、取得、更新、削除の状態管理を行う
 */
export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    /**
     * タスク状態をリセット（ログアウト時など）
     */
    resetTask: state => {
      state.tasks = null
      state.listId = null
      state.isLoading = false
    },

    /**
     * タスク一覧を設定（APIから取得したデータ）
     */
    setTasks: (state, action) => {
      state.tasks = action.payload
    },

    /**
     * 現在選択中のリストIDを設定
     */
    setListId: (state, action) => {
      state.listId = action.payload
    },

    /**
     * ローディング状態を設定
     */
    setTaskIsLoading: (state, action) => {
      state.isLoading = action.payload
    },

    /**
     * 新しいタスクを追加
     * 期限（limit）フィールドも含めて保存
     * 注意: limitは文字列形式で保存（Dateオブジェクトは保存しない）
     */
    addTask: (state, action) => {
      const title = action.payload.title
      const id = action.payload.id
      const detail = action.payload.detail
      const done = action.payload.done
      const limit = action.payload.limit

      state.tasks.push({ title, id, detail, done, limit })
    },

    /**
     * タスクを更新
     * 既存のタスクデータと新しいデータをマージ
     */
    mutateTask: (state, action) => {
      const id = action.payload.id
      const idx = state.tasks.findIndex(list => list.id === id)
      if (idx === -1) {
        return
      }

      state.tasks[idx] = {
        ...state.tasks[idx],
        ...action.payload,
      }
    },

    /**
     * タスクを削除
     * 指定されたIDのタスクを配列から除外
     */
    removeTask: (state, action) => {
      const id = action.payload.id

      state.tasks = state.tasks.filter(list => list.id !== id)
    },
  },
})

export const {
  resetTask,
  setTasks,
  setListId,
  setTaskIsLoading,
  addTask,
  mutateTask,
  removeTask,
} = taskSlice.actions

/**
 * タスク一覧を取得する非同期処理
 * @param {Object} options - オプション
 * @param {boolean} options.force - 強制取得フラグ（デフォルト: false）
 * @param {Object} thunkApi - Redux Toolkitのthunk API
 */
export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async ({ force = false } = {}, thunkApi) => {
    const listId = thunkApi.getState().list.current
    const currentListId = thunkApi.getState().task.listId
    const isLoading = thunkApi.getState().task.isLoading

    // 重複取得を防ぐ（同じリストIDで既に取得済み、またはローディング中）
    if (!force && (currentListId === listId || isLoading)) {
      return
    }

    // 認証チェック（トークンがない場合は処理を中断）
    if (thunkApi.getState().auth.token === null) {
      return
    }

    // ローディング開始
    thunkApi.dispatch(setTaskIsLoading(true))

    try {
      // APIからタスク一覧を取得
      const res = await axios.get(`/lists/${listId}/tasks`)

      // 取得したタスク一覧を状態に保存
      thunkApi.dispatch(setTasks(res.data.tasks || []))

      // 現在のリストIDを保存
      thunkApi.dispatch(setListId(listId))
    } catch (e) {
      // エラーハンドリング
      handleThunkError(e, thunkApi)
    } finally {
      // ローディング終了
      thunkApi.dispatch(setTaskIsLoading(false))
    }
  }
)

/**
 * 新しいタスクを作成する非同期処理
 * @param {Object} payload - タスクデータ
 * @param {string} payload.title - タスクタイトル
 * @param {string} payload.detail - タスク詳細
 * @param {boolean} payload.done - 完了状態
 * @param {Date} payload.limit - 期限（オプション）
 * @param {Object} thunkApi - Redux Toolkitのthunk API
 */
export const createTask = createAsyncThunk(
  'task/createTask',
  async (payload, thunkApi) => {
    const listId = thunkApi.getState().list.current

    // リストIDがない場合は処理を中断
    if (!listId) {
      return
    }

    try {
      // API送信用のペイロードを準備
      const apiPayload = { ...payload }

      // 期限フィールドがある場合はISO 8601形式に変換
      if (payload.limit) {
        const { toISOString } = await import('~/utils/dateUtils')
        apiPayload.limit = toISOString(payload.limit)
      }

      // APIにタスク作成をリクエスト
      const res = await axios.post(`/lists/${listId}/tasks`, apiPayload)
      const id = res.data.id

      // 作成されたタスクを状態に追加
      // limitは文字列形式で保存するため、DateオブジェクトをISO文字列に変換
      const taskData = { ...payload, id }
      if (payload.limit) {
        const { toISOString } = await import('~/utils/dateUtils')
        taskData.limit = toISOString(payload.limit)
      }

      thunkApi.dispatch(addTask(taskData))
    } catch (e) {
      // エラーハンドリング
      handleThunkError(e, thunkApi)
    }
  }
)

/**
 * タスクを更新する非同期処理
 * @param {Object} payload - 更新するタスクデータ
 * @param {string} payload.id - タスクID
 * @param {string} payload.title - タスクタイトル（オプション）
 * @param {string} payload.detail - タスク詳細（オプション）
 * @param {boolean} payload.done - 完了状態（オプション）
 * @param {Date} payload.limit - 期限（オプション）
 * @param {Object} thunkApi - Redux Toolkitのthunk API
 */
export const updateTask = createAsyncThunk(
  'task/updateTask',
  async (payload, thunkApi) => {
    const listId = thunkApi.getState().list.current

    // リストIDがない場合は処理を中断
    if (!listId) {
      return
    }

    // 更新対象のタスクを現在の状態から取得
    const oldValue = thunkApi
      .getState()
      .task.tasks.find(task => task.id === payload.id)

    // タスクが見つからない場合は処理を中断
    if (!oldValue) {
      return
    }

    try {
      // 既存データと新しいデータをマージ
      const apiPayload = { ...oldValue, ...payload }

      // 期限フィールドがある場合はISO 8601形式に変換
      if (payload.limit) {
        const { toISOString } = await import('~/utils/dateUtils')
        apiPayload.limit = toISOString(payload.limit)
      }

      // APIにタスク更新をリクエスト
      await axios.put(`/lists/${listId}/tasks/${payload.id}`, apiPayload)

      // 状態を更新
      // limitは文字列形式で保存するため、DateオブジェクトをISO文字列に変換
      const updateData = { ...payload }
      if (payload.limit) {
        const { toISOString } = await import('~/utils/dateUtils')
        updateData.limit = toISOString(payload.limit)
      }

      thunkApi.dispatch(mutateTask(updateData))
    } catch (e) {
      // エラーハンドリング
      handleThunkError(e, thunkApi)
    }
  }
)

/**
 * タスクを削除する非同期処理
 * @param {Object} payload - 削除するタスクデータ
 * @param {string} payload.id - タスクID
 * @param {Object} thunkApi - Redux Toolkitのthunk API
 */
export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (payload, thunkApi) => {
    try {
      const listId = thunkApi.getState().list.current

      // リストIDがない場合は処理を中断
      if (!listId) {
        return
      }

      // APIにタスク削除をリクエスト
      await axios.delete(`/lists/${listId}/tasks/${payload.id}`)

      // 状態からタスクを削除
      thunkApi.dispatch(removeTask(payload))
    } catch (e) {
      // エラーハンドリング
      handleThunkError(e, thunkApi)
    }
  }
)
