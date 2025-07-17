import { useCallback, useEffect, useState, useRef } from 'react'
import './TaskForm.css'
import MarkButton from '~/components/ui/MarkButton'
import Input from '~/components/ui/Input'
import Textarea from '~/components/ui/Textarea'
import Button from '~/components/ui/Button'
import FormActions from '~/components/ui/FormActions'
import { fromDateTimeLocal, toDateTimeLocal } from '~/utils/dateUtils'

/**
 * タスクフォームコンポーネント（新規作成・編集共通）
 *
 * このコンポーネントは、タスクの新規作成と編集の両方に対応する汎用的なフォームです。
 * モードによって異なるUIとロジックを提供します。
 *
 * 機能:
 * - タスクの新規作成と編集の両方に対応
 * - 展開式UI（新規作成時のみ）- フォーカス時に詳細入力欄が表示される
 * - 期限設定機能 - datetime-local形式で期限を設定可能
 * - 完了状態の切り替え - チェックボックスで完了/未完了を切り替え
 * - バリデーション - タイトルと詳細は必須項目
 * - 自動リセット - 新規作成時は送信成功後にフォームが自動リセット
 *
 * Props:
 * - mode: 'create' | 'edit' - フォームのモード（デフォルト: 'create'）
 * - initialData: 初期データ（編集時のみ）- タスクオブジェクト
 * - onSubmit: 送信時のコールバック - (taskData) => void
 * - onCancel: キャンセル時のコールバック（編集時のみ）- () => void
 * - onDelete: 削除時のコールバック（編集時のみ）- () => void
 * - isSubmitting: 送信中フラグ（デフォルト: false）
 * - className: 追加のCSSクラス（デフォルト: ''）
 *
 * 使用例:
 * // 新規作成時
 * <TaskForm mode="create" onSubmit={handleCreate} />
 *
 * // 編集時
 * <TaskForm
 *   mode="edit"
 *   initialData={task}
 *   onSubmit={handleUpdate}
 *   onCancel={handleClose}
 *   onDelete={handleDelete}
 *   isSubmitting={isSubmitting}
 * />
 */
export const TaskForm = ({
  mode = 'create',
  initialData = {},
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
  className = '',
}) => {
  // ===== 状態管理 =====

  // フォーム要素への参照（フォーカス判定用）
  // 新規作成時にフォーカスが外れた時の判定に使用
  const refForm = useRef(null)

  // テキストエリア要素への参照（高さ自動調整用）
  // 新規作成時にテキストエリアの高さを動的に調整するために使用
  const [elemTextarea, setElemTextarea] = useState(null)

  // フォームの表示状態を管理（新規作成時のみ使用）
  // 'initial': 初期状態（タイトル入力のみ表示）
  // 'focused': 詳細入力欄が表示された状態
  const [formState, setFormState] = useState('initial')

  // フォームの各フィールドの状態
  const [title, setTitle] = useState('') // タスクタイトル（必須）
  const [detail, setDetail] = useState('') // タスク詳細（必須）
  const [done, setDone] = useState(false) // 完了状態
  const [limit, setLimit] = useState('') // 期限（datetime-local形式の文字列）

  // ===== 初期化処理 =====

  // 初期データの設定（編集時のみ実行）
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setTitle(initialData.title || '')
      setDetail(initialData.detail || '')
      setDone(initialData.done || false)

      // 期限は文字列形式（ISO 8601）で保存されているので、
      // Dateオブジェクトに変換してからdatetime-local形式に変換
      setLimit(
        initialData.limit ? toDateTimeLocal(new Date(initialData.limit)) : ''
      )
    }
  }, [mode, initialData])

  // ===== イベントハンドラー =====

  /**
   * 完了状態のチェックボックスを切り替える
   * MarkButtonコンポーネントから呼び出される
   */
  const handleToggle = useCallback(() => {
    setDone(prev => !prev)
  }, [])

  /**
   * フォームにフォーカスが当たった時の処理（新規作成時のみ）
   * 詳細入力欄を表示状態にする
   */
  const handleFocus = useCallback(() => {
    if (mode === 'create') {
      setFormState('focused')
    }
  }, [mode])

  /**
   * フォームからフォーカスが外れた時の処理（新規作成時のみ）
   * 入力内容がない場合は初期状態に戻す
   *
   * 注意: フォーカス移動のタイミング調整のため、100msの遅延を設けている
   */
  const handleBlur = useCallback(() => {
    if (mode !== 'create') return

    // 何か入力されている場合は初期状態に戻さない
    if (title || detail || limit) {
      return
    }

    // 少し遅延させてから判定（フォーカス移動のタイミング調整）
    setTimeout(() => {
      // フォーム内の要素がフォーカスされている場合は何もしない
      const formElement = refForm.current
      if (formElement && formElement.contains(document.activeElement)) {
        return
      }

      // 初期状態に戻す
      setFormState('initial')
      setDone(false)
    }, 100)
  }, [mode, title, detail, limit])

  /**
   * フォームをリセットする（新規作成時のみ）
   * Discardボタンから呼び出される
   */
  const handleDiscard = useCallback(() => {
    if (mode !== 'create') return

    setTitle('')
    setDetail('')
    setLimit('')
    setFormState('initial')
    setDone(false)
  }, [mode])

  /**
   * フォーム送信時の処理
   * タスクデータを準備して親コンポーネントのコールバックを呼び出す
   *
   * @param {Event} event - フォーム送信イベント
   */
  const handleSubmit = useCallback(
    event => {
      event.preventDefault()

      // タスクデータを準備
      const taskData = { title, detail, done }

      // 期限が設定されている場合はDateオブジェクトに変換
      // APIはISO 8601形式を期待するため、Dateオブジェクトとして渡す
      if (limit) {
        const limitDate = fromDateTimeLocal(limit)
        if (limitDate) {
          taskData.limit = limitDate
        }
      }

      // 編集時はIDを追加（APIでタスクを特定するため）
      if (mode === 'edit' && initialData.id) {
        taskData.id = initialData.id
      }

      // 親コンポーネントのコールバックを呼び出し
      // 新規作成時: createTaskアクションを呼び出す
      // 編集時: updateTaskアクションを呼び出す
      onSubmit(taskData)

      // 新規作成時は送信成功後にフォームをリセット
      // 編集時はモーダルが閉じられるためリセット不要
      if (mode === 'create') {
        setTitle('')
        setDetail('')
        setLimit('')
        setFormState('initial')
        setDone(false)
      }
    },
    [title, detail, done, limit, mode, initialData.id, onSubmit]
  )

  // ===== 副作用処理 =====

  /**
   * テキストエリアの高さを自動調整する（新規作成時のみ）
   * 入力内容に応じてテキストエリアの高さを動的に変更
   *
   * 注意: 編集時は固定高さのため、この処理は不要
   */
  useEffect(() => {
    if (mode !== 'create' || !elemTextarea) {
      return
    }

    const recalcHeight = () => {
      // 一旦高さをリセット（autoにすることで実際の内容に合わせて計算される）
      elemTextarea.style.height = 'auto'
      // スクロール高さに合わせて高さを設定
      elemTextarea.style.height = `${elemTextarea.scrollHeight}px`
    }

    // 入力時に高さを再計算
    elemTextarea.addEventListener('input', recalcHeight)
    // 初期表示時にも高さを計算
    recalcHeight()

    // クリーンアップ: イベントリスナーを削除
    return () => {
      elemTextarea.removeEventListener('input', recalcHeight)
    }
  }, [elemTextarea, mode])

  // ===== レンダリング =====

  // 新規作成時の展開式UI
  if (mode === 'create') {
    return (
      <form
        ref={refForm}
        className={`task_form task_form--create ${className}`}
        onSubmit={handleSubmit}
        data-state={formState}
      >
        {/* タイトル入力エリア - 常に表示 */}
        <div className='task_form__title_container'>
          {/* 完了状態のチェックボックス */}
          <MarkButton
            done={done}
            onClick={handleToggle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className='task_form__mark_button'
          />
          {/* タスクタイトル入力フィールド */}
          <Input
            type='text'
            className='task_form__title'
            placeholder='Add a new task...'
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isSubmitting}
          />
        </div>

        {/* 詳細入力エリア（フォーカス時のみ表示） */}
        {formState !== 'initial' && (
          <div>
            {/* タスク詳細入力フィールド */}
            <Textarea
              ref={setElemTextarea}
              rows={5}
              className='task_form__detail'
              placeholder='Add a description here...'
              value={detail}
              onChange={e => setDetail(e.target.value)}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />

            {/* 期限設定エリア */}
            <div className='task_form__limit'>
              <label htmlFor='task-limit' className='task_form__limit_label'>
                期限
              </label>
              <Input
                id='task-limit'
                type='datetime-local'
                className='task_form__limit_input'
                value={limit}
                onChange={e => setLimit(e.target.value)}
                onBlur={handleBlur}
                disabled={isSubmitting}
              />
            </div>

            {/* アクションボタンエリア */}
            <div className='task_form__actions'>
              {/* キャンセルボタン - 入力内容をクリアして初期状態に戻す */}
              <Button
                type='button'
                variant='secondary'
                onBlur={handleBlur}
                onClick={handleDiscard}
                disabled={(!title && !detail && !limit) || isSubmitting}
              >
                Discard
              </Button>
              <div className='task_form__spacer' />
              {/* 追加ボタン - タイトルと詳細が必須 */}
              <Button
                type='submit'
                onBlur={handleBlur}
                disabled={!title || !detail || isSubmitting}
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </form>
    )
  }

  // 編集時のモーダル内UI
  // 新規作成時と異なり、常に全フィールドが表示される
  return (
    <form
      className={`task_form task_form--edit ${className}`}
      onSubmit={handleSubmit}
    >
      {/* タイトルフィールド */}
      <fieldset className='task_form__form_field'>
        <label htmlFor='task-title' className='task_form__form_label'>
          Title
        </label>
        <Input
          id='task-title'
          placeholder='Buy some milk'
          value={title}
          onChange={event => setTitle(event.target.value)}
          disabled={isSubmitting}
        />
      </fieldset>

      {/* 詳細フィールド */}
      <fieldset className='task_form__form_field'>
        <label htmlFor='task-detail' className='task_form__form_label'>
          Description
        </label>
        <Textarea
          id='task-detail'
          placeholder='Blah blah blah'
          value={detail}
          onChange={event => setDetail(event.target.value)}
          disabled={isSubmitting}
        />
      </fieldset>

      {/* 完了状態フィールド */}
      <fieldset className='task_form__form_field'>
        <label htmlFor='task-done' className='task_form__form_label'>
          Is Done
        </label>
        <div>
          <input
            id='task-done'
            type='checkbox'
            checked={done}
            onChange={event => setDone(event.target.checked)}
            disabled={isSubmitting}
          />
        </div>
      </fieldset>

      {/* 期限フィールド */}
      <fieldset className='task_form__form_field'>
        <label htmlFor='task-limit' className='task_form__form_label'>
          期限
        </label>
        <Input
          id='task-limit'
          type='datetime-local'
          value={limit}
          onChange={e => setLimit(e.target.value)}
          disabled={isSubmitting}
        />
      </fieldset>

      {/* アクションボタン群 - FormActionsコンポーネントを使用 */}
      <FormActions
        onCancel={onCancel}
        onDelete={onDelete}
        isSubmitting={isSubmitting}
        submitText='Update'
        cancelText='Cancel'
        deleteText='Delete'
        showDelete={true}
        className='task_form__form_actions'
      />
    </form>
  )
}
