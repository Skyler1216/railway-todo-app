import { useSelector } from 'react-redux'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Sidebar } from '~/components/Sidebar'
import Home from '~/pages/index.page'
import NotFound from '~/pages/404'
import SignIn from '~/pages/signin/index.page'
import NewList from '~/pages/list/new/index.page'
import EditTask from '~/pages/lists/[listId]/tasks/[taskId]/index.page'
import SignUp from '~/pages/signup/index.page'
import EditList from '~/pages/lists/[listId]/edit/index.page'
import ListIndex from '~/pages/lists/[listId]/index.page'

export const Router = () => {
  const auth = useSelector(state => state.auth.token !== null)

  return (
    <BrowserRouter>
      <Sidebar />
      <div className='main_content'>
        <Routes>
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          {auth ? (
            <>
              <Route path='/' element={<Home />} />
              <Route path='/lists/:listId' element={<ListIndex />} />
              <Route path='/list/new' element={<NewList />} />
              {/* モーダル表示用のルート */}
              <Route
                path='/lists/:listId/tasks/:taskId/edit'
                element={<EditTask />}
              />
              <Route path='/lists/:listId/edit' element={<EditList />} />
            </>
          ) : (
            <Route path='*' element={<Navigate to='/signin' replace />} />
          )}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
