import { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import './TaskCreateForm.css'
import MarkButton from '~/components/ui/MarkButton'
import Input from '~/components/ui/Input'
import Textarea from '~/components/ui/Textarea'
import { createTask } from '~/store/task'
import Button from '~/components/ui/Button'
import { fromDateTimeLocal } from '~/utils/dateUtils'

/**
 * タスク作成フォームコンポーネント
 *
 * 機能:
 * - 新しいタスクを作成するためのフォーム
 * - 展開式のUI（初期状態はタイトル入力のみ、フォーカス時に詳細入力欄が表示）
 * - タスクの完了状態を設定可能
 * - 期限を設定可能（datetime-local形式）
 *
 * 状態管理:
 * - formState: フォームの表示状態（'initial', 'focused', 'submitting'）
 * - title: タスクタイトル
 * - detail: タスク詳細
 * - done: 完了状態
 * - limit: 期限（datetime-local形式の文字列）
 */
export const TaskCreateForm = () => {
  const dispatch = useDispatch()

  // フォーム要素への参照（フォーカス判定用）
  const refForm = useRef(null)
  // テキストエリア要素への参照（高さ自動調整用）
  const [elemTextarea, setElemTextarea] = useState(null)

  // フォームの表示状態を管理
  // 'initial': 初期状態（タイトル入力のみ）
  // 'focused': 詳細入力欄が表示された状態
  // 'submitting': 送信中
  const [formState, setFormState] = useState('initial')

  // フォームの各フィールドの状態
  const [title, setTitle] = useState('') // タスクタイトル
  const [detail, setDetail] = useState('') // タスク詳細
  const [done, setDone] = useState(false) // 完了状態
  const [limit, setLimit] = useState('') // 期限（datetime-local形式）

  /**
   * 完了状態のチェックボックスを切り替える
   */
  const handleToggle = useCallback(() => {
    setDone(prev => !prev)
  }, [])

  /**
   * フォームにフォーカスが当たった時の処理
   * 詳細入力欄を表示状態にする
   */
  const handleFocus = useCallback(() => {
    setFormState('focused')
  }, [])

  /**
   * フォームからフォーカスが外れた時の処理
   * 入力内容がない場合は初期状態に戻す
   */
  const handleBlur = useCallback(() => {
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
  }, [title, detail, limit])

  /**
   * フォームをリセットする
   * 入力内容をクリアして初期状態に戻す
   */
  const handleDiscard = useCallback(() => {
    setTitle('')
    setDetail('')
    setLimit('')
    setFormState('initial')
    setDone(false)
  }, [])

  /**
   * フォーム送信時の処理
   * 新しいタスクを作成してReduxストアに保存
   */
  const onSubmit = useCallback(
    event => {
      event.preventDefault()

      setFormState('submitting')

      // タスクデータを準備
      const taskData = { title, detail, done }

      // 期限が設定されている場合はDateオブジェクトに変換
      if (limit) {
        const limitDate = fromDateTimeLocal(limit)
        if (limitDate) {
          taskData.limit = limitDate
        }
      }

      // Reduxアクションでタスクを作成
      void dispatch(createTask(taskData))
        .unwrap()
        .then(() => {
          // 成功時はフォームをリセット
          handleDiscard()
        })
        .catch(err => {
          // エラー時はアラート表示してフォームを開いたままにする
          alert(err.message)
          setFormState('focused')
        })
    },
    [title, detail, done, limit, dispatch, handleDiscard]
  )

  /**
   * テキストエリアの高さを自動調整する
   * 入力内容に応じてテキストエリアの高さを動的に変更
   */
  useEffect(() => {
    if (!elemTextarea) {
      return
    }

    const recalcHeight = () => {
      // 一旦高さをリセット
      elemTextarea.style.height = 'auto'
      // スクロール高さに合わせて高さを設定
      elemTextarea.style.height = `${elemTextarea.scrollHeight}px`
    }

    // 入力時に高さを再計算
    elemTextarea.addEventListener('input', recalcHeight)
    // 初期表示時にも高さを計算
    recalcHeight()

    return () => {
      elemTextarea.removeEventListener('input', recalcHeight)
    }
  }, [elemTextarea])

  return (
    <form
      ref={refForm}
      className='task_create_form'
      onSubmit={onSubmit}
      data-state={formState}
    >
      {/* タイトル入力エリア */}
      <div className='task_create_form__title_container'>
        {/* 完了状態のチェックボックス */}
        <MarkButton
          done={done}
          onClick={handleToggle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className='task_create_form__mark_button'
        />
        {/* タスクタイトル入力フィールド */}
        <Input
          type='text'
          className='task_create_form__title'
          placeholder='Add a new task...'
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={formState === 'submitting'}
        />
      </div>

      {/* 詳細入力エリア（フォーカス時のみ表示） */}
      {formState !== 'initial' && (
        <div>
          {/* タスク詳細入力フィールド */}
          <Textarea
            ref={setElemTextarea}
            rows={5}
            className='task_create_form__detail'
            placeholder='Add a description here...'
            value={detail}
            onChange={e => setDetail(e.target.value)}
            onBlur={handleBlur}
            disabled={formState === 'submitting'}
          />

          {/* 期限設定エリア */}
          <div className='task_create_form__limit'>
            <label
              htmlFor='task-limit'
              className='task_create_form__limit_label'
            >
              期限
            </label>
            <Input
              id='task-limit'
              type='datetime-local'
              className='task_create_form__limit_input'
              value={limit}
              onChange={e => setLimit(e.target.value)}
              onBlur={handleBlur}
              disabled={formState === 'submitting'}
            />
          </div>

          {/* アクションボタンエリア */}
          <div className='task_create_form__actions'>
            {/* キャンセルボタン */}
            <Button
              type='button'
              variant='secondary'
              onBlur={handleBlur}
              onClick={handleDiscard}
              disabled={
                (!title && !detail && !limit) || formState === 'submitting'
              }
            >
              Discard
            </Button>
            <div className='task_create_form__spacer' />
            {/* 追加ボタン */}
            <Button
              type='submit'
              onBlur={handleBlur}
              disabled={!title || !detail || formState === 'submitting'}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
