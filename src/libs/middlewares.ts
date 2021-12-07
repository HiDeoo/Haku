import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

export function withAdmin(handler: NextApiHandler) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const apiKey = req.headers['api-key']

    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).end()
    }

    return handler(req, res)
  }
}
