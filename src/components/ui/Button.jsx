import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import './Button.css'

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      disabled = false,
      type = 'button',
      to,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClassName = 'ui-button'
    const variantClassName = `ui-button--${variant}`
    const combinedClassName =
      `${baseClassName} ${variantClassName} ${className}`.trim()

    if (to) {
      return (
        <Link ref={ref} to={to} className={combinedClassName} {...props}>
          {children}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={combinedClassName}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
