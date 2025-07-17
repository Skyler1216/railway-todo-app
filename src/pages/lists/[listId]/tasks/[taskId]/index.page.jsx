import { useCallback, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Modal } from '~/components/Modal'
import { TaskForm } from '~/components/TaskForm'
import './index.css'
import { setCurrentList } from '~/store/list'
import { fetchTasks, updateTask, deleteTask } from '~/store/task'

/**
 * タスク編集ページコンポーネント
 *
 * このコンポーネントは、タスクの編集と削除を行うモーダルページです。
 * URLパラメータからタスクIDを取得し、該当するタスクの編集フォームを表示します。
 *
 * 機能:
 * - タスクの編集 - タイトル、詳細、完了状態、期限を変更可能
 * - タスクの削除 - 確認ダイアログ付きでタスクを削除
 * - エラーハンドリング - APIエラーをユーザーに表示
 * - ローディング状態管理 - 送信中の状態を管理
 * - モーダル表示 - モーダル内でフォームを表示
 *
 * URLパラメータ:
 * - listId: リストID（例: /lists/123/tasks/456/edit）
 * - taskId: タスクID（例: /lists/123/tasks/456/edit）
 *
 * データフロー:
 * 1. URLパラメータからlistIdとtaskIdを取得
 * 2. Reduxストアから該当するタスクデータを取得
 * 3. TaskFormコンポーネントにタスクデータを渡して編集フォームを表示
 * 4. ユーザーが編集・削除を実行
 * 5. APIを呼び出してデータを更新
 * 6. 成功時はモーダルを閉じてリストページに戻る
 */
const EditTask = () => {
  // ===== URLパラメータとナビゲーション =====

  // URLパラメータからリストIDとタスクIDを取得
  const { listId, taskId } = useParams()

  // ページ遷移用のナビゲーション関数
  const navigate = useNavigate()

  // Reduxアクションをディスパッチするための関数
  const dispatch = useDispatch()

  // ===== ローカル状態管理 =====

  // エラーメッセージの状態
  // APIエラーが発生した場合にユーザーに表示するメッセージ
  const [errorMessage, setErrorMessage] = useState('')

  // 送信中の状態
  // フォーム送信中は重複送信を防ぐためにボタンを無効化する
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ===== Reduxストアからのデータ取得 =====

  // 編集対象のタスクデータをReduxストアから取得
  // taskIdに一致するタスクを検索して取得
  const task = useSelector(state =>
    state.task.tasks?.find(task => task.id === taskId)
  )

  // ===== イベントハンドラー =====

  /**
   * モーダルを閉じる処理
   * キャンセルボタンやモーダルの外側クリック時に呼び出される
   * リストページに戻る
   */
  const handleClose = useCallback(() => {
    navigate(`/lists/${listId}`)
  }, [navigate, listId])

  // ===== 副作用処理 =====

  /**
   * コンポーネントマウント時の初期化処理
   * 1. 現在のリストを設定（Reduxストアの状態を更新）
   * 2. タスク一覧を取得（タスクデータが存在しない場合のため）
   */
  useEffect(() => {
    // 現在のリストIDをReduxストアに設定
    void dispatch(setCurrentList(listId))
    // タスク一覧を取得（タスクデータが存在しない場合のため）
    void dispatch(fetchTasks())
  }, [listId, dispatch])

  // ===== フォーム処理 =====

  /**
   * フォーム送信時の処理（タスク更新）
   * TaskFormコンポーネントから呼び出される
   *
   * @param {Object} taskData - 更新するタスクデータ
   * @param {string} taskData.id - タスクID
   * @param {string} taskData.title - タスクタイトル
   * @param {string} taskData.detail - タスク詳細
   * @param {boolean} taskData.done - 完了状態
   * @param {Date} taskData.limit - 期限（オプション）
   */
  const handleSubmit = useCallback(
    taskData => {
      // 送信中状態に設定（重複送信防止）
      setIsSubmitting(true)
      // エラーメッセージをクリア
      setErrorMessage('')

      // Reduxアクションでタスクを更新
      void dispatch(updateTask(taskData))
        .unwrap()
        .then(() => {
          // 成功時はモーダルを閉じる
          handleClose()
        })
        .catch(err => {
          // エラー時はエラーメッセージを表示
          setErrorMessage(err.message)
        })
        .finally(() => {
          // 送信中状態を解除
          setIsSubmitting(false)
        })
    },
    [dispatch, handleClose]
  )

  /**
   * 削除時の処理
   * 削除ボタンから呼び出される
   * 確認ダイアログを表示してから削除を実行
   */
  const handleDelete = useCallback(() => {
    // 削除確認ダイアログを表示
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    // 送信中状態に設定（重複送信防止）
    setIsSubmitting(true)
    // エラーメッセージをクリア
    setErrorMessage('')

    // Reduxアクションでタスクを削除
    void dispatch(deleteTask({ id: taskId }))
      .unwrap()
      .then(() => {
        // 成功時はモーダルを閉じる
        handleClose()
      })
      .catch(err => {
        // エラー時はエラーメッセージを表示
        setErrorMessage(err.message)
      })
      .finally(() => {
        // 送信中状態を解除
        setIsSubmitting(false)
      })
  }, [taskId, dispatch, handleClose])

  // ===== レンダリング =====

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title='Edit Task'
      className='edit-task-modal'
    >
      <div className='edit_list'>
        {/* エラーメッセージ表示エリア */}
        {errorMessage && <p className='edit_list__error'>{errorMessage}</p>}

        {/* タスク編集フォーム */}
        <TaskForm
          mode='edit'
          initialData={task}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          onDelete={handleDelete}
          isSubmitting={isSubmitting}
        />
      </div>
    </Modal>
  )
}

export default EditTask
