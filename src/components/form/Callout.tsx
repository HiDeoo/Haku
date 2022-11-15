import { forwardRef } from 'react'
import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri'

import { Flex } from 'components/ui/Flex'
import { Icon, type IconProps } from 'components/ui/Icon'
import { clst } from 'styles/clst'

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, icon, iconLabel, intent, message, title, ...props }, forwardedRef) => {
    const isNeutral = intent === 'neutral'
    const isSuccess = intent === 'success'
    const isError = intent === 'error'

    const calloutIcon = icon ?? (isSuccess ? RiCheckLine : RiErrorWarningLine)
    const calloutIconLabel = iconLabel ?? (isSuccess ? 'Success' : 'Error')

    const containerClasses = clst(
      'rounded-md mt-1 mb-3 pl-3 pr-4 py-2.5 border',
      isNeutral && 'text-zinc-400/75 border-0 text-center',
      isSuccess && 'bg-green-400/30 text-green-100 border-green-300/30',
      isError && 'bg-red-400/50 text-red-100 border-red-200/30',
      className
    )
    const altClasses = clst(isSuccess && 'text-green-200/100', isError && 'text-red-200/100')
    const iconContainerClasses = clst(isNeutral ? 'mb-5' : 'mt-0.5 mr-2', altClasses)
    const iconClasses = clst(isNeutral && 'h-14 w-14')
    const titleClasses = clst('block -mt-0.5 font-semibold', isNeutral ? 'text-lg mb-3' : 'text-base mb-1', altClasses)
    const messageClasses = clst(isNeutral && 'leading-relaxed')

    return (
      <>
        <Flex
          {...props}
          role="alert"
          ref={forwardedRef}
          className={containerClasses}
          direction={isNeutral ? 'col' : 'row'}
        >
          <Flex justifyContent="center" className={iconContainerClasses}>
            <Icon icon={calloutIcon} label={calloutIconLabel} className={iconClasses} />
          </Flex>
          <div className={messageClasses}>
            {title ? <strong className={titleClasses}>{title}</strong> : null}
            {message}
          </div>
        </Flex>
      </>
    )
  }
)

Callout.displayName = 'Callout'

interface CalloutProps {
  className?: string
  icon?: IconProps['icon']
  iconLabel?: string
  intent: 'success' | 'error' | 'neutral'
  message: React.ReactNode
  title?: string
}
