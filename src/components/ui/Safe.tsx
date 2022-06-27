import { Flex } from 'components/ui/Flex'
import { clst } from 'styles/clst'

const safeClasses = clst(
  'overflow-y-auto overflow-x-hidden',
  'supports-max:pr-[max(0px,env(safe-area-inset-right))] supports-max:pb-[max(0px,env(safe-area-inset-bottom))]'
)

export const Safe: React.FC<SafeProps> = ({ children }) => {
  return (
    <div className={safeClasses}>
      <Flex direction="col" alignItems="center" className="gap-6 p-6 xs:gap-12 xs:pb-8 md:pt-12">
        {children}
      </Flex>
    </div>
  )
}

interface SafeProps {
  children: React.ReactNode
}
