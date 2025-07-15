import { useEffect, useRef, useCallback } from 'react'
import './Modal.css'

export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  const modalRef = useRef(null)
  const overlayRef = useRef(null)
  const previousActiveElement = useRef(null)

  // フォーカストラップ機能
  const handleKeyDown = useCallback(
    event => {
      if (!isOpen) return

      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    },
    [isOpen, onClose]
  )

  // オーバーレイクリックでの閉じる
  const handleOverlayClick = useCallback(
    event => {
      if (event.target === overlayRef.current) {
        onClose()
      }
    },
    [onClose]
  )

  // モーダル開閉時の処理
  useEffect(() => {
    if (isOpen) {
      // モーダルが開く時
      previousActiveElement.current = document.activeElement

      // bodyのスクロールを無効化
      document.body.style.overflow = 'hidden'

      // モーダル内の最初のフォーカス可能要素にフォーカス
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (firstFocusable) {
          firstFocusable.focus()
        }
      }, 100)
    } else {
      // モーダルが閉じる時
      document.body.style.overflow = ''

      // 前のアクティブ要素にフォーカスを戻す
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }

    // クリーンアップ
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // キーボードイベントリスナー
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className='modal-overlay'
      onClick={handleOverlayClick}
      role='presentation'
    >
      <div
        ref={modalRef}
        className={`modal ${className}`}
        role='dialog'
        aria-modal='true'
        aria-labelledby='modal-title'
      >
        <div className='modal-header'>
          <h2 id='modal-title' className='modal-title'>
            {title}
          </h2>
          <button
            type='button'
            className='modal-close'
            onClick={onClose}
            aria-label='モーダルを閉じる'
          >
            ×
          </button>
        </div>
        <div className='modal-content'>{children}</div>
      </div>
    </div>
  )
}
