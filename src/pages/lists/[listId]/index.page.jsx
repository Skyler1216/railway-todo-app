import { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { TaskItem } from '~/components/TaskItem'
import { TaskForm } from '~/components/TaskForm'
import Button from '~/components/ui/Button'
import { setCurrentList } from '~/store/list'
import { fetchTasks, createTask } from '~/store/task'
import './index.css'

/**
 * リストヘッダーコンポーネント
 * リスト名、未完了タスク数、編集ボタンを表示
 */
const ListHeader = ({ listName, incompleteTasksCount, listId }) => (
  <div className='tasks_list__title'>
    {listName}
    {incompleteTasksCount > 0 && (
      <span className='tasks_list__title__count'>{incompleteTasksCount}</span>
    )}
    <div className='tasks_list__title_spacer' />
    <Button to={`/lists/${listId}/edit`}>Edit...</Button>
  </div>
)

/**
 * タスク一覧コンポーネント
 * タスク作成フォームとタスクアイテム一覧を表示
 */
const TaskList = ({ tasks, onCreateTask }) => {
  // タスクが存在しない場合の表示
  if (!tasks || tasks.length === 0) {
    return (
      <div className='tasks_list__items'>
        <TaskForm mode='create' onSubmit={onCreateTask} />
        <div className='tasks_list__items__empty'>No tasks yet!</div>
      </div>
    )
  }

  // タスクが存在する場合の表示
  return (
    <div className='tasks_list__items'>
      <TaskForm mode='create' onSubmit={onCreateTask} />
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}

/**
 * ローディングコンポーネント
 * データ読み込み中の表示
 */
const LoadingSpinner = () => (
  <div className='tasks_list__loading'>
    <div className='loading-spinner'>Loading...</div>
  </div>
)

/**
 * リスト詳細ページコンポーネント
 *
 * このコンポーネントは、特定のリストの詳細を表示し、
 * そのリスト内のタスクの作成・表示・管理を行います。
 *
 * 機能:
 * - リスト名と未完了タスク数の表示
 * - タスクの新規作成
 * - タスク一覧の表示
 * - リスト編集ページへの遷移
 * - ローディング状態の管理
 * - エラーハンドリング
 *
 * URLパラメータ:
 * - listId: リストID（例: /lists/123）
 *
 * データフロー:
 * 1. URLパラメータからlistIdを取得
 * 2. Reduxストアからリスト情報とタスク一覧を取得
 * 3. 現在のリストを設定
 * 4. タスク一覧を表示
 * 5. 新規タスク作成フォームを表示
 */
const ListIndex = () => {
  // ===== URLパラメータとRedux =====

  const dispatch = useDispatch()
  const { listId } = useParams()

  // ===== ローカル状態管理 =====

  // エラーメッセージの状態
  const [errorMessage, setErrorMessage] = useState('')

  // ===== Reduxストアからのデータ取得 =====

  // ローディング状態
  const isLoading = useSelector(
    state => state.task.isLoading || state.list.isLoading
  )

  // タスク一覧
  const tasks = useSelector(state => state.task.tasks)

  // リスト名
  const listName = useSelector(state => {
    const currentId = state.list.current
    const list = state.list.lists?.find(list => list.id === currentId)
    return list?.title
  })

  // 未完了タスク数
  const incompleteTasksCount = useSelector(state => {
    return state.task.tasks?.filter(task => !task.done).length || 0
  })

  // ===== 副作用処理 =====

  /**
   * コンポーネントマウント時の初期化処理
   * 1. 現在のリストを設定
   * 2. タスク一覧を取得
   */
  useEffect(() => {
    dispatch(setCurrentList(listId))
    dispatch(fetchTasks()).unwrap()
  }, [listId, dispatch])

  // ===== イベントハンドラー =====

  /**
   * タスク作成時の処理
   * TaskFormコンポーネントから呼び出される
   *
   * @param {Object} taskData - 作成するタスクデータ
   */
  const handleCreateTask = useCallback(
    taskData => {
      // エラーメッセージをクリア
      setErrorMessage('')

      void dispatch(createTask(taskData))
        .unwrap()
        .catch(err => {
          // エラー時はエラーメッセージを設定
          setErrorMessage(err.message)
        })
    },
    [dispatch]
  )

  // ===== レンダリング =====

  // ローディング中の表示
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className='tasks_list'>
      {/* エラーメッセージ表示エリア */}
      {errorMessage && (
        <div className='tasks_list__error'>
          <p className='error-message'>{errorMessage}</p>
        </div>
      )}

      {/* リストヘッダー */}
      <ListHeader
        listName={listName}
        incompleteTasksCount={incompleteTasksCount}
        listId={listId}
      />

      {/* タスク一覧 */}
      <TaskList tasks={tasks} onCreateTask={handleCreateTask} />
    </div>
  )
}

export default ListIndex
