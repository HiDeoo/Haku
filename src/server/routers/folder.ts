import { addFolder, removeFolder, updateFolder } from 'libs/db/folder'
import { z, zAtLeastOneOf, zFolderType, zId } from 'libs/validation'
import { authProcedure, router } from 'server'

export const folderRouter = router({
  add: authProcedure
    .input(
      z.object({
        name: z.string(),
        parentId: zId.nullable().optional(),
        type: zFolderType,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const folder = await addFolder(ctx.user.id, input.type, input.name, input.parentId)

      return folder
    }),
  update: authProcedure
    .input(
      z
        .object({
          id: zId,
        })
        .and(
          zAtLeastOneOf(
            z.object({
              name: z.string(),
              parentId: zId.nullable(),
            })
          )
        )
    )
    .mutation(async ({ ctx, input }) => {
      const folder = await updateFolder(input.id, ctx.user.id, input)

      return folder
    }),
  delete: authProcedure
    .input(
      z.object({
        id: zId,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await removeFolder(input.id, ctx.user.id)

      return
    }),
})
