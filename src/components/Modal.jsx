import { useCallback, useEffect, useRef } from 'react'
import './Modal.css'

/**
 * モーダルコンポーネント
 *
 * アクセシビリティを考慮したモーダルダイアログを提供します。
 * フォーカストラップ、キーボード操作、スクロール制御などの機能を含みます。
 *
 * @param {boolean} isOpen - モーダルの表示状態
 * @param {Function} onClose - モーダルを閉じる際のコールバック関数
 * @param {string} title - モーダルのタイトル
 * @param {React.ReactNode} children - モーダル内に表示するコンテンツ
 * @param {string} className - 追加のCSSクラス名
 */
export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  // モーダル本体のDOM要素への参照（フォーカストラップ用）
  const modalRef = useRef(null)
  // オーバーレイのDOM要素への参照（クリック判定用）
  const overlayRef = useRef(null)
  // モーダル表示前のアクティブ要素を保存（フォーカス復元用）
  const previousActiveElement = useRef(null)

  /**
   * キーボードイベントハンドラー
   *
   * フォーカストラップとEscキーによるモーダル閉じる機能を提供します。
   *
   * フォーカストラップの仕組み:
   * - Tabキー: モーダル内のフォーカス可能要素間を循環
   * - Shift+Tab: 逆順でフォーカス可能要素間を循環
   * - 最初の要素からShift+Tab: 最後の要素にフォーカス
   * - 最後の要素からTab: 最初の要素にフォーカス
   *
   * @param {KeyboardEvent} event - キーボードイベント
   */
  const handleKeyDown = useCallback(
    event => {
      // モーダルが閉じている場合は何もしない
      if (!isOpen) return

      // Escキーでモーダルを閉じる
      if (event.key === 'Escape') {
        onClose()
        return
      }

      // Tabキーによるフォーカストラップ
      if (event.key === 'Tab') {
        // モーダル内のフォーカス可能要素を取得
        // button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        // フォーカス可能要素がない場合は何もしない
        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          // Shift + Tab: 逆順でフォーカス移動
          if (document.activeElement === firstElement) {
            event.preventDefault() // デフォルトのTab動作を防ぐ
            lastElement.focus() // 最後の要素にフォーカス
          }
        } else {
          // Tab: 順方向でフォーカス移動
          if (document.activeElement === lastElement) {
            event.preventDefault() // デフォルトのTab動作を防ぐ
            firstElement.focus() // 最初の要素にフォーカス
          }
        }
      }
    },
    [isOpen, onClose]
  )

  /**
   * オーバーレイクリックイベントハンドラー
   *
   * モーダルの外側（オーバーレイ）をクリックした時にモーダルを閉じます。
   * モーダル内をクリックした場合は閉じません。
   *
   * @param {MouseEvent} event - マウスクリックイベント
   */
  const handleOverlayClick = useCallback(
    event => {
      // クリックされた要素がオーバーレイ自体の場合のみモーダルを閉じる
      if (event.target === overlayRef.current) {
        onClose()
      }
    },
    [onClose]
  )

  /**
   * モーダル開閉時の副作用処理
   *
   * モーダルの表示・非表示に応じて以下の処理を行います：
   * - フォーカス管理（最初の要素へのフォーカス、前の要素への復元）
   * - bodyスクロールの制御（モーダル表示時は無効化）
   * - アクセシビリティの確保
   */
  useEffect(() => {
    if (isOpen) {
      // モーダルが開く時の処理

      // 現在のアクティブ要素を保存（モーダル閉じる時に復元するため）
      previousActiveElement.current = document.activeElement

      // bodyのスクロールを無効化（モーダル背景のスクロールを防ぐ）
      document.body.style.overflow = 'hidden'

      // モーダル内の最初のフォーカス可能要素にフォーカス
      // setTimeoutを使用してDOMの更新を待つ
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (firstFocusable) {
          firstFocusable.focus()
        }
      }, 100)
    } else {
      // モーダルが閉じる時の処理

      // bodyのスクロールを有効化
      document.body.style.overflow = ''

      // 前のアクティブ要素にフォーカスを戻す
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }

    // クリーンアップ関数
    // コンポーネントがアンマウントされる時にbodyスクロールを復元
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  /**
   * キーボードイベントリスナーの設定
   *
   * グローバルなキーボードイベントを監視して、
   * EscキーとTabキーの処理を行います。
   */
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) return null

  return (
    // オーバーレイ（背景の暗い部分）
    <div
      ref={overlayRef}
      className='modal-overlay'
      onClick={handleOverlayClick}
      role='presentation' // スクリーンリーダーに「装飾的な要素」として伝える
    >
      {/* モーダル本体 */}
      <div
        ref={modalRef}
        className={`modal ${className}`}
        role='dialog' // スクリーンリーダーに「ダイアログ」として伝える
        aria-modal='true' // モーダルダイアログであることを明示
        aria-labelledby='modal-title' // タイトルとの関連付け
      >
        {/* モーダルヘッダー */}
        <div className='modal-header'>
          {/* モーダルタイトル */}
          <h2 id='modal-title' className='modal-title'>
            {title}
          </h2>
          {/* 閉じるボタン */}
          <button
            type='button'
            className='modal-close'
            onClick={onClose}
            aria-label='モーダルを閉じる' // スクリーンリーダー用の説明
          >
            ×
          </button>
        </div>
        {/* モーダルコンテンツ */}
        <div className='modal-content'>{children}</div>
      </div>
    </div>
  )
}
