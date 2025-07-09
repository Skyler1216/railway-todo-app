import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { signup } from '~/store/auth'

export const useSignup = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const signupUser = useCallback(
    async payload => {
      await dispatch(signup(payload)).unwrap()
      navigate('/')
    },
    [dispatch, navigate]
  )

  return { signup: signupUser }
}
