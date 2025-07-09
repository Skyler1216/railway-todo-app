import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '~/store/auth'

export const useLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const loginUser = useCallback(
    async payload => {
      await dispatch(login(payload)).unwrap()
      navigate('/')
    },
    [dispatch, navigate]
  )

  return { login: loginUser }
}
