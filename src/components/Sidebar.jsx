import { ListIcon } from '~/icons/ListIcon'
import './Sidebar.css'
import { Link, useLocation } from 'react-router-dom'
import { PlusIcon } from '~/icons/PlusIcon'
import { HamburgerIcon } from '~/icons/HamburgerIcon'
import { useSelector, useDispatch } from 'react-redux'
import { useLogout } from '~/hooks/useLogout'
import { useEffect, useState } from 'react'
import { fetchLists } from '~/store/list/index'

/**
 * サイドバーコンポーネント
 *
 * アプリケーションのメインナビゲーションを提供します。
 * リスト一覧の表示、新規リスト作成、ユーザー認証状態の管理を行います。
 *
 * 機能:
 * - リスト一覧の表示とナビゲーション
 * - 新規リスト作成ページへのリンク
 * - ユーザー認証状態の表示
 * - ログアウト機能
 * - レスポンシブ対応（モバイル時はハンバーガーメニュー）
 *
 * レスポンシブ動作:
 * - デスクトップ: 常に表示される固定サイドバー
 * - モバイル: ハンバーガーメニューで開閉可能なオーバーレイサイドバー
 */
export const Sidebar = () => {
  // Reduxアクションをディスパッチするための関数
  const dispatch = useDispatch()

  // 現在のURLパスを取得（アクティブなリストの判定用）
  const { pathname } = useLocation()

  // モバイルメニューの開閉状態
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // モバイルデバイスかどうかの判定
  const [isMobile, setIsMobile] = useState(false)

  // ===== Reduxストアからのデータ取得 =====

  // リスト一覧データ
  const lists = useSelector(state => state.list.lists)

  // 現在選択中のリストID
  const activeId = useSelector(state => state.list.current)

  // ユーザーのログイン状態
  const isLoggedIn = useSelector(state => state.auth.token !== null)

  // ログインユーザーの名前
  const userName = useSelector(state => state.auth.user?.name)

  // リスト新規作成ページではリストをハイライトしない
  // 新規作成中は既存のリストをアクティブにしないため
  const shouldHighlight = !pathname.startsWith('/list/new')

  // ログアウト機能のフック
  const { logout } = useLogout()

  /**
   * リスト一覧を取得する副作用
   * コンポーネントマウント時にリストデータを取得
   */
  useEffect(() => {
    void dispatch(fetchLists())
  }, [dispatch])

  /**
   * モバイル判定とリサイズ対応の副作用
   * ウィンドウサイズの変更を監視してモバイル判定を更新
   */
  useEffect(() => {
    // モバイル判定関数（768px以下をモバイルとする）
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // 初期判定
    checkMobile()

    // リサイズイベントリスナーを追加
    // ユーザーがウィンドウサイズを変更するたびにcheckMobile関数が呼ばれる
    window.addEventListener('resize', checkMobile)

    // クリーンアップ: このコンポーネントが消えると、イベントリスナーを削除。メモリリークやバグの原因になる。
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // ===== モバイルメニュー制御 =====

  /**
   * モバイルメニューを閉じる
   * メニュー項目クリック時やオーバーレイクリック時に呼び出される
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  /**
   * モバイルメニューを開く
   * ハンバーガーメニューボタンクリック時に呼び出される
   */
  const openMobileMenu = () => {
    setIsMobileMenuOpen(true)
  }

  // ===== サイドバーの内容 =====

  /**
   * サイドバーのメインコンテンツ
   * デスクトップとモバイルで共通の内容を定義
   */
  const sidebarContent = (
    <>
      {/* アプリケーションタイトル */}
      {/* モバイル時：タイトルクリックでメニューが閉じる */}
      <Link to='/' onClick={closeMobileMenu}>
        <h1 className='sidebar__title'>Todos</h1>
      </Link>

      {/* ログイン状態に応じたコンテンツ表示 */}
      {isLoggedIn ? (
        <>
          {/* リスト一覧 */}
          {lists && (
            <div className='sidebar__lists'>
              <h2 className='sidebar__lists_title'>Lists</h2>
              <ul className='sidebar__lists_items'>
                {/* 既存のリスト一覧 */}
                {/* モバイル時：リスト項目クリックでメニューが閉じる */}
                {lists.map(listItem => (
                  <li key={listItem.id}>
                    <Link
                      data-active={shouldHighlight && listItem.id === activeId}
                      to={`/lists/${listItem.id}`}
                      className='sidebar__lists_item'
                      onClick={closeMobileMenu} // モバイルメニュー閉じる機能
                    >
                      <ListIcon aria-hidden className='sidebar__lists_icon' />
                      {listItem.title}
                    </Link>
                  </li>
                ))}

                {/* 新規リスト作成リンク */}
                {/* モバイル時：新規作成リンククリックでメニューが閉じる */}
                <li>
                  <Link
                    to='/list/new'
                    className='sidebar__lists_button'
                    onClick={closeMobileMenu} // モバイルメニュー閉じる機能
                  >
                    <PlusIcon className='sidebar__lists_plus_icon' />
                    New List...
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* スペーサー（フレックスレイアウトで下部に配置するため） */}
          <div className='sidebar__spacer' aria-hidden />

          {/* ユーザーアカウント情報 */}
          <div className='sidebar__account'>
            <p className='sidebar__account_name'>{userName}</p>
            {/* モバイル時：ログアウトボタンクリックでメニューが閉じる */}
            <button
              type='button'
              className='sidebar__account_logout'
              onClick={() => {
                logout()
                closeMobileMenu() // モバイルメニュー閉じる機能
              }}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          {/* 未ログイン時のログインリンク */}
          {/* モバイル時：ログインリンククリックでメニューが閉じる */}
          <Link
            to='/signin'
            className='sidebar__login'
            onClick={closeMobileMenu} // モバイルメニュー閉じる機能
          >
            Login
          </Link>
        </>
      )}
    </>
  )

  return (
    <>
      {/* ハンバーガーメニューボタン（モバイル時のみ表示） */}
      {isMobile && (
        <button
          className='mobile-menu-button'
          onClick={openMobileMenu}
          aria-label='メニューを開く'
        >
          <HamburgerIcon />
        </button>
      )}

      {/* モバイルオーバーレイ（モバイル時のみ表示） */}
      {/* メニュー外クリックでメニューを閉じるための透明なオーバーレイ */}
      {isMobile && isMobileMenuOpen && (
        <div className='mobile-overlay' onClick={closeMobileMenu} />
      )}

      {/* サイドバー本体 */}
      <div
        className={[
          'sidebar', // 基本クラス（常に適用）
          isMobile && 'sidebar--mobile', // モバイル時のみ適用
          isMobileMenuOpen && 'sidebar--open', // メニューが開いている時のみ適用
        ]
          .filter(Boolean) // falseの値を除外（条件がfalseの場合は配列から削除）
          .join(' ')} // 配列を空白区切りの文字列に結合
      >
        {sidebarContent}
      </div>
    </>
  )
}
