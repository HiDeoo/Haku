import { IoExtensionPuzzleOutline } from 'react-icons/io5'

import Icon from 'components/ui/Icon'
import clst from 'styles/clst'

const Puzzle: React.FC = () => {
  const puzzleClasses = 'h-20 w-20 text-blue-600'

  const topLeftPuzzleClasses = clst(puzzleClasses, 'absolute top-0 left-0')
  const topRightPuzzleClasses = clst(puzzleClasses, 'absolute top-0 left-[3.25rem]')
  const bottomLeftPuzzleClasses = clst(puzzleClasses, 'absolute top-[3.25rem] left-0')
  const bottomRightPuzzleClasses = clst(
    puzzleClasses,
    'absolute top-[5.25rem] left-[4.75rem] rotate-[20deg] text-red-400/80'
  )

  return (
    <div className="relative h-48 w-32">
      <Icon icon={IoExtensionPuzzleOutline} className={topLeftPuzzleClasses} />
      <Icon icon={IoExtensionPuzzleOutline} className={topRightPuzzleClasses} />
      <Icon icon={IoExtensionPuzzleOutline} className={bottomLeftPuzzleClasses} />
      <Icon icon={IoExtensionPuzzleOutline} className={bottomRightPuzzleClasses} />
    </div>
  )
}

export default Puzzle
