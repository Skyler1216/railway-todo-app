import { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import './TaskCreateForm.css'
import MarkButton from '~/components/ui/MarkButton'
import Input from '~/components/ui/Input'
import Textarea from '~/components/ui/Textarea'
import { createTask } from '~/store/task'
import Button from '~/components/ui/Button'
import { fromDateTimeLocal } from '~/utils/dateUtils'

export const TaskCreateForm = () => {
  const dispatch = useDispatch()

  const refForm = useRef(null)
  const [elemTextarea, setElemTextarea] = useState(null)

  const [formState, setFormState] = useState('initial')

  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)
  const [limit, setLimit] = useState('')

  const handleToggle = useCallback(() => {
    setDone(prev => !prev)
  }, [])

  const handleFocus = useCallback(() => {
    setFormState('focused')
  }, [])

  const handleBlur = useCallback(() => {
    if (title || detail || limit) {
      return
    }

    setTimeout(() => {
      // フォーム内の要素がフォーカスされている場合は何もしない
      const formElement = refForm.current
      if (formElement && formElement.contains(document.activeElement)) {
        return
      }

      setFormState('initial')
      setDone(false)
    }, 100)
  }, [title, detail, limit])

  const handleDiscard = useCallback(() => {
    setTitle('')
    setDetail('')
    setLimit('')
    setFormState('initial')
    setDone(false)
  }, [])

  const onSubmit = useCallback(
    event => {
      event.preventDefault()

      setFormState('submitting')

      // limitフィールドをDateオブジェクトに変換
      const taskData = { title, detail, done }
      if (limit) {
        const limitDate = fromDateTimeLocal(limit)
        if (limitDate) {
          taskData.limit = limitDate
        }
      }

      void dispatch(createTask(taskData))
        .unwrap()
        .then(() => {
          handleDiscard()
        })
        .catch(err => {
          alert(err.message)
          setFormState('focused')
        })
    },
    [title, detail, done, limit, dispatch, handleDiscard]
  )

  useEffect(() => {
    if (!elemTextarea) {
      return
    }

    const recalcHeight = () => {
      elemTextarea.style.height = 'auto'
      elemTextarea.style.height = `${elemTextarea.scrollHeight}px`
    }

    elemTextarea.addEventListener('input', recalcHeight)
    recalcHeight()

    return () => {
      elemTextarea.removeEventListener('input', recalcHeight)
    }
  }, [elemTextarea])

  return (
    <form
      ref={refForm}
      className='task_create_form'
      onSubmit={onSubmit}
      data-state={formState}
    >
      <div className='task_create_form__title_container'>
        <MarkButton
          done={done}
          onClick={handleToggle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className='task_create_form__mark_button'
        />
        <Input
          type='text'
          className='task_create_form__title'
          placeholder='Add a new task...'
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={formState === 'submitting'}
        />
      </div>
      {formState !== 'initial' && (
        <div>
          <Textarea
            ref={setElemTextarea}
            rows={5}
            className='task_create_form__detail'
            placeholder='Add a description here...'
            value={detail}
            onChange={e => setDetail(e.target.value)}
            onBlur={handleBlur}
            disabled={formState === 'submitting'}
          />
          <div className='task_create_form__limit'>
            <label
              htmlFor='task-limit'
              className='task_create_form__limit_label'
            >
              期限
            </label>
            <Input
              id='task-limit'
              type='datetime-local'
              className='task_create_form__limit_input'
              value={limit}
              onChange={e => setLimit(e.target.value)}
              onBlur={handleBlur}
              disabled={formState === 'submitting'}
            />
          </div>
          <div className='task_create_form__actions'>
            <Button
              type='button'
              variant='secondary'
              onBlur={handleBlur}
              onClick={handleDiscard}
              disabled={
                (!title && !detail && !limit) || formState === 'submitting'
              }
            >
              Discard
            </Button>
            <div className='task_create_form__spacer' />
            <Button
              type='submit'
              onBlur={handleBlur}
              disabled={!title || !detail || formState === 'submitting'}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
