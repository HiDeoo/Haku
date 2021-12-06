import { createStitches } from '@stitches/react'
import { blueDark, greenDark, redDark, yellowDark, slateDark, blackA, whiteA } from '@radix-ui/colors'

export const { globalCss, styled } = createStitches({
  theme: {
    colors: { ...blueDark, ...greenDark, ...redDark, ...yellowDark, ...slateDark, ...blackA, ...whiteA },
  },
})
