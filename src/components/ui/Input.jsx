import { forwardRef } from 'react'
import './Input.css'

const Input = forwardRef(({ type = 'text', className = '', ...props }, ref) => {
  const baseClassName = 'ui-input'
  const combinedClassName = `${baseClassName} ${className}`.trim()

  return (
    <input ref={ref} type={type} className={combinedClassName} {...props} />
  )
})

Input.displayName = 'Input'

export default Input
