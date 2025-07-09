import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '~/store/auth'

export const useLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const loginUser = useCallback(
    async payload => {
      try {
        await dispatch(login(payload)).unwrap()
        navigate('/')
      } catch (e) {
        // エラーハンドリングは既にlogin内で行われている
        throw e
      }
    },
    [dispatch, navigate]
  )

  return { login: loginUser }
}
