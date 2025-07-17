import { useCallback, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Modal } from '~/components/Modal'
import './index.css'
import { fetchLists, updateList, deleteList } from '~/store/list'
import { useId } from '~/hooks/useId'
import Input from '~/components/ui/Input'
import FormActions from '~/components/ui/FormActions'

const EditList = () => {
  const id = useId()

  const { listId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [title, setTitle] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const list = useSelector(state =>
    state.list.lists?.find(list => list.id === listId)
  )

  // モーダルを閉じる処理
  const handleClose = useCallback(() => {
    navigate(`/lists/${listId}`)
  }, [navigate, listId])

  useEffect(() => {
    if (list) {
      setTitle(list.title)
    }
  }, [list])

  useEffect(() => {
    void dispatch(fetchLists())
  }, [listId, dispatch])

  const onSubmit = useCallback(
    event => {
      event.preventDefault()

      setIsSubmitting(true)

      void dispatch(updateList({ id: listId, title }))
        .unwrap()
        .then(() => {
          handleClose() // モーダルを閉じる
        })
        .catch(err => {
          setErrorMessage(err.message)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [title, listId, dispatch, handleClose]
  )

  const handleDelete = useCallback(() => {
    if (!window.confirm('Are you sure you want to delete this list?')) {
      return
    }

    setIsSubmitting(true)

    void dispatch(deleteList({ id: listId }))
      .unwrap()
      .then(() => {
        navigate(`/`) // 削除後はホームに戻る
      })
      .catch(err => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }, [listId, dispatch, navigate])

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title='Edit List'
      className='edit-list-modal'
    >
      <div className='edit_list'>
        <p className='edit_list__error'>{errorMessage}</p>
        <form className='edit_list__form' onSubmit={onSubmit}>
          <fieldset className='edit_list__form_field'>
            <label htmlFor={`${id}-title`} className='edit_list__form_label'>
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
            onCancel={handleClose}
            onDelete={handleDelete}
            isSubmitting={isSubmitting}
            submitText='Update'
            cancelText='Cancel'
            deleteText='Delete'
            showDelete={true}
            className='edit_list__form_actions'
          />
        </form>
      </div>
    </Modal>
  )
}

export default EditList
