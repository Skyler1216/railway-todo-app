import { forwardRef } from 'react'
import { CheckIcon } from '~/icons/CheckIcon'
import './MarkButton.css'

const MarkButton = forwardRef(
  ({ done = false, disabled = false, className = '', ...props }, ref) => {
    const baseClassName = 'ui-mark-button'
    const stateClassName = done
      ? 'ui-mark-button--complete'
      : 'ui-mark-button--incomplete'
    const combinedClassName =
      `${baseClassName} ${stateClassName} ${className}`.trim()

    return (
      <button
        ref={ref}
        type='button'
        disabled={disabled}
        className={combinedClassName}
        aria-label={done ? 'Completed' : 'Incomplete'}
        {...props}
      >
        {done ? (
          <div className='ui-mark-button__complete'>
            <CheckIcon className='ui-mark-button__complete-check' />
          </div>
        ) : (
          <div className='ui-mark-button__incomplete' />
        )}
      </button>
    )
  }
)

MarkButton.displayName = 'MarkButton'

export default MarkButton
