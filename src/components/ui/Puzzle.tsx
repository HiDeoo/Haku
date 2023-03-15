import IconExtensionPuzzleOutline from '~icons/ion/extension-puzzle-outline'

import { Icon } from 'components/ui/Icon'
import { clst } from 'styles/clst'

export const Puzzle = ({ layout }: PuzzleProps) => {
  const puzzleClasses = 'h-20 w-20 text-blue-600'

  const topLeftPuzzleClasses = clst(puzzleClasses, 'z-10 absolute top-0 left-0')
  const topRightPuzzleClasses = clst(puzzleClasses, 'z-10 absolute top-0 left-[3.25rem]')
  const bottomLeftPuzzleClasses = clst(puzzleClasses, 'z-10 absolute top-[3.25rem] left-0')

  const bottomRightPuzzleClasses = clst(
    puzzleClasses,
    'absolute',
    layout === 'broken'
      ? 'top-[5.25rem] left-[4.75rem] rotate-[20deg] text-red-400/80'
      : 'top-[3.25rem] left-[3.25rem] text-zinc-400 [&>path]:[stroke-dasharray:25_50] [&>path]:[stroke-width:20]'
  )

  return (
    <div className="relative h-48 w-32">
      <Icon icon={IconExtensionPuzzleOutline} className={topLeftPuzzleClasses} />
      <Icon icon={IconExtensionPuzzleOutline} className={topRightPuzzleClasses} />
      <Icon icon={IconExtensionPuzzleOutline} className={bottomLeftPuzzleClasses} />
      <Icon icon={IconExtensionPuzzleOutline} className={bottomRightPuzzleClasses} />
    </div>
  )
}

export interface PuzzleProps {
  layout: 'broken' | 'incomplete'
}
