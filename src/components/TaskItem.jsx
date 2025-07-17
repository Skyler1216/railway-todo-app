import { useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { PencilIcon } from '~/icons/PencilIcon'
import MarkButton from '~/components/ui/MarkButton'
import { updateTask } from '~/store/task'
import {
  formatRemainingTime,
  formatLimitDate,
  calculateRemainingTime,
} from '~/utils/dateUtils'
import './TaskItem.css'

/**
 * タスクアイテムコンポーネント
 *
 * 機能:
 * - 個別のタスクを表示
 * - タスクの完了状態を切り替え可能
 * - タスクの編集ページへのリンク
 * - 期限の表示（期限日時と残り時間）
 * - 期限切れの視覚的表示
 *
 * Props:
 * - task: タスクオブジェクト（id, title, detail, done, limit）
 *
 * 表示内容:
 * - 完了状態のチェックボックス
 * - タスクタイトル（完了時は取り消し線）
 * - タスク詳細
 * - 期限情報（設定されている場合のみ）
 * - 編集ボタン
 */
export const TaskItem = ({ task }) => {
  const dispatch = useDispatch()

  // URLパラメータからリストIDを取得
  const { listId } = useParams()
  // タスクの各プロパティを分割代入
  const { id, title, detail, done, limit } = task

  // 送信中の状態管理（重複送信防止用）
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * タスクの完了状態を切り替える
   * チェックボックスをクリックした時に実行される
   */
  const handleToggle = useCallback(() => {
    // 送信中の状態に設定
    setIsSubmitting(true)

    // Reduxアクションでタスクの完了状態を更新
    void dispatch(updateTask({ id, done: !done })).finally(() => {
      // 処理完了後に送信中状態を解除
      setIsSubmitting(false)
    })
  }, [id, done, dispatch])

  return (
    <div className='task_item'>
      {/* タスクのタイトルエリア */}
      <div className='task_item__title_container'>
        {/* 完了状態のチェックボックス */}
        <MarkButton
          done={done}
          disabled={isSubmitting}
          onClick={handleToggle}
          className='task_item__mark_button'
        />

        {/* タスクタイトル */}
        {/* doneがtrueの場合は取り消し線を表示 */}
        <div className='task_item__title' data-done={done}>
          {title}
        </div>

        {/* スペーサー（右寄せのための空要素） */}
        <div aria-hidden className='task_item__title_spacer' />

        {/* 編集ボタン（タスク編集ページへのリンク） */}
        <Link
          to={`/lists/${listId}/tasks/${id}/edit`}
          className='task_item__title_action'
        >
          <PencilIcon aria-label='Edit' />
        </Link>
      </div>

      {/* タスク詳細 */}
      <div className='task_item__detail'>{detail}</div>

      {/* 期限情報（設定されている場合のみ表示） */}
      {limit && (
        <div className='task_item__limit'>
          {/* 期限日時（例: 2024年12月31日 23:59） */}
          <span className='task_item__limit_date'>
            {formatLimitDate(limit)}
          </span>

          {/* 残り時間（例: 3日2時間後、期限切れ） */}
          <span
            className='task_item__limit_remaining'
            data-overdue={calculateRemainingTime(limit)?.isOverdue || false}
          >
            {formatRemainingTime(limit)}
          </span>
        </div>
      )}
    </div>
  )
}
