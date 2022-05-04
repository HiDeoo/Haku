import clst from 'styles/clst'

const safeClasses = clst(
  'overflow-y-auto overflow-x-hidden',
  'supports-max:pr-[max(0px,env(safe-area-inset-right))] supports-max:pb-[max(0px,env(safe-area-inset-bottom))]'
)

const Safe: React.FC<SafeProps> = ({ children }) => {
  return <div className={safeClasses}>{children}</div>
}

export default Safe

interface SafeProps {
  children: React.ReactNode
}
