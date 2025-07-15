import { useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { PencilIcon } from '~/icons/PencilIcon'
import MarkButton from '~/components/ui/MarkButton'
import { updateTask } from '~/store/task'
import {
  formatRemainingTime,
  formatLimitDate,
  calculateRemainingTime,
} from '~/utils/dateUtils'
import './TaskItem.css'

export const TaskItem = ({ task }) => {
  const dispatch = useDispatch()

  const { listId } = useParams()
  const { id, title, detail, done, limit } = task

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggle = useCallback(() => {
    setIsSubmitting(true)
    void dispatch(updateTask({ id, done: !done })).finally(() => {
      setIsSubmitting(false)
    })
  }, [id, done, dispatch])

  return (
    <div className='task_item'>
      <div className='task_item__title_container'>
        <MarkButton
          done={done}
          disabled={isSubmitting}
          onClick={handleToggle}
          className='task_item__mark_button'
        />
        <div className='task_item__title' data-done={done}>
          {title}
        </div>
        <div aria-hidden className='task_item__title_spacer' />
        <Link
          to={`/lists/${listId}/tasks/${id}/edit`}
          className='task_item__title_action'
        >
          <PencilIcon aria-label='Edit' />
        </Link>
      </div>
      <div className='task_item__detail'>{detail}</div>
      {limit && (
        <div className='task_item__limit'>
          <span className='task_item__limit_date'>
            {formatLimitDate(limit)}
          </span>
          <span
            className='task_item__limit_remaining'
            data-overdue={calculateRemainingTime(limit)?.isOverdue || false}
          >
            {formatRemainingTime(limit)}
          </span>
        </div>
      )}
    </div>
  )
}
