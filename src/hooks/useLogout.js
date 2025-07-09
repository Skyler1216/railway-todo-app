import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '~/store/auth'

export const useLogout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const logoutUser = useCallback(async () => {
    await dispatch(logout()).unwrap()
    navigate('/signin')
  }, [dispatch, navigate])

  return { logout: logoutUser }
}
