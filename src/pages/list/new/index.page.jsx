import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { BackButton } from '~/components/BackButton'
import './index.css'
import { createList, setCurrentList } from '~/store/list/index'
import { useId } from '~/hooks/useId'
import Input from '~/components/ui/Input'
import FormActions from '~/components/ui/FormActions'

const NewList = () => {
  const id = useId()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [title, setTitle] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = useCallback(
    event => {
      event.preventDefault()

      setIsSubmitting(true)

      void dispatch(createList({ title }))
        .unwrap()
        .then(listId => {
          dispatch(setCurrentList(listId))
          navigate(`/`)
        })
        .catch(err => {
          setErrorMessage(err.message)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [title, dispatch, navigate]
  )

  return (
    <main className='new_list'>
      <BackButton />
      <h2 className='new_list__title'>New List</h2>
      <p className='new_list__error'>{errorMessage}</p>
      <form className='new_list__form' onSubmit={onSubmit}>
        <fieldset className='new_list__form_field'>
          <label htmlFor={`${id}-title`} className='new_list__form_label'>
            Name
          </label>
          <Input
            id={`${id}-title`}
            placeholder='Family'
            value={title}
            onChange={event => setTitle(event.target.value)}
          />
        </fieldset>
        <FormActions
          onCancel={() => navigate('/')}
          isSubmitting={isSubmitting}
          submitText='Create'
          cancelText='Cancel'
          showDelete={false}
          className='new_list__form_actions'
        />
      </form>
    </main>
  )
}

export default NewList
