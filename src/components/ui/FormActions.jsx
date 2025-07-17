import Button from './Button'
import './FormActions.css'

/**
 * 汎用的なフォームアクションコンポーネント
 *
 * 機能:
 * - フォームのボタン配置を統一
 * - 様々なパターンのボタン配置に対応
 * - 送信状態の管理
 * - 削除ボタンの表示制御
 *
 * Props:
 * - onCancel: キャンセルボタンのクリックハンドラー
 * - onDelete: 削除ボタンのクリックハンドラー（オプション）
 * - isSubmitting: 送信中の状態
 * - submitText: 送信ボタンのテキスト（デフォルト: "Submit"）
 * - cancelText: キャンセルボタンのテキスト（デフォルト: "Cancel"）
 * - deleteText: 削除ボタンのテキスト（デフォルト: "Delete"）
 * - showDelete: 削除ボタンを表示するかどうか（デフォルト: false）
 * - cancelTo: キャンセルボタンをリンクにする場合のURL（オプション）
 * - className: 追加のCSSクラス（オプション）
 */
export const FormActions = ({
  onCancel,
  onDelete,
  isSubmitting = false,
  submitText = 'Submit',
  cancelText = 'Cancel',
  deleteText = 'Delete',
  showDelete = false,
  cancelTo,
  className = '',
}) => {
  return (
    <div className={`form_actions ${className}`}>
      {/* キャンセルボタン */}
      <Button
        type='button'
        variant='secondary'
        onClick={onCancel}
        to={cancelTo}
        disabled={isSubmitting}
      >
        {cancelText}
      </Button>

      {/* スペーサー */}
      <div className='form_actions_spacer' />

      {/* 削除ボタン（showDeleteがtrueの場合のみ表示） */}
      {showDelete && onDelete && (
        <Button
          type='button'
          variant='danger'
          onClick={onDelete}
          disabled={isSubmitting}
        >
          {deleteText}
        </Button>
      )}

      {/* 送信ボタン */}
      <Button type='submit' disabled={isSubmitting}>
        {submitText}
      </Button>
    </div>
  )
}

export default FormActions
