import { ListIcon } from '~/icons/ListIcon'
import './Sidebar.css'
import { Link, useLocation } from 'react-router-dom'
import { PlusIcon } from '~/icons/PlusIcon'
import { HamburgerIcon } from '~/icons/HamburgerIcon'
import { useSelector, useDispatch } from 'react-redux'
import { useLogout } from '~/hooks/useLogout'
import { useEffect, useState } from 'react'
import { fetchLists } from '~/store/list/index'

export const Sidebar = () => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const lists = useSelector(state => state.list.lists)
  const activeId = useSelector(state => state.list.current)
  const isLoggedIn = useSelector(state => state.auth.token !== null)
  const userName = useSelector(state => state.auth.user?.name)

  // リスト新規作成ページではリストをハイライトしない
  const shouldHighlight = !pathname.startsWith('/list/new')

  const { logout } = useLogout()

  useEffect(() => {
    void dispatch(fetchLists())
  }, [dispatch])

  // モバイル判定とリサイズ対応
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // モバイルメニューを閉じる
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // モバイルメニューを開く
  const openMobileMenu = () => {
    setIsMobileMenuOpen(true)
  }

  // サイドバーの内容
  const sidebarContent = (
    <>
      <Link to='/' onClick={closeMobileMenu}>
        <h1 className='sidebar__title'>Todos</h1>
      </Link>
      {isLoggedIn ? (
        <>
          {lists && (
            <div className='sidebar__lists'>
              <h2 className='sidebar__lists_title'>Lists</h2>
              <ul className='sidebar__lists_items'>
                {lists.map(listItem => (
                  <li key={listItem.id}>
                    <Link
                      data-active={shouldHighlight && listItem.id === activeId}
                      to={`/lists/${listItem.id}`}
                      className='sidebar__lists_item'
                      onClick={closeMobileMenu}
                    >
                      <ListIcon aria-hidden className='sidebar__lists_icon' />
                      {listItem.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to='/list/new'
                    className='sidebar__lists_button'
                    onClick={closeMobileMenu}
                  >
                    <PlusIcon className='sidebar__lists_plus_icon' />
                    New List...
                  </Link>
                </li>
              </ul>
            </div>
          )}
          <div className='sidebar__spacer' aria-hidden />
          <div className='sidebar__account'>
            <p className='sidebar__account_name'>{userName}</p>
            <button
              type='button'
              className='sidebar__account_logout'
              onClick={() => {
                logout()
                closeMobileMenu()
              }}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <Link
            to='/signin'
            className='sidebar__login'
            onClick={closeMobileMenu}
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

      {/* モバイルオーバーレイ */}
      {isMobile && isMobileMenuOpen && (
        <div className='mobile-overlay' onClick={closeMobileMenu} />
      )}

      {/* サイドバー */}
      <div
        className={`sidebar ${isMobile ? 'sidebar--mobile' : ''} ${isMobileMenuOpen ? 'sidebar--open' : ''}`}
      >
        {sidebarContent}
      </div>
    </>
  )
}
