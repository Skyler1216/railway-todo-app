import { useCallback, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Modal } from '~/components/Modal'
import './index.css'
import { setCurrentList } from '~/store/list'
import { fetchTasks, updateTask, deleteTask } from '~/store/task'
import { useId } from '~/hooks/useId'
import Button from '~/components/ui/Button'
import Input from '~/components/ui/Input'
import Textarea from '~/components/ui/Textarea'
import { fromDateTimeLocal, toDateTimeLocal } from '~/utils/dateUtils'

const EditTask = () => {
  const id = useId()

  const { listId, taskId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)
  const [limit, setLimit] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const task = useSelector(state =>
    state.task.tasks?.find(task => task.id === taskId)
  )

  // モーダルを閉じる処理
  const handleClose = useCallback(() => {
    navigate(`/lists/${listId}`)
  }, [navigate, listId])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDetail(task.detail)
      setDone(task.done)
      // task.limitは文字列形式なので、Dateオブジェクトに変換してからdatetime-local形式に変換
      setLimit(task.limit ? toDateTimeLocal(new Date(task.limit)) : '')
    }
  }, [task])

  useEffect(() => {
    void dispatch(setCurrentList(listId))
    void dispatch(fetchTasks())
  }, [listId, dispatch])

  const onSubmit = useCallback(
    event => {
      event.preventDefault()

      setIsSubmitting(true)

      const updateData = { id: taskId, title, detail, done }
      if (limit) {
        const limitDate = fromDateTimeLocal(limit)
        if (limitDate) {
          updateData.limit = limitDate
        }
      }

      void dispatch(updateTask(updateData))
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
    [title, taskId, detail, done, limit, dispatch, handleClose]
  )

  const handleDelete = useCallback(() => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    setIsSubmitting(true)

    void dispatch(deleteTask({ id: taskId }))
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
  }, [taskId, dispatch, handleClose])

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title='Edit Task'
      className='edit-task-modal'
    >
      <div className='edit_list'>
        <p className='edit_list__error'>{errorMessage}</p>
        <form className='edit_list__form' onSubmit={onSubmit}>
          <fieldset className='edit_list__form_field'>
            <label htmlFor={`${id}-title`} className='edit_list__form_label'>
              Title
            </label>
            <Input
              id={`${id}-title`}
              placeholder='Buy some milk'
              value={title}
              onChange={event => setTitle(event.target.value)}
            />
          </fieldset>
          <fieldset className='edit_list__form_field'>
            <label htmlFor={`${id}-detail`} className='edit_list__form_label'>
              Description
            </label>
            <Textarea
              id={`${id}-detail`}
              placeholder='Blah blah blah'
              value={detail}
              onChange={event => setDetail(event.target.value)}
            />
          </fieldset>
          <fieldset className='edit_list__form_field'>
            <label htmlFor={`${id}-done`} className='edit_list__form_label'>
              Is Done
            </label>
            <div>
              <input
                id={`${id}-done`}
                type='checkbox'
                checked={done}
                onChange={event => setDone(event.target.checked)}
              />
            </div>
          </fieldset>
          <fieldset className='edit_list__form_field'>
            <label htmlFor={`${id}-limit`} className='edit_list__form_label'>
              期限
            </label>
            <Input
              id={`${id}-limit`}
              type='datetime-local'
              value={limit}
              onChange={e => setLimit(e.target.value)}
              disabled={isSubmitting}
            />
          </fieldset>
          <div className='edit_list__form_actions'>
            <Button type='button' variant='secondary' onClick={handleClose}>
              Cancel
            </Button>
            <div className='edit_list__form_actions_spacer' />
            <Button
              type='button'
              variant='danger'
              disabled={isSubmitting}
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              Update
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default EditTask
