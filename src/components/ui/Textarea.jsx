import { forwardRef } from 'react'
import './Textarea.css'

const Textarea = forwardRef(({ rows = 5, className = '', ...props }, ref) => {
  const baseClassName = 'ui-textarea'
  const combinedClassName = `${baseClassName} ${className}`.trim()

  return (
    <textarea ref={ref} rows={rows} className={combinedClassName} {...props} />
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
