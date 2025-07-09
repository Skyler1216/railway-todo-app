import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { signup } from '~/store/auth'

export const useSignup = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const signupUser = useCallback(
    async payload => {
      try {
        await dispatch(signup(payload)).unwrap()
        navigate('/')
      } catch (e) {
        // エラーハンドリングは既にsignup内で行われている
        throw e
      }
    },
    [dispatch, navigate]
  )

  return { signup: signupUser }
}
