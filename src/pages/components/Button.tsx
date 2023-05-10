type Type = 'remove' | 'default'

export const Button = ({ children, action, type }: { children: React.ReactNode, action?: () => void, type: Type }) => {
  function handleAction () {
    if (!action) return
    action()
  }
  return (
    <button
      onClick={handleAction}
      className={`grid cursor-pointer place-content-center items-center rounded-md border border-secondary-text/30 bg-sidebar px-5 py-2 text-sm font-semibold duration-100 
      ${type === 'remove'
        ? 'text-red-500 hover:border-red-400 hover:bg-red-500 hover:text-white'
        : 'hover:border-secondary-text hover:bg-secondary-text/30'}`}
    >
      <p className='h-min capitalize'>{children}</p>
    </button>
  )
}

export default Button
