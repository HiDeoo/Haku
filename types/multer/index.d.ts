import 'multer'

declare module 'multer' {
  interface Multer {
    single(fieldName: string): (req: NextApiRequest, res: NextApiResponse, callback: (err?: Error) => void) => void
    none(): (req: NextApiRequest, res: NextApiResponse, callback: (err?: Error) => void) => void
  }
}
