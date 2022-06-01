import { addFolder, removeFolder, updateFolder } from 'libs/db/folder'
import { z, zAtLeastOneOf, zFolderType, zId } from 'libs/validation'
import { createRouter } from 'server'
import withAuth from 'server/middlewares/withAuth'

export const folderRouter = createRouter()
  .middleware(withAuth)
  .mutation('add', {
    input: z.object({
      name: z.string(),
      parentId: zId.nullable().optional(),
      type: zFolderType,
    }),
    async resolve({ ctx, input }) {
      const folder = await addFolder(ctx.user.id, input.type, input.name, input.parentId)

      return folder
    },
  })
  .mutation('update', {
    input: z
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
      ),
    async resolve({ ctx, input }) {
      const folder = await updateFolder(input.id, ctx.user.id, input)

      return folder
    },
  })
  .mutation('delete', {
    input: z.object({
      id: zId,
    }),
    async resolve({ ctx, input }) {
      await removeFolder(input.id, ctx.user.id)

      return
    },
  })
