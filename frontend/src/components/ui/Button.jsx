export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  size = 'md',
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg'

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-sm px-5 py-2.5',
  }

  const variants = {
    primary: 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-800',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700',
    success: 'bg-green-50 hover:bg-green-100 text-green-700',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}