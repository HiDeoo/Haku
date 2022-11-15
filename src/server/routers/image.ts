import { IMAGE_MAX_SIZE_IN_MEGABYTES, IMAGE_SUPPORTED_TYPES } from 'constants/image'
import { uploadToCloudinary } from 'libs/cloudinary'
import { getBytesFromMegaBytes } from 'libs/math'
import { validateBase64Image, z, zId } from 'libs/validation'
import { authProcedure, router } from 'server'

export const imageRouter = router({
  add: authProcedure
    .input(
      z.object({
        image: z.string(),
        filename: z.string(),
        referenceId: zId,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await validateBase64Image(input.image, getBytesFromMegaBytes(IMAGE_MAX_SIZE_IN_MEGABYTES), IMAGE_SUPPORTED_TYPES)

      const image = await uploadToCloudinary(ctx.user.id, input.image, input.filename, input.referenceId)

      return image
    }),
})
